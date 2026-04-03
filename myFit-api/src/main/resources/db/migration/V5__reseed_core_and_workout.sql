-- Recovery reseed migration for environments where schema was recreated after V2/V3 history existed

-- Re-runs core and workout seed statements in an idempotent manner



INSERT INTO goal_type (id, created_at, updated_at, name, description)
SELECT gen_random_uuid(), NOW(), NOW(), v.name, v.description
FROM (
  VALUES
    ('Giảm Cân', 'Tập trung đốt calo, cardio và tập tạ nhẹ nhằm giảm mỡ thừa.'),
    ('Tăng Cơ', 'Tập trung lift nặng, volume cao để phát triển và phì đại cơ bắp (Hypertrophy).'),
    ('Duy trì', 'Cân bằng giữa sức khỏe, sức bền và sức mạnh tổng thể.'),
    ('Tăng sức mạnh', 'Tập trung sức mạnh bùng nổ (Strength/Powerlifting) với số reps thấp, mức tạ tối đa.')
) AS v(name, description)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO muscle_group (id, created_at, updated_at, name, description)
SELECT gen_random_uuid(), NOW(), NOW(), v.name, v.description
FROM (
  VALUES
    ('Ngực', 'Các bài tập phát triển cơ Ngực (Pectorals)'),
    ('Lưng', 'Các bài tập phát triển cơ Lưng (Back/Lats)'),
    ('Chân', 'Các bài tập phát triển Đùi trước (Quads), Đùi sau (Hamstrings) và Mông (Glutes)'),
    ('Tay Trước', 'Cơ bắp tay trước (Biceps)'),
    ('Tay Sau', 'Cơ bắp tay sau (Triceps)'),
    ('Vai', 'Cơ vai (Shoulders/Delts)'),
    ('Bụng', 'Cơ bụng (Core/Abs)'),
    ('Cardio', 'Cardio và các bài tập toàn thân tăng nhịp tim')
) AS v(name, description)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO exercises (id, created_at, updated_at, name, description, equipment, muscle_group_id)
SELECT gen_random_uuid(), NOW(), NOW(), src.name, src.description, src.equipment, mg.id
FROM (
  VALUES
    ('Barbell Bench Press', 'Đẩy ngực ngang với tạ đòn, phát triển toàn diện cơ ngực.', 'Barbell', 'Ngực'),
    ('Incline Dumbbell Press', 'Đẩy ngực trên với tạ đơn, tập trung phần ngực trên.', 'Dumbbell', 'Ngực'),
    ('Decline Bench Press', 'Đẩy ngực dưới với tạ đòn.', 'Barbell', 'Ngực'),
    ('Chest Fly', 'Ép ngực trên máy pec dec hoặc dùng tạ đơn.', 'Machine', 'Ngực'),
    ('Push Up', 'Hít đất cơ bản tĩnh tiến.', 'Bodyweight', 'Ngực'),
    ('Cable Crossover', 'Ép ngực bằng cáp, giúp giãn cơ tối đa.', 'Cable', 'Ngực'),
    ('Dips', 'Nhún tràng kép tác động ngực dưới và tay sau.', 'Bodyweight/Bars', 'Ngực'),

    ('Lat Pulldown', 'Kéo cáp tập lưng xô từ trên xuống.', 'Cable', 'Lưng'),
    ('Pull Up', 'Hít xà đơn.', 'Bodyweight', 'Lưng'),
    ('Barbell Row', 'Gập người kéo tạ đòn.', 'Barbell', 'Lưng'),
    ('Dumbbell Row', 'Kéo tạ đơn một tay trên ghế tì.', 'Dumbbell', 'Lưng'),
    ('Seated Cable Row', 'Ngồi kéo cáp ngang chuẩn form lưng thẳng.', 'Cable', 'Lưng'),
    ('T-Bar Row', 'Kéo tạ chữ T.', 'Barbell', 'Lưng'),
    ('Deadlift', 'Bài tập compound toàn diện lưng dưới, mông đùi.', 'Barbell', 'Lưng'),

    ('Barbell Squat', 'Gánh tạ đòn, vua của các bài tập chân.', 'Barbell', 'Chân'),
    ('Leg Press', 'Đạp đùi trên máy.', 'Machine', 'Chân'),
    ('Romanian Deadlift', 'Deadlift tĩnh tập trung đùi sau và mông.', 'Barbell', 'Chân'),
    ('Leg Extension', 'Đá đùi trước trên máy.', 'Machine', 'Chân'),
    ('Leg Curl', 'Móc đùi sau trên máy.', 'Machine', 'Chân'),
    ('Bulgarian Split Squat', 'Chùng chân với tạ đơn từng bên.', 'Dumbbell', 'Chân'),
    ('Calf Raise', 'Nhón gót tập bắp chân.', 'Machine', 'Chân'),
    ('Walking Lunges', 'Chùng chân bước bộ tạ đơn.', 'Dumbbell', 'Chân'),

    ('Overhead Press', 'Đẩy tạ đòn qua đầu đứng hoặc ngồi.', 'Barbell', 'Vai'),
    ('Dumbbell Shoulder Press', 'Đẩy tạ đơn qua đầu.', 'Dumbbell', 'Vai'),
    ('Lateral Raise', 'Dang tạ đơn sang 2 bên tập vai giữa.', 'Dumbbell', 'Vai'),
    ('Front Raise', 'Nâng tạ đơn hoặc bánh tạ ra trước mặt.', 'Dumbbell', 'Vai'),
    ('Reverse Pec Deck', 'Ép ngược trên máy tập cơ vai sau.', 'Machine', 'Vai'),
    ('Face Pull', 'Kéo cáp hướng mặt tập vai sau và cơ cầu vai.', 'Cable', 'Vai'),

    ('Crunch', 'Gập bụng cơ bản.', 'Bodyweight', 'Bụng'),
    ('Plank', 'Giữ thẳng người tĩnh tập core.', 'Bodyweight', 'Bụng'),
    ('Leg Raise', 'Nằm dang thẳng gập chân lên.', 'Bodyweight', 'Bụng'),
    ('Russian Twist', 'Xoay người cầm bánh tạ hoặc bóng tạ.', 'Weighted', 'Bụng'),
    ('Ab Wheel Rollout', 'Lăn bánh xe tập bụng.', 'Ab Wheel', 'Bụng'),
    ('Hanging Leg Raise', 'Treo người đu xà gập chân.', 'Bars', 'Bụng'),

    ('Barbell Bicep Curl', 'Cuốn tạ đòn tay trước.', 'Barbell', 'Tay Trước'),
    ('Dumbbell Curl', 'Cuốn tạ đơn đứng luân phiên.', 'Dumbbell', 'Tay Trước'),
    ('Hammer Curl', 'Cuốn tạ đơn cầm dọc (như cái búa).', 'Dumbbell', 'Tay Trước'),
    ('Preacher Curl', 'Cuốn tạ trên ghế cô lập bắp tay.', 'Machine', 'Tay Trước'),
    ('Concentration Curl', 'Ngồi cuốn tạ đơn cô lập một tay.', 'Dumbbell', 'Tay Trước'),

    ('Tricep Pushdown', 'Kéo cáp tay sau đòn ngang hoặc thừng.', 'Cable', 'Tay Sau'),
    ('Skull Crusher', 'Nằm ghế đẩy tạ EZ qua đầu.', 'EZ Bar', 'Tay Sau'),
    ('Overhead Tricep Extension', 'Kéo cáp hoặc đẩy tạ đơn qua đầu.', 'Cable', 'Tay Sau'),
    ('Close Grip Bench Press', 'Đẩy ngực ngang cầm chụm tay.', 'Barbell', 'Tay Sau'),
    ('Tricep Kickback', 'Cúi tì ghế bật tạ đơn tay sau.', 'Dumbbell', 'Tay Sau'),

    ('Treadmill Running', 'Chạy bộ trên máy.', 'Cardio Machine', 'Cardio'),
    ('Cycling', 'Đạp xe tốc độ cao trên máy.', 'Cardio Machine', 'Cardio'),
    ('Elliptical', 'Tập leo cầu thang / trượt tuyết trên Elliptical.', 'Cardio Machine', 'Cardio'),
    ('Rowing Machine', 'Kéo thuyền máy (Rowing).', 'Cardio Machine', 'Cardio'),
    ('Burpees', 'Chuỗi hít đất bật nhảy toàn thân.', 'Bodyweight', 'Cardio')
) AS src(name, description, equipment, muscle_group_name)
JOIN muscle_group mg ON mg.name = src.muscle_group_name
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.name = src.name
);

