package com.example.fitme.module.chatbot;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.chatbot.dto.ChatbotRequest;
import com.example.fitme.module.chatbot.dto.ChatbotResponse;
import com.example.fitme.module.chatbot.model.ChatbotMessage;
import com.example.fitme.module.chatbot.repository.ChatbotMessageRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for handling chatbot queries via AWS Bedrock REST API.
 *
 * Authentication: Bedrock API Key (x-api-key header)
 * Endpoint: https://bedrock-runtime.{region}.amazonaws.com/model/{modelId}/invoke
 */
@Slf4j
@Service
public class ChatbotService {

    private final RestTemplate restTemplate;
    private final ChatbotMessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    @Value("${aws.bedrock.api-key}")
    private String bedrockApiKey;

    @Value("${aws.bedrock.model:anthropic.claude-3-5-haiku-20241022-v1:0}")
    private String defaultModel;

    @Value("${aws.bedrock.region:us-west-2}")
    private String bedrockRegion;

    @Value("${aws.bedrock.temperature:0.7}")
    private double defaultTemperature;

    @Value("${aws.bedrock.max-tokens:1024}")
    private int maxTokens;

    public ChatbotService(RestTemplate restTemplate,
                          ChatbotMessageRepository messageRepository,
                          ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.messageRepository = messageRepository;
        this.objectMapper = objectMapper;
    }

    public ChatbotResponse processQuery(UUID userId, ChatbotRequest request) {
        log.info("Processing query for user: {}, API Key length: {}", userId, 
                bedrockApiKey != null ? bedrockApiKey.length() : "NULL");
        long startTime = System.currentTimeMillis();

        try {
            String modelId = request.getModel() != null ? request.getModel() : defaultModel;
            double temperature = request.getTemperature() != null ? request.getTemperature() : defaultTemperature;

            log.info("Sending query to Bedrock model: {} for user: {}", modelId, userId);

            String rawResponse = invokeBedrockModel(userId, modelId, request.getMessage(), request.getContext(), temperature);

            long responseTimeMs = System.currentTimeMillis() - startTime;

            ChatbotResponse.TokenUsage tokenUsage = parseTokenUsage(rawResponse);

            ChatbotResponse response = ChatbotResponse.builder()
                    .message(extractMessageFromResponse(rawResponse))
                    .model(modelId)
                    .tokensUsed(tokenUsage.getTotalTokens())
                    .tokenUsage(tokenUsage)
                    .responseTimeMs(responseTimeMs)
                    .success(true)
                    .timestamp(LocalDateTime.now())
                    .build();

            saveChatbotMessage(userId, request.getMessage(), response);

            return response;

        } catch (Exception e) {
            log.error("Error processing chatbot query for user: {}", userId, e);
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Failed to process chatbot query: " + e.getMessage());
        }
    }

    /**
     * Get chatbot message history for a user with paging.
     *
     * @param userId the user ID
     * @param pageable pagination info
     * @return page of chatbot messages
     */
    public Page<ChatbotMessage> getChatHistory(UUID userId, Pageable pageable) {
        log.info("Fetching chat history for user: {} with pageable: {}", userId, pageable);
        return messageRepository.findByUserId(userId, pageable);
    }


    /**
     * Call AWS Bedrock REST API explicitly using API key authentication.
     * Endpoint: POST https://bedrock-runtime.{region}.amazonaws.com/model/{modelId}/invoke
     */
    private String invokeBedrockModel(UUID userId, String modelId, String userMessage, String context, double temperature) {
        try {
            // Build request body (Claude format)
            ObjectNode body = objectMapper.createObjectNode();
            body.put("anthropic_version", "bedrock-2023-05-31");
            body.put("max_tokens", 1024);
            body.put("temperature", temperature);

            // System prompt
            body.put("system", "You are a helpful fitness coaching assistant.");

            // Messages
            var messages = body.putArray("messages");
            var userMsg = messages.addObject();
            userMsg.put("role", "user");
            
            var contentArray = userMsg.putArray("content");
            var textContent = contentArray.addObject();
            textContent.put("type", "text");
            textContent.put("text", userMessage);

            // Use configured model and region from application properties
            String modelIdToUse = defaultModel;
            String region = bedrockRegion;
            
            String url = String.format(
                    "https://bedrock-runtime.%s.amazonaws.com/model/%s/invoke",
                    region, modelIdToUse
            );
            
            log.info("Calling Bedrock with model: {} in region: {}", modelIdToUse, region);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.set("Authorization", "Bearer " + bedrockApiKey);

            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            return response.getBody();

        } catch (HttpClientErrorException e) {
            log.error("Bedrock rejected the API key: {}", e.getResponseBodyAsString());
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Bedrock Server Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error calling Bedrock API: {}", e.getMessage());
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Bedrock API call failed: " + e.getMessage());
        }
    }



    private String extractMessageFromResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            // Handling the Proxy Gateway format: { "response": "..." }
            if (root.has("response")) {
                return root.get("response").asText();
            }
            // Fallback to original Bedrock format
            if (root.has("content") && root.get("content").isArray()) {
                JsonNode first = root.get("content").get(0);
                if (first != null && first.has("text")) {
                    return first.get("text").asText();
                }
            }
            return "Unable to parse response from Chatbot";
        } catch (Exception e) {
            log.error("Error extracting message from Chatbot response", e);
            return "Error processing response: " + e.getMessage();
        }
    }

    private ChatbotResponse.TokenUsage parseTokenUsage(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            int inputTokens = 0;
            int outputTokens = 0;
            if (root.has("usage")) {
                JsonNode usage = root.get("usage");
                inputTokens = usage.has("input_tokens") ? usage.get("input_tokens").asInt() : 0;
                outputTokens = usage.has("output_tokens") ? usage.get("output_tokens").asInt() : 0;
            } else if (root.has("tokens_used")) {
                outputTokens = root.get("tokens_used").asInt();
            }
            return ChatbotResponse.TokenUsage.builder()
                    .inputTokens(inputTokens).outputTokens(outputTokens)
                    .totalTokens(inputTokens + outputTokens).build();
        } catch (Exception e) {
            log.warn("Error parsing token usage", e);
            return ChatbotResponse.TokenUsage.builder()
                    .inputTokens(0).outputTokens(0).totalTokens(0).build();
        }
    }

    private void saveChatbotMessage(UUID userId, String userMessage, ChatbotResponse response) {
        try {
            ChatbotMessage message = ChatbotMessage.builder()
                    .userId(userId)
                    .userMessage(userMessage)
                    .assistantResponse(response.getMessage())
                    .modelUsed(response.getModel())
                    .tokensUsed(response.getTokensUsed())
                    .responseTimeMs(response.getResponseTimeMs())
                    .build();
            messageRepository.save(message);
            log.info("Saved chatbot message for user: {}", userId);
        } catch (Exception e) {
            log.warn("Failed to save chatbot message to database", e);
        }
    }
}