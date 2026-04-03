package com.example.fitme.module.chatbot;

// import com.example.fitme.config.security.ChatbotRateLimiter;
// import com.example.fitme.module.chatbot.dto.ChatbotRequest;
// import com.example.fitme.module.chatbot.dto.ChatbotResponse;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.http.MediaType;
// import org.springframework.security.test.context.support.WithMockUser;
// import org.springframework.test.web.servlet.MockMvc;
// import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

// import java.time.LocalDateTime;
// import java.util.UUID;

// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.Mockito.when;
// import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(ChatbotController.class)
// @DisplayName("ChatbotController Tests")
// class ChatbotControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     private ObjectMapper objectMapper = new ObjectMapper();

//     @MockitoBean
//     private ChatbotService chatbotService;

//     @MockitoBean
//     private ChatbotRateLimiter rateLimiter;

//     @Test
//     @DisplayName("POST /api/chatbot - should return 200 with valid request")
//     void chat_validRequest_returns200() throws Exception {
//         // Arrange
//         ChatbotRequest request = ChatbotRequest.builder()
//                 .message("What exercises help with weight loss?")
//                 .build();

//         ChatbotResponse mockResponse = ChatbotResponse.builder()
//                 .message("Cardio and strength training are great for weight loss.")
//                 .model("us.anthropic.claude-3-5-haiku-20241022-v1:0")
//                 .tokensUsed(70)
//                 .success(true)
//                 .responseTimeMs(500L)
//                 .timestamp(LocalDateTime.now())
//                 .build();

//         when(rateLimiter.allowRequest(any(UUID.class))).thenReturn(true);
//         when(chatbotService.processQuery(any(UUID.class), any(ChatbotRequest.class))).thenReturn(mockResponse);

//         // Act & Assert
//         mockMvc.perform(post("/api/chatbot")
//                         .with(csrf())
//                         .with(jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000")))
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.code").value(1000))
//                 .andExpect(jsonPath("$.result.message").value("Cardio and strength training are great for weight loss."))
//                 .andExpect(jsonPath("$.result.success").value(true));
//     }

//     @Test
//     @DisplayName("POST /api/chatbot - should return 400 when message is blank")
//     void chat_blankMessage_returns400() throws Exception {
//         // Arrange
//         ChatbotRequest request = ChatbotRequest.builder()
//                 .message("")
//                 .build();

//         // Act & Assert
//         mockMvc.perform(post("/api/chatbot")
//                         .with(csrf())
//                         .with(jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000")))
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isBadRequest());
//     }

//     @Test
//     @DisplayName("POST /api/chatbot - should return 401 when not authenticated")
//     void chat_notAuthenticated_returns401() throws Exception {
//         // Arrange
//         ChatbotRequest request = ChatbotRequest.builder()
//                 .message("Hello")
//                 .build();

//         // Act & Assert
//         mockMvc.perform(post("/api/chatbot")
//                         .with(csrf())
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isUnauthorized());
//     }

//     @Test
//     @DisplayName("POST /api/chatbot - should return 429 when rate limit exceeded")
//     void chat_rateLimitExceeded_returns429() throws Exception {
//         // Arrange
//         ChatbotRequest request = ChatbotRequest.builder()
//                 .message("Hello")
//                 .build();

//         when(rateLimiter.allowRequest(any(UUID.class))).thenReturn(false);
//         when(rateLimiter.getRemainingRequests(any(UUID.class))).thenReturn(0L);

//         // Act & Assert
//         mockMvc.perform(post("/api/chatbot")
//                         .with(csrf())
//                         .with(jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000")))
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isTooManyRequests());
//     }

//     @Test
//     @DisplayName("GET /api/chatbot/health - should return 200 without authentication")
//     @WithMockUser
//     void health_returns200() throws Exception {
//         mockMvc.perform(get("/api/chatbot/health"))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.code").value(1000))
//                 .andExpect(jsonPath("$.result").value("OK"));
//     }

//     @Test
//     @DisplayName("GET /api/chatbot/usage - should return usage info when authenticated")
//     void getUsage_authenticated_returns200() throws Exception {
//         when(rateLimiter.getRemainingRequests(any(UUID.class))).thenReturn(95L);

//         mockMvc.perform(get("/api/chatbot/usage")
//                         .with(jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.code").value(1000))
//                 .andExpect(jsonPath("$.result.remainingRequests").value(95))
//                 .andExpect(jsonPath("$.result.rateLimitPerMinute").value(100));
//     }
// }