INSERT INTO food (id, created_at, updated_at, name, calories_per100g, protein_per100g, carbs_per100g, fats_per100g, unit)
SELECT gen_random_uuid(), NOW(), NOW(), src.name, src.calories_per100g, src.protein_per100g, src.carbs_per100g, src.fats_per100g, src.unit
FROM (
  VALUES
    ('Cơm trắng', 130, 2.7, 28, 0.3, 'g'),
    ('Ức gà', 165, 31, 0, 3.6, 'g'),
    ('Trứng gà', 155, 13, 1.1, 11, 'quả'),
    ('Khoai lang', 86, 1.6, 20, 0.1, 'g'),
    ('Cá hồi', 208, 20, 0, 13, 'g'),
    ('Chuối', 89, 1.1, 23, 0.3, 'g'),
    ('Yến mạch', 389, 17, 66, 7, 'g'),
    ('Thịt bò nạc', 250, 26, 0, 15, 'g'),
    ('Sữa tươi không đường', 42, 3.4, 5, 1, 'ml'),
    ('Đậu hũ', 76, 8, 1.9, 4.8, 'g')
) AS src(name, calories_per100g, protein_per100g, carbs_per100g, fats_per100g, unit)
WHERE NOT EXISTS (
  SELECT 1 FROM food f WHERE f.name = src.name
);


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
