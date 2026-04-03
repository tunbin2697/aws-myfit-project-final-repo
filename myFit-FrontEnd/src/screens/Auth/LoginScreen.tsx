import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri, exchangeCodeAsync, TokenResponse } from "expo-auth-session";
import { Button } from '../../components/ui/Button';
import { useAppDispatch } from '../../hooks/redux';
import { login } from '../../store/authSlice';
import { handleAuthCodeCallback, COGNITO_CONFIG, discovery, getLoginUrl } from '../../services/authService';
import { setItem } from '../../utils/storage';
import { isDevelopment } from '../../utils/env';
import { notifyAlert } from '../../utils/notification';
import { api } from '../../api/client'

WebBrowser.maybeCompleteAuthSession();


export function LoginScreen({ navigation }: any) {
  const [isExchanging, setIsExchanging] = useState(false);

  const dispatch = useAppDispatch();

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: COGNITO_CONFIG.clientId,
      redirectUri: COGNITO_CONFIG.redirectUri,
      scopes: COGNITO_CONFIG.scope.split(/[+ ]/).filter(Boolean),
      responseType: COGNITO_CONFIG.responseType as 'code',
      usePKCE: true,
      extraParams: { prompt: 'login' }
    },
    discovery
  );
  
  const testAPIcall = async () => {
    try {
          const response = await api.get('/test/health');
          return response.data;
      } catch (error) {
          console.error('Error test api:', error);
          throw error;
    }
  }

  useEffect(() => {
    testAPIcall()
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      if (code && request?.codeVerifier) {
          processLogin(code, request.codeVerifier);
      }
    } else if (response?.type === 'error') {
        notifyAlert('Login Error', response.error?.message || 'Something went wrong');
    }
  }, [response]);

  const processLogin = async (code: string, codeVerifier: string) => {
      try {
          setIsExchanging(true);
          
          const result = await handleAuthCodeCallback(code, codeVerifier);
          dispatch(login(result));
      } catch (error: any) {
          if (error.message?.includes('Network Error')) {
            notifyAlert('Connection Error', 'Could not connect to backend server. Please check your internet or server status.');
          } else {
            notifyAlert('Login Failed', error.message || 'Could not login with Cognito.');
          }
      } finally {
          setIsExchanging(false);
      }
  };

  const handleCognitoLogin = async () => {
    if (!request) return;

    // Save codeVerifier before auth (it may be lost on app reload/redirect)
    if (request.codeVerifier) {
      if (Platform.OS === 'web') {
        sessionStorage.setItem('pkce_code_verifier', request.codeVerifier);
      } else {
        await setItem('pkce_code_verifier', request.codeVerifier);
      }
    }

    if (Platform.OS === 'web') {
      window.location.href = getLoginUrl();
    } else {
      await promptAsync();
    }
  };


  return (
    <LinearGradient
      colors={['#f97316', '#ef4444', '#ec4899']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-4">
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className="bg-white rounded-3xl p-6 shadow-xl"
            >
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Đăng nhập
              </Text>
              <Text className="text-gray-500 mb-8">
                Chào mừng trở lại!
              </Text>

              <View className="space-y-4">
                {isExchanging ? (
                    <View className="items-center justify-center py-8">
                        <Text className="text-orange-500 text-lg">Đang đăng nhập...</Text>
                    </View>
                ) : (
                    <>
                        <Button
                        className="w-full bg-orange-500 mt-4 h-12 flex-row items-center justify-center"
                        textClassName="font-bold text-lg text-white ml-2"
                        onPress={handleCognitoLogin}
                        >
                        <LogIn color="white" size={20} />
                        <Text className="text-white font-bold text-lg ml-2">Đăng nhập với AWS Cognito</Text>
                        </Button>
                    </>
                )}
              </View>

              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-500">
                  Chưa có tài khoản?{' '}
                </Text>
                <Button variant="ghost" className="h-auto p-0" onPress={handleCognitoLogin}>
                  <Text className="text-orange-500 font-bold">
                    Đăng ký ngay
                  </Text>
                </Button>
              </View>

            </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
