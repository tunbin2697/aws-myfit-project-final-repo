import { Alert } from 'react-native';

export type NotificationButton = {
    text?: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
};

export type NotificationPayload = {
    title: string;
    message?: string;
    buttons?: NotificationButton[];
};

type Listener = (payload: NotificationPayload) => void;

const listeners = new Set<Listener>();
let isProxyInstalled = false;

export function subscribeNotification(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function notifyAlert(
    title: string,
    message?: string,
    buttons?: NotificationButton[]
) {
    const payload: NotificationPayload = {
        title,
        message,
        buttons,
    };

    listeners.forEach(listener => listener(payload));
}

export function installAlertProxy() {
    if (isProxyInstalled) return;
    isProxyInstalled = true;

    Alert.alert = (title?: string, message?: string, buttons?: NotificationButton[]) => {
        notifyAlert(title ?? '', message, buttons);
    };
}
