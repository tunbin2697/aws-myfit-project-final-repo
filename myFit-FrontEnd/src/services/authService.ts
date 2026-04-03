import { api } from '../api/client';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { exchangeCodeAsync } from 'expo-auth-session';
import { setItem, getItem, deleteItem } from '../utils/storage';
import { Platform } from 'react-native';
import { jwtDecode } from 'jwt-decode';

interface IdTokenPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  'cognito:username'?: string;
  birthdate?: string;
  gender?: string;
  phone_number?: string;
  aud: string;
  token_use: 'id';
  iss: string;
  exp: number;
  iat: number;
}

interface UserSyncRequest {
  email: string;
  name?: string;
  picture?: string;
  username?: string;
  birthdate?: string;
  emailVerified?: boolean;
  gender?: string;
  phoneNumber?: string;
}

// Single Cognito URL source
const getClientCognitoUrl = () => {
    return process.env.EXPO_PUBLIC_COGNITO_URL;
};

const getPlatformRedirectUri = (path: 'callback' | 'logout') => {
    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.location?.origin) {
            return `${window.location.origin}/${path}`;
        }

        return Linking.createURL(path);
    }

    return Linking.createURL(path);
};

export const getRedirectUri = () => {
    return getPlatformRedirectUri('callback');
};

const getLogoutRedirectUri = () => {
    return getPlatformRedirectUri('logout');
};

const parseCognitoUrl = (url: string | undefined) => {
  if (!url) {
    return {
      domain: 'https://us-east-19aokpqzo1.auth.us-east-1.amazoncognito.com',
    	clientId: '661fm3mj7s5qcmoldri1mem9sr',
      responseType: 'code',
      scope: 'email+openid+profile',
    };
  }
  const urlObj = new URL(url);
  return {
    domain: `${urlObj.protocol}//${urlObj.host}`,
    clientId: urlObj.searchParams.get('client_id') || '',
    responseType: urlObj.searchParams.get('response_type') || 'code',
    scope: urlObj.searchParams.get('scope') || 'email+openid+profile',
  };
};

const cognitoUrlConfig = parseCognitoUrl(getClientCognitoUrl());

export const COGNITO_CONFIG = {
  domain: cognitoUrlConfig.domain,
  clientId: cognitoUrlConfig.clientId,
    get redirectUri() {
        return getRedirectUri();
    },
  responseType: cognitoUrlConfig.responseType,
  scope: cognitoUrlConfig.scope,
};

export const discovery = {
  authorizationEndpoint: `${COGNITO_CONFIG.domain}/oauth2/authorize`,
  tokenEndpoint: `${COGNITO_CONFIG.domain}/oauth2/token`,
  revocationEndpoint: `${COGNITO_CONFIG.domain}/oauth2/revoke`,
};

export const getLoginUrl = () => {
    return `${COGNITO_CONFIG.domain}/login?client_id=${COGNITO_CONFIG.clientId}&redirect_uri=${encodeURIComponent(COGNITO_CONFIG.redirectUri)}&response_type=${COGNITO_CONFIG.responseType}&scope=${COGNITO_CONFIG.scope}`;
};

