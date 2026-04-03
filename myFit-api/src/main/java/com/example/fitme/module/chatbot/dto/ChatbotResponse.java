package com.example.fitme.module.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for chatbot queries.
 * Wraps Bedrock response with metadata.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatbotResponse {
    
    /**
     * The AI-generated response message.
     */
    private String message;
    
    /**
     * The model that generated the response.
     */
    private String model;
    
    /**
     * Total tokens used (input + output).
     */
    private Integer tokensUsed;
    
    /**
     * Breakdown of token usage.
     */
    private TokenUsage tokenUsage;
    
    /**
     * Time taken to generate response in milliseconds.
     */
    private Long responseTimeMs;
    
    /**
     * Whether the request was successful.
     */
    private Boolean success;
    
    /**
     * Error message if request failed.
     */
    private String error;
    
    /**
     * Timestamp of the response.
     */
    private LocalDateTime timestamp;
    
    /**
     * Message ID for reference/logging purposes.
     */
    private String messageId;
    
    /**
     * Token usage breakdown.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TokenUsage {
        private Integer inputTokens;
        private Integer outputTokens;
        private Integer totalTokens;
    }
}
