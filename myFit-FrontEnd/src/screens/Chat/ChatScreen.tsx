import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Dumbbell,
  Apple,
  Target,
  Bot,
} from 'lucide-react-native';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { fetchUsageInfo, sendChatToBedrock, UsageInfo } from '../../services/chatService';
import { notifyAlert } from '../../utils/notification';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface QuickOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const initialBotMessage = {
  id: '0',
  text: 'Xin chào! 👋 Tôi là trợ lý AI của MyFit. Tôi có thể giúp bạn về tập luyện, dinh dưỡng và theo dõi sức khỏe.\n\nHãy chọn một chủ đề bên dưới hoặc nhập câu hỏi của bạn!',
  isBot: true,
  timestamp: new Date(),
};

const quickOptions: QuickOption[] = [
  {
    id: '1',
    label: 'Gợi ý bài tập',
    icon: <Dumbbell color="#f97316" size={18} />,
    prompt: 'Gợi ý cho tôi bài tập phù hợp hôm nay',
  },
  {
    id: '2',
    label: 'Thực đơn hôm nay',
    icon: <Apple color="#22c55e" size={18} />,
    prompt: 'Gợi ý thực đơn healthy cho hôm nay',
  },
  {
    id: '3',
    label: 'Mục tiêu calo',
    icon: <Target color="#3b82f6" size={18} />,
    prompt: 'Tôi nên ăn bao nhiêu calo mỗi ngày?',
  },
  {
    id: '4',
    label: 'Tư vấn giảm cân',
    icon: <Sparkles color="#a855f7" size={18} />,
    prompt: 'Cho tôi lời khuyên để giảm cân hiệu quả',
  },
];

export function ChatScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const [isClearConfirmVisible, setIsClearConfirmVisible] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | undefined>(undefined);
  
  // Animated keyboard handling
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const TAB_BAR_HEIGHT = 75; // Height of the custom tab bar
  const EXTRA_PADDING = 25; // Extra padding above keyboard

  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(keyboardShowEvent, (e) => {
      // Animate input up by keyboard height minus tab bar, plus extra padding
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height - TAB_BAR_HEIGHT + EXTRA_PADDING,
        duration: Platform.OS === 'ios' ? e.duration : 250,
        useNativeDriver: false,
      }).start();
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });

    const keyboardHideListener = Keyboard.addListener(keyboardHideEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? e.duration : 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const loadUsage = async () => {
      const usage = await fetchUsageInfo();
      if (usage) {
        setUsageInfo(usage);
      }
    };

    void loadUsage();
  }, []);

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userText = text.trim();
    const history = messages.map((message) => ({
      role: message.isBot ? 'assistant' as const : 'user' as const,
      text: message.text,
    }));

    // Add user message
    addMessage(userText, false);
    setInputText('');

    // Bot typing while waiting response
    setIsTyping(true);

    try {
      const { message: botMessage, usageInfo: latestUsage } = await sendChatToBedrock(history, userText);
      addMessage(botMessage, true);

      if (latestUsage) {
        setUsageInfo(latestUsage);
      }

    } catch (error: any) {
      addMessage(
        error?.message ||
          'Xin lỗi, tôi đang gặp sự cố khi kết nối AI. Vui lòng thử lại sau.',
        true
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickOption = (option: QuickOption) => {
    handleSend(option.prompt);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#f97316', '#ef4444']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View className="flex-row items-center px-4 py-3">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              activeOpacity={0.7}
            >
              <ArrowLeft color="white" size={22} />
            </TouchableOpacity>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-2">
                  <Bot color="white" size={18} />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">MyFit AI</Text>
                  <Text className="text-white/70 text-xs">Trợ lý sức khỏe</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsClearConfirmVisible(true)}
              className="px-3 py-1 rounded-full border border-white/50"
              activeOpacity={0.7}
            >
              <Text className="text-white text-xs">Xóa chat</Text>
            </TouchableOpacity>
          </View>
          {usageInfo && (
            <View className="items-end px-4 pb-2">
              <Text className="text-[11px] text-white/90">
                {usageInfo.remainingRequests}/{usageInfo.rateLimitPerMinute} req còn lại
              </Text>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* Messages */}

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-3 ${message.isBot ? 'items-start' : 'items-end'}`}
            >
              <View
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.isBot
                    ? 'bg-white border border-gray-100 rounded-tl-sm'
                    : 'bg-orange-500 rounded-tr-sm'
                }`}
                style={
                  message.isBot
                    ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      }
                    : {}
                }
              >
                <Text
                  className={`text-[15px] leading-6 ${
                    message.isBot ? 'text-gray-800' : 'text-white'
                  }`}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View className="items-start mb-3">
              <View className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <View className="flex-row gap-1">
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                </View>
              </View>
            </View>
          )}

          {/* Quick Options - Show only at start */}
          {messages.length === 1 && (
            <View className="mt-4">
              <Text className="text-gray-500 text-sm mb-3 font-medium">
                Chọn nhanh:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {quickOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleQuickOption(option)}
                    className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 py-2.5"
                    activeOpacity={0.7}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    {option.icon}
                    <Text className="text-gray-700 font-medium ml-2 text-sm">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <Animated.View 
          className="border-t border-gray-200 bg-white px-4 py-3" 
          style={{ 
            paddingBottom: TAB_BAR_HEIGHT,
            marginBottom: keyboardHeight,
          }}
        >
          <View className="flex-row items-end gap-2">
              {/* Text Input */}
              <View className="flex-1 flex-row items-end bg-gray-100 rounded-2xl px-4 py-2 min-h-[44px]">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Nhập tin nhắn..."
                  placeholderTextColor="#9ca3af"
                  className="flex-1 text-gray-800 text-[15px] max-h-24"
                  multiline
                  onSubmitEditing={() => {
                    if (!isTyping) {
                      void handleSend(inputText);
                    }
                  }}
                  editable={!isTyping}
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity
                onPress={() => {
                  if (!isTyping) {
                    void handleSend(inputText);
                  }
                }}
                disabled={!inputText.trim() || isTyping}
                activeOpacity={0.7}
              >
                <View
                  className={`w-11 h-11 rounded-full items-center justify-center ${
                    inputText.trim() && !isTyping ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <Send
                    color="white"
                    size={20}
                    style={{ marginLeft: 2 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
        </Animated.View>

        <ConfirmModal
          visible={isClearConfirmVisible}
          title="Xóa hội thoại"
          message="Bạn có chắc muốn xóa toàn bộ cuộc hội thoại?"
          confirmText="Xóa"
          cancelText="Hủy"
          variant="danger"
          onConfirm={() => {
            setMessages([initialBotMessage]);
            setInputText('');
            setIsClearConfirmVisible(false);
            notifyAlert('Đã xóa', 'Hội thoại đã được đặt lại.');
          }}
          onCancel={() => setIsClearConfirmVisible(false)}
        />
    </View>
  );
}
