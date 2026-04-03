package com.example.fitme.module.chatbot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a chatbot conversation message.
 * Stores conversation history for auditing and user reference.
 */
@Entity
@Table(name = "chatbot_message")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private UUID userId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String userMessage;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String assistantResponse;
    
    @Column(name = "model_used")
    private String modelUsed;
    
    @Column(name = "tokens_used")
    private Integer tokensUsed;
    
    @Column(name = "response_time_ms")
    private Long responseTimeMs;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
