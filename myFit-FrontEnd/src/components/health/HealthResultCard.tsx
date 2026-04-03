import React from 'react';
import { View, Text } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { MacrosDisplay } from './MacrosDisplay';
import { HealthCalculationResponse } from '../../types';

interface HealthResultCardProps {
    result: HealthCalculationResponse;
}

export function HealthResultCard({ result }: HealthResultCardProps) {
    // BMI Classification
    const getBMIStatus = (bmi: number): { text: string; color: string } => {
        if (bmi < 18.5) return { text: 'Thiếu cân', color: 'text-yellow-600' };
        if (bmi < 25) return { text: 'Bình thường', color: 'text-green-600' };
        if (bmi < 30) return { text: 'Thừa cân', color: 'text-orange-600' };
        return { text: 'Béo phì', color: 'text-red-600' };
    };

    const bmiStatus = getBMIStatus(result.bmi);

    return (
        <Card className="border-2 border-orange-500 shadow-lg">
            <CardContent className="p-5">
                <Text className="text-lg font-bold text-orange-600 mb-4">📊 KẾT QUẢ</Text>

                {/* BMI */}
                <View className="mb-4 pb-4 border-b border-gray-200">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-600">BMI</Text>
                        <View className="flex-row items-center">
                            <Text className="text-xl font-bold text-gray-900 mr-2">
                                {result.bmi.toFixed(1)}
                            </Text>
                            <Text className={`text-sm font-medium ${bmiStatus.color}`}>
                                ({bmiStatus.text})
                            </Text>
                        </View>
                    </View>
                </View>

                {/* BMR */}
                <View className="mb-3">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-600">BMR (Trao đổi chất cơ bản)</Text>
                        <Text className="text-lg font-bold text-gray-900">
                            {result.bmr.toFixed(0)} calo/ngày
                        </Text>
                    </View>
                </View>

                {/* TDEE */}
                <View className="mb-4 pb-4 border-b border-gray-200">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-600">TDEE (Tổng lượng calo)</Text>
                        <Text className="text-lg font-bold text-orange-600">
                            {result.tdee.toFixed(0)} calo/ngày
                        </Text>
                    </View>
                </View>

                {/* Macros */}
                <MacrosDisplay macros={result.macros} />
            </CardContent>
        </Card>
    );
}
