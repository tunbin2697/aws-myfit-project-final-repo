import React, { useEffect, useMemo, useState } from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View, Text } from 'react-native';
import { AlertTriangle, Info } from 'lucide-react-native';
import { NotificationPayload, NotificationButton, subscribeNotification } from '../../utils/notification';

export function NotificationBox() {
    const [queue, setQueue] = useState<NotificationPayload[]>([]);

    useEffect(() => {
        return subscribeNotification((payload) => {
            setQueue(prev => [...prev, payload]);
        });
    }, []);

    const current = queue[0];

    const dismissCurrent = () => {
        setQueue(prev => prev.slice(1));
    };

    const buttons: NotificationButton[] = useMemo(() => {
        if (!current) return [];
        if (current.buttons && current.buttons.length > 0) return current.buttons;
        return [{ text: 'OK', style: 'default' }];
    }, [current]);

    const hasDestructive = buttons.some(btn => btn.style === 'destructive');
    const Icon = hasDestructive ? AlertTriangle : Info;
    const iconColor = hasDestructive ? '#ef4444' : '#2563eb';
    const iconBgClass = hasDestructive ? 'bg-red-100' : 'bg-blue-100';

    const onPressButton = (button: NotificationButton) => {
        dismissCurrent();
        button.onPress?.();
    };

    const getButtonTextClass = (style?: NotificationButton['style']) => {
        if (style === 'destructive') return 'text-red-500';
        if (style === 'cancel') return 'text-gray-600';
        return 'text-blue-600';
    };

    return (
        <Modal
            visible={!!current}
            transparent
            animationType="fade"
            onRequestClose={dismissCurrent}
        >
            <TouchableWithoutFeedback onPress={dismissCurrent}>
                <View className="flex-1 bg-black/40 items-center justify-center px-6">
                    <TouchableWithoutFeedback>
                        <View className="w-full max-w-sm bg-white rounded-3xl overflow-hidden">
                            <View className="p-6 items-center">
                                <View className={`w-14 h-14 rounded-full ${iconBgClass} items-center justify-center mb-3`}>
                                    <Icon color={iconColor} size={26} />
                                </View>
                                <Text className="text-lg font-bold text-gray-900 text-center mb-2">
                                    {current?.title}
                                </Text>
                                {!!current?.message && (
                                    <Text className="text-gray-600 text-center text-base leading-6">
                                        {current.message}
                                    </Text>
                                )}
                            </View>

                            <View className="border-t border-gray-100">
                                {buttons.length === 1 ? (
                                    <TouchableOpacity
                                        className="py-4 items-center justify-center"
                                        onPress={() => onPressButton(buttons[0])}
                                    >
                                        <Text
                                            className={`font-semibold text-base ${getButtonTextClass(buttons[0].style)}`}
                                        >
                                            {buttons[0].text ?? 'OK'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : buttons.length === 2 ? (
                                    <View className="flex-row">
                                        {buttons.map((button, index) => (
                                            <TouchableOpacity
                                                key={`${button.text ?? 'btn'}-${index}`}
                                                className={`flex-1 py-4 items-center justify-center ${index === 0 ? 'border-r border-gray-100' : ''}`}
                                                onPress={() => onPressButton(button)}
                                            >
                                                <Text className={`font-semibold text-base ${getButtonTextClass(button.style)}`}>
                                                    {button.text ?? (index === 0 ? 'Hủy' : 'OK')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <View>
                                        {buttons.map((button, index) => (
                                            <TouchableOpacity
                                                key={`${button.text ?? 'btn'}-${index}`}
                                                className={`py-4 items-center justify-center ${index > 0 ? 'border-t border-gray-100' : ''}`}
                                                onPress={() => onPressButton(button)}
                                            >
                                                <Text className={`font-semibold text-base ${getButtonTextClass(button.style)}`}>
                                                    {button.text ?? 'OK'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
