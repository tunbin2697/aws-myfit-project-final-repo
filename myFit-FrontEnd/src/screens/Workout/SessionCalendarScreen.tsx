import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { mergeExerciseNameCache } from '../../store/uiSlice';

import { getSessionsByUser, getSessionsByDate } from '../../services/sessionService';
import { getExercisesLite as getExercises } from '../../services/workoutService';
import type { SessionResponse } from '../../types/workout';
import { Skeleton } from '../../components/ui/Skeleton';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_LABELS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    return days;
}

function startOfMonth(year: number, month: number): string {
    return toLocalDate(new Date(year, month, 1));
}

function endOfMonth(year: number, month: number): string {
    return toLocalDate(new Date(year, month + 1, 0));
}

export function SessionCalendarScreen({ navigation }: any) {
    const auth = useSelector((s: RootState) => s.auth);
    const userId = auth.user?.id;

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(toLocalDate(today));
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [detailedSessions, setDetailedSessions] = useState<SessionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const reduxDispatch = useDispatch();
    const uiCache = useSelector((s: RootState) => s.ui.exerciseNameCache);


    const sessionsByDate = sessions.reduce<Record<string, SessionResponse[]>>((acc, s) => {
        const k = s.workoutDate;
        if (!acc[k]) acc[k] = [];
        acc[k].push(s);
        return acc;
    }, {});

    const loadSessions = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const list = await getSessionsByUser(userId, {
                from: startOfMonth(viewYear, viewMonth),
                to: endOfMonth(viewYear, viewMonth),
            });
            setSessions(list);
        } catch {
            setSessions([]);
        } finally {
            setLoading(false);
        }
    }, [userId, viewYear, viewMonth]);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    useEffect(() => {
        if (!selectedDate || !userId) {
            setDetailedSessions([]);
            return;
        }
        (async () => {
            setLoadingDetails(true);
            try {
                const [list, exercises] = await Promise.all([
                    getSessionsByDate(userId, selectedDate),
                    Object.keys(uiCache).length > 0 ? Promise.resolve(null) : getExercises().catch(() => null),
                ]);
                setDetailedSessions(list);
                if (exercises) {
                    const map: Record<string, string> = {};
                    exercises.forEach((e: any) => { map[e.id] = e.name; });
                    reduxDispatch(mergeExerciseNameCache(map));
                }
            } catch (e) {
                setDetailedSessions([]);
                console.error(e);
            } finally {
                setLoadingDetails(false);
            }
        })();
    }, [selectedDate, userId, reduxDispatch]);


    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    const days = getDaysInMonth(viewYear, viewMonth);
    const firstDayOfWeek = days[0].getDay();
    const paddingDays = Array(firstDayOfWeek).fill(null);

    const activeSessions = selectedDate ? (sessionsByDate[selectedDate] ?? []) : [];

    return (
        <View className="flex-1 bg-gray-50">
            <View className="rounded-b-[28px] overflow-hidden">
            <LinearGradient
                colors={['#f97316', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pb-5"
            >
                <SafeAreaView edges={['top', 'left', 'right']} className="px-5 pt-3">
                    <View className="flex-row items-center gap-3 mb-5">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        >
                            <ArrowLeft color="white" size={20} />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg flex-1">
                            Lịch sử tập luyện
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity
                            onPress={prevMonth}
                            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
                        >
                            <ChevronLeft color="white" size={18} />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-base">
                            {MONTH_LABELS[viewMonth]} {viewYear}
                        </Text>
                        <TouchableOpacity
                            onPress={nextMonth}
                            className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
                            disabled={viewYear === today.getFullYear() && viewMonth >= today.getMonth()}
                            style={{
                                opacity:
                                    viewYear === today.getFullYear() && viewMonth >= today.getMonth()
                                        ? 0.4
                                        : 1,
                            }}
                        >
                            <ChevronRight color="white" size={18} />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row mb-2">
                        {DAYS_OF_WEEK.map(d => (
                            <View key={d} className="flex-1 items-center">
                                <Text className="text-white/60 text-xs font-semibold">{d}</Text>
                            </View>
                        ))}
                    </View>

                    {loading ? (
                        <View className="h-40 justify-center px-2">
                            {Array.from({ length: 3 }).map((_, row) => (
                                <View key={row} className="flex-row mb-2">
                                    {Array.from({ length: 7 }).map((__, col) => (
                                        <View key={`${row}-${col}`} className="flex-1 items-center">
                                            <Skeleton className="w-7 h-7 rounded-full bg-white/35" />
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <>
                            {(() => {
                                const cells = [...paddingDays, ...days];
                                const weeks: (Date | null)[][] = [];
                                for (let i = 0; i < cells.length; i += 7) {
                                    weeks.push(cells.slice(i, i + 7) as (Date | null)[]);
                                }
                                return weeks.map((week, wi) => (
                                    <View key={wi} className="flex-row mb-1">
                                        {week.map((date, di) => {
                                            if (!date) {
                                                return <View key={`pad-${di}`} className="flex-1 h-9" />;
                                            }
                                            const dateStr = toLocalDate(date);
                                            const hasSessions = (sessionsByDate[dateStr]?.length ?? 0) > 0;
                                            const isToday = dateStr === toLocalDate(today);
                                            const isSelected = dateStr === selectedDate;

                                            return (
                                                <TouchableOpacity
                                                    key={dateStr}
                                                    onPress={() => setSelectedDate(dateStr)}
                                                    className="flex-1 h-9 items-center justify-center"
                                                    activeOpacity={0.7}
                                                >
                                                    <View
                                                        className={`w-8 h-8 rounded-full items-center justify-center ${isSelected
                                                            ? 'bg-white'
                                                            : isToday
                                                                ? 'bg-white/30'
                                                                : 'bg-transparent'
                                                            }`}
                                                    >
                                                        <Text
                                                            className={`text-sm font-semibold ${isSelected
                                                                ? 'text-orange-600'
                                                                : 'text-white'
                                                                }`}
                                                        >
                                                            {date.getDate()}
                                                        </Text>
                                                    </View>
                                                    {hasSessions && (
                                                        <View
                                                            className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-orange-500' : 'bg-white'
                                                                }`}
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ));
                            })()}
                        </>
                    )}
                </SafeAreaView>
            </LinearGradient>
            </View>

            <ScrollView
                className="flex-1 px-5 pt-5"
                contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 80 : 80 }}
            >
                {selectedDate && (
                    <Text className="text-sm font-bold text-gray-500 uppercase mb-3">
                        {parseLocalDate(selectedDate).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </Text>
                )}

                {loadingDetails ? (
                    <View className="py-2">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <View key={idx} className="bg-white rounded-2xl p-4 mb-3">
                                <View className="flex-row items-center mb-3">
                                    <Skeleton className="w-10 h-10 rounded-xl mr-3" />
                                    <View className="flex-1">
                                        <Skeleton className="h-4 w-24 mb-2" />
                                        <Skeleton className="h-3 w-40" />
                                    </View>
                                </View>
                                <Skeleton className="h-3 w-full" />
                            </View>
                        ))}
                    </View>
                ) : detailedSessions.length > 0 ? (
                    detailedSessions.map(s => {
                        const totalSets = s.logs?.length ?? 0;
                        const uniqueExercises = new Set(s.logs?.map(l => l.exerciseId)).size;
                        const totalReps = s.logs?.reduce((acc, l) => acc + (l.reps ?? 0), 0) ?? 0;

                        return (
                            <TouchableOpacity
                                key={s.id}
                                onPress={() => navigation.navigate('SessionDetail', { sessionId: s.id })}
                                className="bg-white rounded-2xl p-4 flex-col mb-3"
                                activeOpacity={0.8}
                                style={{
                                    elevation: 2,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.06,
                                    shadowRadius: 8,
                                    shadowOffset: { width: 0, height: 2 },
                                }}
                            >
                                <View className="flex-row items-center mb-3">
                                    <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center mr-3">
                                        <Clock color="white" size={18} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-900">Buổi tập</Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">
                                            {uniqueExercises} bài · {totalSets} sets · {totalReps} reps
                                        </Text>
                                    </View>
                                    <ChevronRight color="#d1d5db" size={16} />
                                </View>

                                {/* Mini log preview */}
                                {s.logs && s.logs.length > 0 && (
                                    <View className="bg-gray-50 rounded-xl p-3 mt-1">
                                        {Array.from(new Set(s.logs.map(l => l.exerciseId))).slice(0, 3).map((exId, idx) => {
                                            const exLogs = s.logs!.filter(l => l.exerciseId === exId);
                                            const exName = uiCache[exId] ?? `Bài tập (${exId.slice(0, 5)}...)`;
                                            const exSets = exLogs.length;
                                            return (
                                                <View key={exId} className="flex-row justify-between mb-1" style={{ opacity: 1 - (idx * 0.2) }}>
                                                    <Text className="text-gray-600 text-xs font-medium flex-1" numberOfLines={1}>
                                                        • {exName}
                                                    </Text>
                                                    <Text className="text-gray-400 text-xs">{exSets} sets</Text>
                                                </View>
                                            );
                                        })}
                                        {uniqueExercises > 3 && (
                                            <Text className="text-gray-400 text-xs italic mt-1">+ {uniqueExercises - 3} bài tập khác</Text>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })
                ) : activeSessions.length === 0 ? (
                    <View className="items-center py-12">
                        <Text className="text-gray-400 text-base">
                            Không có buổi tập nào ngày này.
                        </Text>
                    </View>
                ) : (
                    activeSessions.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            onPress={() => navigation.navigate('SessionDetail', { sessionId: s.id })}
                            className="bg-white rounded-2xl p-4 flex-row items-center mb-3"
                            activeOpacity={0.8}
                            style={{
                                elevation: 2,
                                shadowColor: '#000',
                                shadowOpacity: 0.06,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 2 },
                            }}
                        >
                            <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center mr-3">
                                <Clock color="white" size={18} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-900">Buổi tập</Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    {s.logs?.length ?? 0} sets · Tap để xem chi tiết
                                </Text>
                            </View>
                            <ChevronRight color="#d1d5db" size={16} />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
