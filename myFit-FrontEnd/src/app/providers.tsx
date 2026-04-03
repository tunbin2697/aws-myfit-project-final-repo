import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../store';
import { NotificationBox } from '../components/ui/NotificationBox';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          {children}
          <NotificationBox />
        </SafeAreaProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
}
