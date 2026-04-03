-- Seed image records from s3_images_upload.json (idempotent)
-- Adds image URLs for exercises, foods, and workout plans.

WITH image_source(folder, filename, image_url) AS (
  VALUES
    ('exercises', 'ab-wheel-rollout.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/ab-wheel-rollout.jpg'),
    ('exercises', 'barbell-bench-press.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/barbell-bench-press.png'),
    ('exercises', 'barbell-bicep-curl.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/barbell-bicep-curl.png'),
    ('exercises', 'barbell-row.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/barbell-row.png'),
    ('exercises', 'barbell-squat.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/barbell-squat.jpg'),
    ('exercises', 'bulgarian-split-squat.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/bulgarian-split-squat.png'),
    ('exercises', 'Burpees.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/Burpees.jpg'),
    ('exercises', 'cable-crossover.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/cable-crossover.jpg'),
    ('exercises', 'calf-raise.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/calf-raise.jpg'),
    ('exercises', 'chest-fly.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/chest-fly.jpg'),
    ('exercises', 'close-grip-bench-press.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/close-grip-bench-press.jpg'),
    ('exercises', 'concentration-curl.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/concentration-curl.jpg'),
    ('exercises', 'Crunch.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/Crunch.jpg'),
    ('exercises', 'Cycling.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/Cycling.jpg'),
    ('exercises', 'Deadlift.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/Deadlift.jpg'),
    ('exercises', 'decline-bench-press.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/decline-bench-press.png'),
    ('exercises', 'Dips.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/Dips.png'),
    ('exercises', 'dumbbell-curl.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/dumbbell-curl.jpg'),
    ('exercises', 'dumbbell-row.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/dumbbell-row.jpg'),
    ('exercises', 'dumbbell-shoulder-press.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/dumbbell-shoulder-press.jpg'),
    ('exercises', 'Elliptical.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/Elliptical.jpg'),
    ('exercises', 'face-pull.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/face-pull.png'),
    ('exercises', 'front-raise.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/front-raise.png'),
    ('exercises', 'hammer-curl.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/hammer-curl.jpg'),
    ('exercises', 'hanging-leg-raise.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/hanging-leg-raise.jpg'),
    ('exercises', 'incline-dumbbell-press.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/incline-dumbbell-press.jpg'),
    ('exercises', 'lat-pulldown.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/lat-pulldown.png'),
    ('exercises', 'lat-pulldown.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/lat-pulldown.jpg'),
    ('exercises', 'lateral-raise.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/lateral-raise.jpg'),
    ('exercises', 'leg-curl.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/leg-curl.jpg'),
    ('exercises', 'leg-extension.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/leg-extension.png'),
    ('exercises', 'leg-press.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/leg-press.jpg'),
    ('exercises', 'leg-raise.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/leg-raise.jpg'),
    ('exercises', 'overhead-press.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/overhead-press.jpg'),
    ('exercises', 'overhead-tricep-extension.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/overhead-tricep-extension.png'),
    ('exercises', 'Plank.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/Plank.jpg'),
    ('exercises', 'preacher-curl.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/preacher-curl.jpg'),
    ('exercises', 'pull-up.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/pull-up.jpg'),
    ('exercises', 'push-up.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/push-up.jpg'),
    ('exercises', 'reverse-pec-deck.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/reverse-pec-deck.jpg'),
    ('exercises', 'romanian-deadlift.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/romanian-deadlift.jpg'),
    ('exercises', 'rowing-machine.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/rowing-machine.jpg'),
    ('exercises', 'russian-twist.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/russian-twist.png'),
    ('exercises', 'seated-cable-row.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/seated-cable-row.jpg'),
    ('exercises', 'skull-crusher.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/skull-crusher.png'),
    ('exercises', 't-bar-row.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/t-bar-row.jpg'),
    ('exercises', 'treadmill-running.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/treadmill-running.png'),
    ('exercises', 'tricep-kickback.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/tricep-kickback.png'),
    ('exercises', 'tricep-pushdown.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/tricep-pushdown.jpg'),
    ('exercises', 'walking-lunges.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/exercises/walking-lunges.png'),
    ('foods', 'Chuối.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/Chuối.jpg'),
    ('foods', 'com-trang.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/com-trang.jpg'),
    ('foods', 'cá-hồi.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/cá-hồi.jpg'),
    ('foods', 'khoai-lang.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/khoai-lang.jpg'),
    ('foods', 'sữa-tươi-không-đường.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/sữa-tươi-không-đường.jpg'),
    ('foods', 'thit-bo-nac.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/thit-bo-nac.jpg'),
    ('foods', 'trứng-gà.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/trứng-gà.jpg'),
    ('foods', 'yến-mạch.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/yến-mạch.jpg'),
    ('foods', 'đậu-hũ.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/đậu-hũ.jpg'),
    ('foods', 'ức-gà.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/foods/ức-gà.jpg'),
    ('workoutPlans', 'giảm-mỡ-cardio-ta-phối-hợp.png', 'https://d2yt5fbztmr4b9.cloudfront.net/media/workoutPlans/giảm-mỡ-cardio-ta-phối-hợp.png'),
    ('workoutPlans', 'newbie-full-body-3-ngay-tuan.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/workoutPlans/newbie-full-body-3-ngay-tuan.jpg'),
    ('workoutPlans', 'push-pull-legs-ppl-6-ngàytuần.jpg', 'https://d2yt5fbztmr4b9.cloudfront.net/media/workoutPlans/push-pull-legs-ppl-6-ngàytuần.jpg')
),
resolved AS (
  SELECT
    s.folder,
    s.filename,
    s.image_url,
    regexp_replace(lower(split_part(s.filename, '.', 1)), '[^a-z0-9]', '', 'g') AS file_key,
    CASE
      WHEN s.folder = 'foods' THEN
        CASE lower(s.filename)
          WHEN 'com-trang.jpg' THEN 'Cơm trắng'
          WHEN 'ức-gà.jpg' THEN 'Ức gà'
          WHEN 'trứng-gà.jpg' THEN 'Trứng gà'
          WHEN 'khoai-lang.jpg' THEN 'Khoai lang'
          WHEN 'cá-hồi.jpg' THEN 'Cá hồi'
          WHEN 'chuối.jpg' THEN 'Chuối'
          WHEN 'yến-mạch.jpg' THEN 'Yến mạch'
          WHEN 'thit-bo-nac.jpg' THEN 'Thịt bò nạc'
          WHEN 'sữa-tươi-không-đường.jpg' THEN 'Sữa tươi không đường'
          WHEN 'đậu-hũ.jpg' THEN 'Đậu hũ'
          ELSE NULL
        END
      ELSE NULL
    END AS food_name,
    CASE
      WHEN s.folder = 'workoutPlans' THEN
        CASE lower(s.filename)
          WHEN 'newbie-full-body-3-ngay-tuan.jpg' THEN 'Newbie Full Body (3 Ngày/Tuần)'
          WHEN 'push-pull-legs-ppl-6-ngàytuần.jpg' THEN 'Push Pull Legs - PPL (6 Ngày/Tuần)'
          WHEN 'giảm-mỡ-cardio-ta-phối-hợp.png' THEN 'Giảm Mỡ Cardio & Tạ Phối Hợp'
          ELSE NULL
        END
      ELSE NULL
    END AS workout_plan_name
  FROM image_source s
),
exercise_map AS (
  SELECT
    e.id,
    regexp_replace(lower(e.name), '[^a-z0-9]', '', 'g') AS name_key
  FROM exercises e
),
rows_to_insert AS (
  SELECT
    gen_random_uuid() AS id,
    r.image_url AS url,
    TRUE AS is_thumbnail,
    CASE WHEN r.folder = 'foods' THEN f.id ELSE NULL END AS food_id,
    CASE WHEN r.folder = 'workoutPlans' THEN wp.id ELSE NULL END AS workout_plan_id,
    CASE WHEN r.folder = 'exercises' THEN ex.id ELSE NULL END AS exercise_id,
    NOW() AS created_at,
    NOW() AS updated_at
  FROM resolved r
  LEFT JOIN exercise_map em
    ON r.folder = 'exercises'
   AND em.name_key = r.file_key
  LEFT JOIN exercises ex
    ON ex.id = em.id
  LEFT JOIN food f
    ON r.folder = 'foods'
   AND f.name = r.food_name
  LEFT JOIN workout_plan wp
    ON r.folder = 'workoutPlans'
   AND wp.name = r.workout_plan_name
  WHERE (
      (r.folder = 'exercises' AND ex.id IS NOT NULL)
   OR (r.folder = 'foods' AND f.id IS NOT NULL)
   OR (r.folder = 'workoutPlans' AND wp.id IS NOT NULL)
  )
)
INSERT INTO image (id, url, is_thumbnail, food_id, workout_plan_id, exercise_id, created_at, updated_at)
SELECT rti.id, rti.url, rti.is_thumbnail, rti.food_id, rti.workout_plan_id, rti.exercise_id, rti.created_at, rti.updated_at
FROM rows_to_insert rti
WHERE NOT EXISTS (
  SELECT 1
  FROM image i
  WHERE i.url = rti.url
);
