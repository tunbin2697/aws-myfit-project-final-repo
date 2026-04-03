CREATE TABLE IF NOT EXISTS chatbot_message (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  model_used VARCHAR(255),
  tokens_used INTEGER,
  response_time_ms BIGINT,
  created_at TIMESTAMP(6) NOT NULL,
  updated_at TIMESTAMP(6)
);

CREATE INDEX IF NOT EXISTS idx_chatbot_message_user_id ON chatbot_message(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_message_created_at ON chatbot_message(created_at);
