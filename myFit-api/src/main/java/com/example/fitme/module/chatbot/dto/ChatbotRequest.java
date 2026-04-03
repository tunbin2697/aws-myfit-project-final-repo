package com.example.fitme.module.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for chatbot queries.
 * Validates user input before sending to Bedrock.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotRequest {
    
    @NotBlank(message = "Message cannot be blank")
    @Size(min = 1, max = 5000, message = "Message must be between 1 and 5000 characters")
    private String message;
    
    /**
     * Optional conversation context.
     * If provided, can be used for multi-turn conversations.
     */
    @Size(max = 50000, message = "Context cannot exceed 50000 characters")
    private String context;
    
    /**
     * Optional model specification. Can override default model.
     * Valid values: "claude-3-sonnet", "claude-3-opus", "claude-3-haiku"
     */
    private String model;
    
    /**
     * Optional temperature for response creativity.
     * Range: 0.0 - 1.0 (default: 0.7)
     */
    private Double temperature;
}
