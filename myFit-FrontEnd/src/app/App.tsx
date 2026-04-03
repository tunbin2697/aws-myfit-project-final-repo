import '../../global.css';

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { Providers } from './providers';
import { RootNavigator } from '../navigation/RootNavigator';
import { restoreSession, handleAuthCodeCallback } from '../services/authService';
import { store } from '../store';
import { login } from '../store/authSlice';
import { getItem, deleteItem } from '../utils/storage';
import { installAlertProxy } from '../utils/notification';

installAlertProxy();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Handle OAuth callback for both web and mobile
        const handled = await handleOAuthCallback();
        if (handled) {
          setIsLoading(false);
          return;
        }

        const session = await restoreSession();
        if (session) {
          store.dispatch(login(session));
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle OAuth callback for both web and mobile
  const handleOAuthCallback = async (): Promise<boolean> => {
    let code: string | null = null;

    if (Platform.OS === 'web') {
      const parsed = new URL(window.location.href);
      code = parsed.searchParams.get('code');
    } else {
      // Mobile: check initial URL from deep link
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const parsed = new URL(initialUrl);
        code = parsed.searchParams.get('code');
      }
    }
    
    if (!code) return false;

    // Get saved codeVerifier (works for both web and mobile)
    const savedCodeVerifier = Platform.OS === 'web' 
      ? sessionStorage.getItem('pkce_code_verifier')
      : await getItem('pkce_code_verifier');
      
    if (!savedCodeVerifier) {
      console.error('No code verifier found in storage');
      // Clear URL params on web
      if (Platform.OS === 'web') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      return false;
    }

    try {
      // Remove codeVerifier from storage
      if (Platform.OS === 'web') {
        sessionStorage.removeItem('pkce_code_verifier');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        await deleteItem('pkce_code_verifier');
      }
      
      const result = await handleAuthCodeCallback(code, savedCodeVerifier);
      store.dispatch(login(result));
      return true;
    } catch (error) {
      console.error('OAuth callback failed:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f97316' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}
