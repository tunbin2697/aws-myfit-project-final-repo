package com.example.fitme.module.chatbot.repository;

import com.example.fitme.module.chatbot.model.ChatbotMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for ChatbotMessage entity.
 * Handles database operations for conversation history.
 */
@Repository
public interface ChatbotMessageRepository extends JpaRepository<ChatbotMessage, UUID> {
    
    /**
     * Find all messages for a specific user.
     * @param userId the user ID
     * @param pageable pagination info
     * @return page of conversation messages
     */
    Page<ChatbotMessage> findByUserId(UUID userId, Pageable pageable);
    
    /**
     * Count messages for a user.
     * Used for rate limiting purposes.
     * @param userId the user ID
     * @return count of messages
     */
    long countByUserId(UUID userId);
}
