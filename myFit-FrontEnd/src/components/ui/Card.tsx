import { View, ViewProps } from 'react-native';
import { cn } from '../../utils/cn';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View 
      className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)} 
      {...props} 
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
    return (
      <View className={cn("p-6", className)} {...props} />
    );
  }
