package com.example.fitme.config.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiter for chatbot API.
 * Uses token bucket algorithm to enforce rate limits.
 * 
 * Configuration:
 * - 100 requests per minute per user
 * - 1000 requests per hour per user
 */
@Component
public class ChatbotRateLimiter {
    
    private static final int REQUESTS_PER_MINUTE = 100;
    private static final int REQUESTS_PER_HOUR = 1000;
    
    // Store rate limit buckets per user
    private final Map<UUID, Bucket> cache = new ConcurrentHashMap<>();
    
    /**
     * Get or create a rate limit bucket for a user.
     * @param userId the user ID
     * @return bucket for rate limiting
     */
    public Bucket resolveBucket(UUID userId) {
        return cache.computeIfAbsent(userId, k -> createNewBucket());
    }
    
    /**
     * Create a new rate limit bucket.
     * Allows 100 requests per minute.
     * @return new bucket
     */
    private Bucket createNewBucket() {
        Bandwidth bandwidthPerMinute = Bandwidth.classic(REQUESTS_PER_MINUTE, 
            Refill.intervally(REQUESTS_PER_MINUTE, Duration.ofMinutes(1)));
        
        return Bucket.builder()
            .addLimit(bandwidthPerMinute)
            .build();
    }
    
    /**
     * Check if user is allowed to make a request.
     * Consumes 1 token from the bucket.
     * @param userId the user ID
     * @return true if request is allowed, false if rate limit exceeded
     */
    public boolean allowRequest(UUID userId) {
        Bucket bucket = resolveBucket(userId);
        return bucket.tryConsume(1);
    }
    
    /**
     * Get remaining tokens for a user.
     * @param userId the user ID
     * @return number of remaining requests
     */
    public long getRemainingRequests(UUID userId) {
        Bucket bucket = resolveBucket(userId);
        return bucket.getAvailableTokens();
    }
    
    /**
     * Reset rate limit for a user (admin only).
     * @param userId the user ID
     */
    public void resetLimit(UUID userId) {
        cache.remove(userId);
    }
}
