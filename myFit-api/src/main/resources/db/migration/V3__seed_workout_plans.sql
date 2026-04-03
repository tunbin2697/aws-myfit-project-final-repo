INSERT INTO workout_plan (id, created_at, updated_at, name, description, goal_type_id, difficulty_level, estimated_duration_minutes, is_system_plan)
SELECT gen_random_uuid(), NOW(), NOW(), src.name, src.description, gt.id, src.difficulty_level, src.estimated_duration_minutes, TRUE
FROM (
  VALUES
    (
      'Newbie Full Body (3 Ngày/Tuần)',
      'Lịch tập toàn thân cơ bản (Thứ 2-4-6) thiết kế đặc biệt cho người hoàn toàn mới tập gym, giúp làm quen các bài tập compound hiệu quả nhất.',
      'Tăng Cơ',
      'Beginner',
      60
    ),
    (
      'Push Pull Legs - PPL (6 Ngày/Tuần)',
      'Lịch tập PPL tiêu chuẩn cường độ cao, phù hợp cho người tập lâu năm muốn tối đa hóa sự phát triển cơ bắp và khối lượng tập luyện.',
      'Tăng Cơ',
      'Advanced',
      75
    ),
    (
      'Giảm Mỡ Cardio & Tạ Phối Hợp',
      'Thiết kế dành riêng cho vòng eo thon gọn, kết hợp tạ cường độ nhẹ và các bài Cardio, HIIT nhằm đốt cháy lượng calo khổng lồ.',
      'Giảm Cân',
      'Intermediate',
      50
    )
) AS src(name, description, goal_type_name, difficulty_level, estimated_duration_minutes)
JOIN goal_type gt ON gt.name = src.goal_type_name
WHERE NOT EXISTS (
  SELECT 1 FROM workout_plan wp WHERE wp.name = src.name
);

INSERT INTO workout_plan_exercises (
  id,
  created_at,
  updated_at,
  workout_plan_id,
  exercises_id,
  day_of_week,
  sets,
  reps,
  rest_seconds,
  day_index,
  week_index,
  order_index
)
SELECT
  gen_random_uuid(),
  NOW(),
  NOW(),
  wp.id,
  ex.id,
  src.day_of_week,
  src.sets,
  src.reps,
  src.rest_seconds,
  NULL,
  NULL,
  src.order_index
FROM (
  VALUES
    -- Newbie Full Body
    ('Newbie Full Body (3 Ngày/Tuần)', 'Barbell Squat', 1, 3, 10, 90, 1),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Barbell Bench Press', 1, 3, 10, 90, 2),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Lat Pulldown', 1, 3, 12, 60, 3),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Crunch', 1, 3, 15, 60, 4),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Leg Press', 3, 3, 12, 90, 1),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Overhead Press', 3, 3, 10, 90, 2),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Barbell Row', 3, 3, 10, 90, 3),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Plank', 3, 3, 1, 60, 4),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Romanian Deadlift', 5, 3, 10, 90, 1),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Push Up', 5, 3, 15, 60, 2),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Pull Up', 5, 3, 8, 90, 3),
    ('Newbie Full Body (3 Ngày/Tuần)', 'Treadmill Running', 5, 1, 15, 0, 4),

    -- PPL
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Barbell Bench Press', 1, 4, 8, 120, 1),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Incline Dumbbell Press', 1, 3, 10, 90, 2),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Overhead Press', 1, 4, 8, 120, 3),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Lateral Raise', 1, 4, 15, 60, 4),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Tricep Pushdown', 1, 3, 12, 60, 5),

    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Deadlift', 2, 4, 5, 180, 1),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Lat Pulldown', 2, 3, 10, 90, 2),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Dumbbell Row', 2, 3, 10, 90, 3),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Face Pull', 2, 3, 15, 60, 4),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Barbell Bicep Curl', 2, 4, 10, 60, 5),

    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Barbell Squat', 3, 4, 8, 180, 1),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Leg Press', 3, 3, 12, 120, 2),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Romanian Deadlift', 3, 3, 10, 120, 3),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Leg Extension', 3, 3, 15, 60, 4),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Calf Raise', 3, 4, 15, 60, 5),

    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Overhead Press', 4, 4, 8, 120, 1),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Incline Dumbbell Press', 4, 3, 10, 90, 2),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Chest Fly', 4, 3, 12, 60, 3),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Lateral Raise', 4, 4, 15, 60, 4),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Skull Crusher', 4, 3, 10, 60, 5),

    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Barbell Row', 5, 4, 8, 120, 1),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Pull Up', 5, 3, 10, 90, 2),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Seated Cable Row', 5, 3, 12, 90, 3),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Reverse Pec Deck', 5, 3, 15, 60, 4),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Hammer Curl', 5, 3, 12, 60, 5),

    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Leg Press', 6, 4, 10, 120, 1),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Bulgarian Split Squat', 6, 3, 10, 90, 2),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Leg Curl', 6, 3, 12, 60, 3),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Walking Lunges', 6, 3, 20, 90, 4),
    ('Push Pull Legs - PPL (6 Ngày/Tuần)', 'Ab Wheel Rollout', 6, 3, 12, 60, 5),

    -- Fat-loss plan
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Push Up', 2, 3, 15, 45, 1),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Lat Pulldown', 2, 3, 15, 45, 2),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Dumbbell Shoulder Press', 2, 3, 15, 45, 3),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Burpees', 2, 4, 10, 60, 4),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Treadmill Running', 2, 1, 20, 0, 5),

    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Leg Press', 3, 3, 15, 45, 1),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Walking Lunges', 3, 3, 20, 45, 2),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Crunch', 3, 4, 25, 45, 3),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Plank', 3, 3, 1, 60, 4),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Cycling', 3, 1, 20, 0, 5),

    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Incline Dumbbell Press', 5, 3, 15, 45, 1),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Seated Cable Row', 5, 3, 15, 45, 2),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Lateral Raise', 5, 3, 15, 45, 3),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Burpees', 5, 4, 10, 60, 4),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Elliptical', 5, 1, 20, 0, 5),

    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Barbell Squat', 6, 3, 15, 45, 1),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Overhead Press', 6, 3, 15, 45, 2),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Lat Pulldown', 6, 3, 15, 45, 3),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Russian Twist', 6, 3, 20, 45, 4),
    ('Giảm Mỡ Cardio & Tạ Phối Hợp', 'Rowing Machine', 6, 1, 15, 0, 5)
) AS src(plan_name, exercise_name, day_of_week, sets, reps, rest_seconds, order_index)
JOIN workout_plan wp ON wp.name = src.plan_name
JOIN exercises ex ON ex.name = src.exercise_name
WHERE NOT EXISTS (
  SELECT 1
  FROM workout_plan_exercises wpe
  WHERE wpe.workout_plan_id = wp.id
    AND wpe.exercises_id = ex.id
    AND COALESCE(wpe.day_of_week, -1) = COALESCE(src.day_of_week, -1)
    AND COALESCE(wpe.order_index, -1) = COALESCE(src.order_index, -1)
);
