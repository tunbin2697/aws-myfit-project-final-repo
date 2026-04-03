import React from 'react';
import { View, Text } from 'react-native';
import { MacrosResult } from '../../types';
import { Progress } from '../ui/Progress';

interface MacrosDisplayProps {
    macros: MacrosResult;
}

export function MacrosDisplay({ macros }: MacrosDisplayProps) {
    const total = macros.protein + macros.carbs + macros.fat;

    // Calculate percentages
    const proteinPercent = total > 0 ? (macros.protein / total) * 100 : 0;
    const carbsPercent = total > 0 ? (macros.carbs / total) * 100 : 0;
    const fatPercent = total > 0 ? (macros.fat / total) * 100 : 0;

    return (
        <View className="space-y-3">
            <Text className="text-sm font-bold text-gray-900 mb-2">Macros Breakdown</Text>

            {/* Protein */}
            <View>
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm text-gray-700">🍖 Protein</Text>
                    <Text className="text-sm font-bold text-gray-900">
                        {macros.protein.toFixed(1)}g ({proteinPercent.toFixed(0)}%)
                    </Text>
                </View>
                <Progress value={proteinPercent} className="h-2 bg-blue-500" />
            </View>

            {/* Carbs */}
            <View>
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm text-gray-700">🍞 Carbs</Text>
                    <Text className="text-sm font-bold text-gray-900">
                        {macros.carbs.toFixed(1)}g ({carbsPercent.toFixed(0)}%)
                    </Text>
                </View>
                <Progress value={carbsPercent} className="h-2 bg-green-500" />
            </View>

            {/* Fat */}
            <View>
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm text-gray-700">🥑 Fat</Text>
                    <Text className="text-sm font-bold text-gray-900">
                        {macros.fat.toFixed(1)}g ({fatPercent.toFixed(0)}%)
                    </Text>
                </View>
                <Progress value={fatPercent} className="h-2 bg-yellow-500" />
            </View>
        </View>
    );
}
