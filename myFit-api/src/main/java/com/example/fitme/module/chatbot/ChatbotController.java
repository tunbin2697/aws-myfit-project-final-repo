package com.example.fitme.module.chatbot;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.common.utils.SecurityUtils;
import com.example.fitme.config.security.ChatbotRateLimiter;
import com.example.fitme.module.chatbot.dto.ChatbotRequest;
import com.example.fitme.module.chatbot.dto.ChatbotResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for chatbot API.
 * 
 * Security Features:
 * 1. Authentication: JWT token required (from AWS Cognito)
 * 2. Authorization: User can only access their own chat
 * 3. Rate Limiting: Max 100 requests per minute per user
 * 4. Input Validation: Request validation prevents malformed inputs
 * 
 * Endpoint: POST /api/chatbot
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbot")
@PreAuthorize("isAuthenticated()")
public class ChatbotController {
    
    private final ChatbotService chatbotService;
    private final ChatbotRateLimiter rateLimiter;
    
    public ChatbotController(ChatbotService chatbotService,
                            ChatbotRateLimiter rateLimiter) {
        this.chatbotService = chatbotService;
        this.rateLimiter = rateLimiter;
    }
    
    /**
     * Send a message to the chatbot assistant.
     * 
     * Request must include:
     * - Authorization header with valid JWT token
     * - JSON body with "message" field
     * 
     * Security checks:
     * - ✅ User must be authenticated (JWT token required)
     * - ✅ Rate limiting: 100 requests per minute
     * - ✅ Input validation: Message length max 5000 chars
     * - ✅ No database queries from user input (prevents injection attacks)
     * 
     * @param request the chatbot query request
     * @return response with AI-generated message
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChatbotResponse>> chat(
            @Valid @RequestBody ChatbotRequest request) {
        
        // Get authenticated user ID from JWT token
        String sub = SecurityUtils.getCurrentSub();
        if (sub == null) {
            log.warn("Attempt to access chatbot without valid authentication");
            throw new ApiException(com.example.fitme.common.exception.ErrorCode.UNAUTHENTICATED);
        }
        UUID userId = UUID.fromString(sub);
        
        // Check rate limit
        if (!rateLimiter.allowRequest(userId)) {
            log.warn("Rate limit exceeded for user: {}", userId);
            long remainingRequests = rateLimiter.getRemainingRequests(userId);
            throw new ApiException(
                com.example.fitme.common.exception.ErrorCode.TOO_MANY_REQUESTS,
                String.format("Rate limit exceeded. Remaining requests: %d", remainingRequests)
            );
        }
        
        log.info("Processing chatbot query for user: {}", userId);
        
        // Process query through Bedrock
        ChatbotResponse response = chatbotService.processQuery(userId, request);
        
        return ResponseEntity.ok(
            ApiResponse.<ChatbotResponse>builder()
                .code(1000)
                .message("Chatbot response generated successfully")
                .result(response)
                .build()
        );
    }
    
    /**
     * Health check endpoint for chatbot service.
     * Does not require authentication.
     * 
     * @return health status
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(
            ApiResponse.<String>builder()
                .code(1000)
                .message("Chatbot service is healthy")
                .result("OK")
                .build()
        );
    }
    
    /**
     * Get usage information for the current user.
     * Shows rate limit status.
     * 
     * @return usage information
     */
    @GetMapping("/usage")
    public ResponseEntity<ApiResponse<UsageInfo>> getUsage() {
        String sub = SecurityUtils.getCurrentSub();
        if (sub == null) {
            throw new ApiException(com.example.fitme.common.exception.ErrorCode.UNAUTHENTICATED);
        }
        UUID userId = UUID.fromString(sub);
        
        long remainingRequests = rateLimiter.getRemainingRequests(userId);
        
        UsageInfo usageInfo = UsageInfo.builder()
            .userId(userId.toString())
            .remainingRequests(remainingRequests)
            .rateLimitPerMinute(100)
            .message("You have " + remainingRequests + " requests remaining this minute")
            .build();
        
        return ResponseEntity.ok(
            ApiResponse.<UsageInfo>builder()
                .code(1000)
                .result(usageInfo)
                .build()
        );
    }
    
    /**
     * Error handler for rate limit exceeded.
     * Returns 429 Too Many Requests status.
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex) {
        HttpStatus status = ex.getErrorCode() != null ? ex.getErrorCode().getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        int code = ex.getErrorCode() != null ? ex.getErrorCode().getCode() : 5000;
        
        return ResponseEntity
            .status(status)
            .body(
                ApiResponse.<Void>builder()
                    .code(code)
                    .message(ex.getMessage())
                    .build()
            );
    }
    
    /**
     * DTO for usage information response.
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class UsageInfo {
        private String userId;
        private Long remainingRequests;
        private Integer rateLimitPerMinute;
        private String message;
    }
}
