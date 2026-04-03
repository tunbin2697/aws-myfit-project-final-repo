import { View } from 'react-native';
import { cn } from '../../utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, max = 100, className, indicatorClassName }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View className={cn("h-4 w-full overflow-hidden rounded-full bg-gray-100", className)}>
        <View 
            className={cn("h-full bg-orange-500", indicatorClassName)} 
            style={{ width: `${percentage}%` }}
        />
    </View>
  );
}
