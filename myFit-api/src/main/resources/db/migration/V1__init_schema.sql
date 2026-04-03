CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  username VARCHAR(255),
  cognito_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  birthdate VARCHAR(255),
  email_verified BOOLEAN,
  gender VARCHAR(255),
  name VARCHAR(255),
  phone_number VARCHAR(255),
  picture VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS goal_type (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS muscle_group (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS food (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  name VARCHAR(255),
  calories_per100g REAL NOT NULL,
  protein_per100g REAL NOT NULL,
  carbs_per100g REAL NOT NULL,
  fats_per100g REAL NOT NULL,
  unit VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  equipment VARCHAR(255),
  muscle_group_id UUID,
  CONSTRAINT fk_exercises_muscle_group
    FOREIGN KEY (muscle_group_id) REFERENCES muscle_group(id)
);

CREATE TABLE IF NOT EXISTS workout_plan (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  goal_type_id UUID,
  difficulty_level VARCHAR(50),
  estimated_duration_minutes INTEGER,
  is_system_plan BOOLEAN,
  CONSTRAINT fk_workout_plan_goal_type
    FOREIGN KEY (goal_type_id) REFERENCES goal_type(id)
);

CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  workout_plan_id UUID NOT NULL,
  exercises_id UUID NOT NULL,
  day_of_week INTEGER,
  sets INTEGER,
  reps INTEGER,
  rest_seconds INTEGER,
  day_index INTEGER,
  week_index INTEGER,
  order_index INTEGER,
  CONSTRAINT fk_workout_plan_exercises_plan
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(id),
  CONSTRAINT fk_workout_plan_exercises_exercise
    FOREIGN KEY (exercises_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS image (
  id UUID PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  is_thumbnail BOOLEAN,
  food_id UUID,
  workout_plan_id UUID,
  exercise_id UUID,
  created_at TIMESTAMP(6) WITH TIME ZONE,
  updated_at TIMESTAMP(6) WITH TIME ZONE,
  CONSTRAINT fk_image_food
    FOREIGN KEY (food_id) REFERENCES food(id),
  CONSTRAINT fk_image_workout_plan
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(id),
  CONSTRAINT fk_image_exercise
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS user_workout_plan (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  user_id UUID NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  goal_type_id UUID,
  is_active BOOLEAN NOT NULL,
  is_deleted BOOLEAN NOT NULL,
  CONSTRAINT fk_user_workout_plan_user
    FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE TABLE IF NOT EXISTS user_workout_plan_exercises (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  user_workout_plan_id UUID NOT NULL,
  exercises_id UUID NOT NULL,
  day_of_week INTEGER,
  sets INTEGER,
  reps INTEGER,
  rest_seconds INTEGER,
  day_index INTEGER,
  week_index INTEGER,
  order_index INTEGER,
  CONSTRAINT fk_user_workout_plan_exercises_plan
    FOREIGN KEY (user_workout_plan_id) REFERENCES user_workout_plan(id),
  CONSTRAINT fk_user_workout_plan_exercises_exercise
    FOREIGN KEY (exercises_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS user_workout_session (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  user_id UUID NOT NULL,
  user_workout_plan_id UUID,
  workout_date DATE,
  is_active BOOLEAN,
  week_index INTEGER,
  day_index INTEGER,
  CONSTRAINT fk_user_workout_session_user
    FOREIGN KEY (user_id) REFERENCES user_profiles(id),
  CONSTRAINT fk_user_workout_session_plan
    FOREIGN KEY (user_workout_plan_id) REFERENCES user_workout_plan(id)
);

CREATE TABLE IF NOT EXISTS workout_log (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  user_workout_session_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  set_number INTEGER,
  reps INTEGER,
  weight REAL,
  duration_seconds INTEGER,
  CONSTRAINT fk_workout_log_session
    FOREIGN KEY (user_workout_session_id) REFERENCES user_workout_session(id),
  CONSTRAINT fk_workout_log_exercise
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS body_metric (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  user_id UUID NOT NULL,
  height_cm REAL NOT NULL,
  weight_kg REAL NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(255) NOT NULL,
  activity_level VARCHAR(255) NOT NULL,
  CONSTRAINT fk_body_metric_user
    FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE TABLE IF NOT EXISTS health_calculation (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  user_id UUID NOT NULL,
  body_metric_id UUID,
  bmi REAL NOT NULL,
  bmr REAL NOT NULL,
  tdee REAL NOT NULL,
  goal_type SMALLINT,
  CONSTRAINT fk_health_calculation_user
    FOREIGN KEY (user_id) REFERENCES user_profiles(id),
  CONSTRAINT fk_health_calculation_body_metric
    FOREIGN KEY (body_metric_id) REFERENCES body_metric(id)
);

CREATE TABLE IF NOT EXISTS daily_nutrition (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  nutrition_date DATE,
  total_protein REAL NOT NULL,
  total_carbs REAL NOT NULL,
  total_calories REAL NOT NULL,
  total_fats REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS meal (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  user_profile_id UUID,
  date TIMESTAMP(6),
  meal_type SMALLINT,
  note VARCHAR(255),
  CONSTRAINT fk_meal_user_profile
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id)
);

CREATE TABLE IF NOT EXISTS meal_food (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP(6),
  updated_at TIMESTAMP(6),
  quantity REAL NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fats REAL NOT NULL,
  meal_id UUID NOT NULL,
  food_id UUID NOT NULL,
  CONSTRAINT fk_meal_food_meal
    FOREIGN KEY (meal_id) REFERENCES meal(id),
  CONSTRAINT fk_meal_food_food
    FOREIGN KEY (food_id) REFERENCES food(id)
);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group_id ON exercises(muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_workout_plan_goal_type_id ON workout_plan(goal_type_id);
CREATE INDEX IF NOT EXISTS idx_workout_plan_exercises_plan_id ON workout_plan_exercises(workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_workout_plan_exercises_exercise_id ON workout_plan_exercises(exercises_id);
CREATE INDEX IF NOT EXISTS idx_image_food_id ON image(food_id);
CREATE INDEX IF NOT EXISTS idx_image_workout_plan_id ON image(workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_image_exercise_id ON image(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_plan_user_id ON user_workout_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_plan_exercises_plan_id ON user_workout_plan_exercises(user_workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_plan_exercises_exercise_id ON user_workout_plan_exercises(exercises_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_session_user_id ON user_workout_session(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workout_session_plan_id ON user_workout_session(user_workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_workout_log_session_id ON workout_log(user_workout_session_id);
CREATE INDEX IF NOT EXISTS idx_workout_log_exercise_id ON workout_log(exercise_id);
CREATE INDEX IF NOT EXISTS idx_body_metric_user_id ON body_metric(user_id);
CREATE INDEX IF NOT EXISTS idx_health_calculation_user_id ON health_calculation(user_id);
CREATE INDEX IF NOT EXISTS idx_health_calculation_body_metric_id ON health_calculation(body_metric_id);
CREATE INDEX IF NOT EXISTS idx_meal_user_profile_id ON meal(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_meal_food_meal_id ON meal_food(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_food_food_id ON meal_food(food_id);
