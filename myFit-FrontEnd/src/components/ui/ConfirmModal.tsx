import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { AlertTriangle, Info, HelpCircle, X } from 'lucide-react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'info',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  const iconColors = {
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  const buttonColors = {
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  const iconBgColors = {
    danger: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100',
  };

  const IconComponent = variant === 'danger' ? AlertTriangle : variant === 'warning' ? HelpCircle : Info;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
              {/* Close button */}
              <TouchableOpacity
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                onPress={onCancel}
              >
                <X color="#9ca3af" size={18} />
              </TouchableOpacity>

              {/* Content */}
              <View className="p-6 pt-8 items-center">
                {/* Icon */}
                <View className={`w-16 h-16 rounded-full ${iconBgColors[variant]} items-center justify-center mb-4`}>
                  <IconComponent color={iconColors[variant]} size={32} />
                </View>

                {/* Title */}
                <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                  {title}
                </Text>

                {/* Message */}
                <Text className="text-gray-500 text-center text-base leading-6">
                  {message}
                </Text>
              </View>

              {/* Actions */}
              <View className="flex-row border-t border-gray-100">
                <TouchableOpacity
                  className="flex-1 py-4 items-center justify-center border-r border-gray-100"
                  onPress={onCancel}
                  disabled={isLoading}
                >
                  <Text className="text-gray-600 font-semibold text-base">
                    {cancelText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-4 items-center justify-center ${isLoading ? 'opacity-50' : ''}`}
                  onPress={onConfirm}
                  disabled={isLoading}
                >
                  <Text className={`font-semibold text-base ${variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                    {isLoading ? 'Đang xử lý...' : confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
