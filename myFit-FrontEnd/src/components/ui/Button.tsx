import { Text, TouchableOpacity, TouchableOpacityProps, View, StyleSheet } from 'react-native';
import { cn } from '../../utils/cn';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  textClassName?: string;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  textClassName,
  ...props
}: ButtonProps) {
  const baseStyles = "flex-row items-center justify-center rounded-xl";

  const variants = {
    default: "bg-gray-900",
    ghost: "bg-transparent",
    outline: "border border-gray-200 bg-transparent"
  };

  const sizes = {
    default: "h-12 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-14 px-8",
    icon: "h-10 w-10 p-0"
  };

  const textBaseStyles = "font-medium text-base";
  const textVariants = {
    default: "text-white",
    ghost: "text-gray-900",
    outline: "text-gray-900"
  };

  return (
    <TouchableOpacity
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      activeOpacity={0.8}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          className={cn(textBaseStyles, textVariants[variant], textClassName)}
          style={styles.buttonText}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