interface TokenResponse {
    id_token: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

export const handleAuthCodeCallback = async (code: string, codeVerifier: string) => {
    try {
        const tokens = await exchangeCodeAsync({
            clientId: COGNITO_CONFIG.clientId,
            code,
            redirectUri: COGNITO_CONFIG.redirectUri,
            extraParams: {
                code_verifier: codeVerifier
            }
        }, discovery);
        
        await storeToken(tokens.accessToken, tokens.refreshToken, tokens.idToken);
        
        const idToken = tokens.idToken;
        if (!idToken) {
            throw new Error('ID token not received from Cognito');
        }
        
        const decodedIdToken = jwtDecode<IdTokenPayload>(idToken);
        
        const userClaims: UserSyncRequest = {
            email: decodedIdToken.email,
            name: decodedIdToken.name,
            picture: decodedIdToken.picture,
            username: decodedIdToken['cognito:username'],
            birthdate: decodedIdToken.birthdate,
            emailVerified: decodedIdToken.email_verified,
            gender: decodedIdToken.gender,
            phoneNumber: decodedIdToken.phone_number,
        };

        const userProfile = await syncUser(userClaims);
        await storeUserProfile(userProfile);
        
        return {
            user: userProfile,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    } catch (error) {
        console.error('Error handling auth callback:', error);
        throw error;
    }
};

export const exchangeCodeForToken = async (code: string): Promise<TokenResponse> => {
    const tokenUrl = `${COGNITO_CONFIG.domain}/oauth2/token`;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', COGNITO_CONFIG.clientId);
    params.append('code', code);
    params.append('redirect_uri', COGNITO_CONFIG.redirectUri);

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token exchange failed: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        throw error;
    }
};

export const syncUser = async (userClaims: UserSyncRequest) => {
    try {
        const response = await api.post('/user/sync', userClaims);
        return response.data;
    } catch (error) {
        console.error('Error syncing user:', error);
        throw error;
    }
};

export const storeToken = async (accessToken: string, refreshToken?: string, idToken?: string) => {
    try {
        await setItem('auth_token', accessToken);
        if (refreshToken) {
            await setItem('refresh_token', refreshToken);
        }
        if (idToken) {
            await setItem('id_token', idToken);
        }
    } catch (error) {
        console.error('Error storing token:', error);
    }
};

export const storeUserProfile = async (user: any) => {
    try {
        await setItem('user_profile', JSON.stringify(user));
    } catch (error) {
        console.error('Error storing user profile:', error);
    }
};

export const getUserProfileFromStorage = async () => {
    try {
        const userJson = await getItem('user_profile');
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error('Error getting user profile from storage:', error);
        return null;
    }
};

export const getToken = async () => {
    return await getItem('auth_token');
};

export const getIdToken = async () => {
    return await getItem('id_token');
};

export const getRefreshToken = async () => {
    return await getItem('refresh_token');
};

export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
            return null;
        }

        const tokenUrl = `${COGNITO_CONFIG.domain}/oauth2/token`;
        
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', COGNITO_CONFIG.clientId);
        params.append('refresh_token', refreshToken);

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            await clearTokens();
            return null;
        }

        const data = await response.json();
        await storeToken(data.access_token, refreshToken);
        
        return data.access_token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        await clearTokens();
        return null;
    }
};

export const restoreSession = async () => {
    try {
        const accessToken = await getToken();
        const refreshToken = await getRefreshToken();
        const userProfile = await getUserProfileFromStorage();
        
        if (!accessToken || !refreshToken || !userProfile) {
            await clearTokens();
            return null;
        }

        return {
            user: userProfile,
            token: accessToken,
            refreshToken
        };
    } catch (error) {
        console.error('Error restoring session:', error);
        return null;
    }
};

export const clearTokens = async () => {
    try {
        await deleteItem('auth_token');
        await deleteItem('refresh_token');
        await deleteItem('id_token');
        await deleteItem('user_profile');
    } catch (error) {
        console.error('Error clearing tokens:', error);
    }
};

export const getUserProfile = async (id: string) => {
    try {
        const response = await api.get(`/user/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export const updateUserProfile = async (id: string, data: any) => {
    try {
        const response = await api.put(`/user/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

export const deleteUserProfile = async (id: string) => {
    try {
        await api.delete(`/user/${id}`);
    } catch (error) {
        console.error('Error deleting user profile:', error);
        throw error;
    }
};

export const signOut = async (): Promise<void> => {
    await clearTokens();

    const logoutRedirectUri = getLogoutRedirectUri();
    
    const cognitoLogoutUrl = `${COGNITO_CONFIG.domain}/logout?client_id=${COGNITO_CONFIG.clientId}&logout_uri=${encodeURIComponent(logoutRedirectUri)}`;
    
    if (Platform.OS === 'web') {
        window.open(cognitoLogoutUrl, '_blank');
    } else {
        await WebBrowser.openBrowserAsync(cognitoLogoutUrl);
    }
};
