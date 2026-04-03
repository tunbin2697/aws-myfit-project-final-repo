import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';
import { cn } from '../../utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  className?: string;
  labelClassName?: string;
}

export function Input({ className, label, labelClassName, ...props }: InputProps) {
  return (
    <View className="space-y-2">
      {label && <Text className={cn("text-gray-700 font-medium", labelClassName)}>{label}</Text>}
      <TextInput
        className={cn(
          "flex h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500",
          className
        )}
        style={styles.input}
        placeholderTextColor="#6b7280"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    textAlignVertical: 'center', // Android vertical alignment
    includeFontPadding: false, // Remove extra padding on Android
  },
});
