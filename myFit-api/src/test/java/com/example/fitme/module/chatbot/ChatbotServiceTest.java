package com.example.fitme.module.chatbot;

// import com.example.fitme.module.chatbot.dto.ChatbotRequest;
// import com.example.fitme.module.chatbot.dto.ChatbotResponse;
// import com.example.fitme.module.chatbot.repository.ChatbotMessageRepository;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.test.util.ReflectionTestUtils;
// import software.amazon.awssdk.core.SdkBytes;
// import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
// import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
// import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

// import java.util.UUID;

// import static org.assertj.core.api.Assertions.assertThat;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.Mockito.*;

// @ExtendWith(MockitoExtension.class)
// @DisplayName("ChatbotService Tests")
// class ChatbotServiceTest {

//     @Mock
//     private BedrockRuntimeClient bedrockClient;

//     @Mock
//     private ChatbotMessageRepository messageRepository;

//     @InjectMocks
//     private ChatbotService chatbotService;

//     private final ObjectMapper objectMapper = new ObjectMapper();

//     @BeforeEach
//     void setUp() {
//         ReflectionTestUtils.setField(chatbotService, "objectMapper", objectMapper);
//         ReflectionTestUtils.setField(chatbotService, "defaultModel", "us.anthropic.claude-3-5-haiku-20241022-v1:0");
//         ReflectionTestUtils.setField(chatbotService, "defaultTemperature", 0.7);
//         ReflectionTestUtils.setField(chatbotService, "maxTokens", 1024);
//     }

//     @Test
//     @DisplayName("processQuery - should return successful response from Bedrock")
//     void processQuery_success() throws Exception {
//         // Arrange
//         UUID userId = UUID.randomUUID();
//         ChatbotRequest request = ChatbotRequest.builder()
//                 .message("What exercises should I do to lose weight?")
//                 .build();

//         String mockBedrockResponse = """
//                 {
//                     "content": [{"type": "text", "text": "For weight loss, combine cardio and strength training."}],
//                     "usage": {"input_tokens": 50, "output_tokens": 20}
//                 }
//                 """;

//         InvokeModelResponse mockResponse = InvokeModelResponse.builder()
//                 .body(SdkBytes.fromUtf8String(mockBedrockResponse))
//                 .build();

//         when(bedrockClient.invokeModel(any(InvokeModelRequest.class))).thenReturn(mockResponse);

//         // Act
//         ChatbotResponse response = chatbotService.processQuery(userId, request);

//         // Assert
//         assertThat(response).isNotNull();
//         assertThat(response.getSuccess()).isTrue();
//         assertThat(response.getMessage()).isEqualTo("For weight loss, combine cardio and strength training.");
//         assertThat(response.getTokensUsed()).isEqualTo(70);
//         assertThat(response.getTokenUsage().getInputTokens()).isEqualTo(50);
//         assertThat(response.getTokenUsage().getOutputTokens()).isEqualTo(20);
//         verify(bedrockClient, times(1)).invokeModel(any(InvokeModelRequest.class));
//         verify(messageRepository, times(1)).save(any());
//     }

//     @Test
//     @DisplayName("processQuery - should use custom model when specified in request")
//     void processQuery_customModel() throws Exception {
//         // Arrange
//         UUID userId = UUID.randomUUID();
//         ChatbotRequest request = ChatbotRequest.builder()
//                 .message("Hello")
//                 .model("anthropic.claude-3-haiku-20240307-v1:0")
//                 .temperature(0.5)
//                 .build();

//         String mockBedrockResponse = """
//                 {
//                     "content": [{"type": "text", "text": "Hello! How can I help you?"}],
//                     "usage": {"input_tokens": 10, "output_tokens": 8}
//                 }
//                 """;

//         InvokeModelResponse mockResponse = InvokeModelResponse.builder()
//                 .body(SdkBytes.fromUtf8String(mockBedrockResponse))
//                 .build();

//         when(bedrockClient.invokeModel(any(InvokeModelRequest.class))).thenReturn(mockResponse);

//         // Act
//         ChatbotResponse response = chatbotService.processQuery(userId, request);

//         // Assert
//         assertThat(response.getModel()).isEqualTo("anthropic.claude-3-haiku-20240307-v1:0");
//         assertThat(response.getMessage()).isEqualTo("Hello! How can I help you?");
//     }

//     @Test
//     @DisplayName("processQuery - should include context in prompt when provided")
//     void processQuery_withContext() throws Exception {
//         // Arrange
//         UUID userId = UUID.randomUUID();
//         ChatbotRequest request = ChatbotRequest.builder()
//                 .message("What is my BMI?")
//                 .context("User profile: height=170cm, weight=70kg, gender=male")
//                 .build();

//         String mockBedrockResponse = """
//                 {
//                     "content": [{"type": "text", "text": "Based on your profile, your BMI is 24.2 which is normal."}],
//                     "usage": {"input_tokens": 80, "output_tokens": 30}
//                 }
//                 """;

//         InvokeModelResponse mockResponse = InvokeModelResponse.builder()
//                 .body(SdkBytes.fromUtf8String(mockBedrockResponse))
//                 .build();

//         when(bedrockClient.invokeModel(any(InvokeModelRequest.class))).thenReturn(mockResponse);

//         // Act
//         ChatbotResponse response = chatbotService.processQuery(userId, request);

//         // Assert
//         assertThat(response.getMessage()).contains("BMI");
//         assertThat(response.getSuccess()).isTrue();
//     }

//     @Test
//     @DisplayName("processQuery - should still return response even if saving to DB fails")
//     void processQuery_dbSaveFails_stillReturnsResponse() throws Exception {
//         // Arrange
//         UUID userId = UUID.randomUUID();
//         ChatbotRequest request = ChatbotRequest.builder()
//                 .message("Test message")
//                 .build();

//         String mockBedrockResponse = """
//                 {
//                     "content": [{"type": "text", "text": "Test response"}],
//                     "usage": {"input_tokens": 10, "output_tokens": 5}
//                 }
//                 """;

//         InvokeModelResponse mockResponse = InvokeModelResponse.builder()
//                 .body(SdkBytes.fromUtf8String(mockBedrockResponse))
//                 .build();

//         when(bedrockClient.invokeModel(any(InvokeModelRequest.class))).thenReturn(mockResponse);
//         when(messageRepository.save(any())).thenThrow(new RuntimeException("DB error"));

//         // Act
//         ChatbotResponse response = chatbotService.processQuery(userId, request);

//         // Assert - response should still be returned even if DB save fails
//         assertThat(response).isNotNull();
//         assertThat(response.getSuccess()).isTrue();
//         assertThat(response.getMessage()).isEqualTo("Test response");
//     }
// }
