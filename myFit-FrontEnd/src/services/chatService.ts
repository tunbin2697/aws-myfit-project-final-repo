import { api } from '../api/client';
import { notifyAlert } from '../utils/notification';

type ChatRole = 'user' | 'assistant';

export interface ChatTurn {
  role: ChatRole;
  text: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface UsageInfo {
  userId: string;
  remainingRequests: number;
  rateLimitPerMinute: number;
  message: string;
}

export interface ChatResponse {
  message: string;
  tokenUsage?: TokenUsage;
  usageInfo?: UsageInfo;
}

const MAX_HISTORY_TURNS = 10;

function buildContext(history: ChatTurn[]): string {
  return history
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => `${turn.role === 'assistant' ? 'Assistant' : 'User'}: ${turn.text}`)
    .join('\n');
}

export async function sendChatToBedrock(history: ChatTurn[], userText: string): Promise<ChatResponse> {
  if (!userText.trim()) {
    throw new Error('Tin nhắn không được bỏ trống.');
  }

  // Estimate token count for user message (rough estimate: 1 word ≈ 1.3 tokens)
  const estimatedInputTokens = Math.ceil(userText.split(/\s+/).length * 1.3);
  const TOKEN_LIMIT_PER_REQUEST = 2000;
  
  if (estimatedInputTokens > TOKEN_LIMIT_PER_REQUEST) {
    notifyAlert('Cảnh báo: Tin nhắn quá dài', `Tin nhắn của bạn (~${estimatedInputTokens} tokens) vượt quá hạn mức ${TOKEN_LIMIT_PER_REQUEST} tokens cho một yêu cầu.`);
  }

  const requestBody = {
    message: userText,
    context: buildContext(history),
  };

  try {
    const response = await api.post('/api/chatbot', requestBody);

    const result = response?.data?.result;
    if (!result || !result.message) {
      throw new Error('Không thể nhận phản hồi từ máy chủ chatbot.');
    }

    const tokenUsage = result.tokenUsage;
    
    // Fetch current usage info
    const usageInfo = await fetchUsageInfo();
    
    // Only warn if total tokens used in this response is very high
    if (tokenUsage && tokenUsage.totalTokens > 2000) {
      notifyAlert('⚠️ Mức sử dụng token cao', `Yêu cầu này sử dụng ${tokenUsage.totalTokens} tokens (in: ${tokenUsage.inputTokens}, out: ${tokenUsage.outputTokens}).`);
    }
    
    // Warn if running low on requests
    if (usageInfo && usageInfo.remainingRequests < 10) {
      notifyAlert('Sắp hết hạn mức', `Bạn chỉ còn ${usageInfo.remainingRequests} yêu cầu trong phút này.`);
    }

    return {
      message: result.message,
      tokenUsage,
      usageInfo: usageInfo ?? undefined,
    };
  } catch (error: any) {
    // Prefer backend message when provided
    const errorMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Có lỗi xảy ra khi gửi tin nhắn chatbot.';

    if (error?.response?.status === 429) {
      notifyAlert('Quá hạn mức yêu cầu', 'Bạn đã vượt quá hạn mức gọi API. Vui lòng thử lại sau.');
    } else {
      notifyAlert('Lỗi chatbot', errorMsg);
    }

    throw new Error(errorMsg);
  }
}

/**
 * Fetch current usage information (remaining requests, rate limit).
 */
export async function fetchUsageInfo(): Promise<UsageInfo | undefined> {
  try {
    const response = await api.get('/api/chatbot/usage');
    return response?.data?.result || undefined;
  } catch (error: any) {
    console.warn('Failed to fetch chatbot usage info:', error?.message);
    return undefined;
  }
}
