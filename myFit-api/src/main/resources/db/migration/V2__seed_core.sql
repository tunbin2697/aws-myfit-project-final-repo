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
