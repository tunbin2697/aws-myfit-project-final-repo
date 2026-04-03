package com.example.fitme.config;

import com.example.fitme.module.food.entity.Food;
import com.example.fitme.module.food.repository.FoodRepository;
import com.example.fitme.module.system_goal.entity.GoalType;
import com.example.fitme.module.system_goal.repo.GoalTypeRepository;
import com.example.fitme.module.system_workout.entity.Exercise;
import com.example.fitme.module.system_workout.entity.MuscleGroup;
import com.example.fitme.module.system_workout.entity.WorkoutPlan;
import com.example.fitme.module.system_workout.entity.WorkoutPlanExercise;
import com.example.fitme.module.system_workout.repository.ExerciseRepository;
import com.example.fitme.module.system_workout.repository.MuscleGroupRepository;
import com.example.fitme.module.system_workout.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final GoalTypeRepository goalTypeRepository;
    private final MuscleGroupRepository muscleGroupRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final FoodRepository foodRepository;
    private final com.example.fitme.module.media.repository.ImageRepository imageRepository;
    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking database seed status...");
        if (muscleGroupRepository.count() == 0) {
            log.info("Database is empty. Seeding extensive initial data...");
            seedData();
            log.info("Database seeding completed.");
        } else {
            log.info("Database already seeded. Checking image seed...");
            // Luôn kiểm tra images dù DB đã seeded — để migrate URL cũ → mới
            Map<String, Exercise> exMap = exerciseRepository.findAll().stream()
                    .collect(Collectors.toMap(Exercise::getName, ex -> ex));
            seedImages(exMap);
        }
    }

    private void seedData() {
        // 1. Seed Goal Types
        List<GoalType> goals = List.of(
                GoalType.builder().name("Giảm Cân").description("Tập trung đốt calo, cardio và tập tạ nhẹ nhằm giảm mỡ thừa.").build(),
                GoalType.builder().name("Tăng Cơ").description("Tập trung lift nặng, volume cao để phát triển và phì đại cơ bắp (Hypertrophy).").build(),
                GoalType.builder().name("Duy trì").description("Cân bằng giữa sức khỏe, sức bền và sức mạnh tổng thể.").build(),
                GoalType.builder().name("Tăng sức mạnh").description("Tập trung sức mạnh bùng nổ (Strength/Powerlifting) với số reps thấp, mức tạ tối đa.").build()
        );
        goalTypeRepository.saveAll(goals);

        // 2. Seed Muscle Groups
        List<MuscleGroup> muscleGroups = List.of(
                MuscleGroup.builder().name("Ngực").description("Các bài tập phát triển cơ Ngực (Pectorals)").build(),
                MuscleGroup.builder().name("Lưng").description("Các bài tập phát triển cơ Lưng (Back/Lats)").build(),
                MuscleGroup.builder().name("Chân").description("Các bài tập phát triển Đùi trước (Quads), Đùi sau (Hamstrings) và Mông (Glutes)").build(),
                MuscleGroup.builder().name("Tay Trước").description("Cơ bắp tay trước (Biceps)").build(),
                MuscleGroup.builder().name("Tay Sau").description("Cơ bắp tay sau (Triceps)").build(),
                MuscleGroup.builder().name("Vai").description("Cơ vai (Shoulders/Delts)").build(),
                MuscleGroup.builder().name("Bụng").description("Cơ bụng (Core/Abs)").build(),
                MuscleGroup.builder().name("Cardio").description("Cardio và các bài tập toàn thân tăng nhịp tim").build()
        );
        muscleGroupRepository.saveAll(muscleGroups);
        Map<String, MuscleGroup> mgMap = muscleGroupRepository.findAll().stream()
                .collect(Collectors.toMap(MuscleGroup::getName, mg -> mg));

        // 3. Seed Exercises (Rich Data)
        List<Exercise> exercises = new ArrayList<>();
        
        // Ngực (Chest)
        exercises.add(Exercise.builder().name("Barbell Bench Press").description("Đẩy ngực ngang với tạ đòn, phát triển toàn diện cơ ngực.").equipment("Barbell").muscleGroup(mgMap.get("Ngực")).build());
        exercises.add(Exercise.builder().name("Incline Dumbbell Press").description("Đẩy ngực trên với tạ đơn, tập trung phần ngực trên.").equipment("Dumbbell").muscleGroup(mgMap.get("Ngực")).build());
        exercises.add(Exercise.builder().name("Decline Bench Press").description("Đẩy ngực dưới với tạ đòn.").equipment("Barbell").muscleGroup(mgMap.get("Ngực")).build());
        exercises.add(Exercise.builder().name("Chest Fly").description("Ép ngực trên máy pec dec hoặc dùng tạ đơn.").equipment("Machine").muscleGroup(mgMap.get("Ngực")).build());
        exercises.add(Exercise.builder().name("Push Up").description("Hít đất cơ bản tĩnh tiến.").equipment("Bodyweight").muscleGroup(mgMap.get("Ngực")).build());
        exercises.add(Exercise.builder().name("Cable Crossover").description("Ép ngực bằng cáp, giúp giãn cơ tối đa.").equipment("Cable").muscleGroup(mgMap.get("Ngực")).build());
        exercises.add(Exercise.builder().name("Dips").description("Nhún tràng kép tác động ngực dưới và tay sau.").equipment("Bodyweight/Bars").muscleGroup(mgMap.get("Ngực")).build());

        // Lưng (Back)
        exercises.add(Exercise.builder().name("Lat Pulldown").description("Kéo cáp tập lưng xô từ trên xuống.").equipment("Cable").muscleGroup(mgMap.get("Lưng")).build());
        exercises.add(Exercise.builder().name("Pull Up").description("Hít xà đơn.").equipment("Bodyweight").muscleGroup(mgMap.get("Lưng")).build());
        exercises.add(Exercise.builder().name("Barbell Row").description("Gập người kéo tạ đòn.").equipment("Barbell").muscleGroup(mgMap.get("Lưng")).build());
        exercises.add(Exercise.builder().name("Dumbbell Row").description("Kéo tạ đơn một tay trên ghế tì.").equipment("Dumbbell").muscleGroup(mgMap.get("Lưng")).build());
        exercises.add(Exercise.builder().name("Seated Cable Row").description("Ngồi kéo cáp ngang chuẩn form lưng thẳng.").equipment("Cable").muscleGroup(mgMap.get("Lưng")).build());
        exercises.add(Exercise.builder().name("T-Bar Row").description("Kéo tạ chữ T.").equipment("Barbell").muscleGroup(mgMap.get("Lưng")).build());
        exercises.add(Exercise.builder().name("Deadlift").description("Bài tập compound toàn diện lưng dưới, mông đùi.").equipment("Barbell").muscleGroup(mgMap.get("Lưng")).build());

        // Chân (Legs)
        exercises.add(Exercise.builder().name("Barbell Squat").description("Gánh tạ đòn, vua của các bài tập chân.").equipment("Barbell").muscleGroup(mgMap.get("Chân")).build());
        exercises.add(Exercise.builder().name("Leg Press").description("Đạp đùi trên máy.").equipment("Machine").muscleGroup(mgMap.get("Chân")).build());
        exercises.add(Exercise.builder().name("Romanian Deadlift").description("Deadlift tĩnh tập trung đùi sau và mông.").equipment("Barbell").muscleGroup(mgMap.get("Chân")).build());
        exercises.add(Exercise.builder().name("Leg Extension").description("Đá đùi trước trên máy.").equipment("Machine").muscleGroup(mgMap.get("Chân")).build());
        exercises.add(Exercise.builder().name("Leg Curl").description("Móc đùi sau trên máy.").equipment("Machine").muscleGroup(mgMap.get("Chân")).build());
        exercises.add(Exercise.builder().name("Bulgarian Split Squat").description("Chùng chân với tạ đơn từng bên.").equipment("Dumbbell").muscleGroup(mgMap.get("Chân")).build());
        exercises.add(Exercise.builder().name("Calf Raise").description("Nhón gót tập bắp chân.").equipment("Machine").muscleGroup(mgMap.get("Chân")).build());
        exercises.add(Exercise.builder().name("Walking Lunges").description("Chùng chân bước bộ tạ đơn.").equipment("Dumbbell").muscleGroup(mgMap.get("Chân")).build());

        // Vai (Shoulders)
        exercises.add(Exercise.builder().name("Overhead Press").description("Đẩy tạ đòn qua đầu đứng hoặc ngồi.").equipment("Barbell").muscleGroup(mgMap.get("Vai")).build());
        exercises.add(Exercise.builder().name("Dumbbell Shoulder Press").description("Đẩy tạ đơn qua đầu.").equipment("Dumbbell").muscleGroup(mgMap.get("Vai")).build());
        exercises.add(Exercise.builder().name("Lateral Raise").description("Dang tạ đơn sang 2 bên tập vai giữa.").equipment("Dumbbell").muscleGroup(mgMap.get("Vai")).build());
        exercises.add(Exercise.builder().name("Front Raise").description("Nâng tạ đơn hoặc bánh tạ ra trước mặt.").equipment("Dumbbell").muscleGroup(mgMap.get("Vai")).build());
        exercises.add(Exercise.builder().name("Reverse Pec Deck").description("Ép ngược trên máy tập cơ vai sau.").equipment("Machine").muscleGroup(mgMap.get("Vai")).build());
        exercises.add(Exercise.builder().name("Face Pull").description("Kéo cáp hướng mặt tập vai sau và cơ cầu vai.").equipment("Cable").muscleGroup(mgMap.get("Vai")).build());

        // Bụng (Core)
        exercises.add(Exercise.builder().name("Crunch").description("Gập bụng cơ bản.").equipment("Bodyweight").muscleGroup(mgMap.get("Bụng")).build());
        exercises.add(Exercise.builder().name("Plank").description("Giữ thẳng người tĩnh tập core.").equipment("Bodyweight").muscleGroup(mgMap.get("Bụng")).build());
        exercises.add(Exercise.builder().name("Leg Raise").description("Nằm dang thẳng gập chân lên.").equipment("Bodyweight").muscleGroup(mgMap.get("Bụng")).build());
        exercises.add(Exercise.builder().name("Russian Twist").description("Xoay người cầm bánh tạ hoặc bóng tạ.").equipment("Weighted").muscleGroup(mgMap.get("Bụng")).build());
        exercises.add(Exercise.builder().name("Ab Wheel Rollout").description("Lăn bánh xe tập bụng.").equipment("Ab Wheel").muscleGroup(mgMap.get("Bụng")).build());
        exercises.add(Exercise.builder().name("Hanging Leg Raise").description("Treo người đu xà gập chân.").equipment("Bars").muscleGroup(mgMap.get("Bụng")).build());

        // Tay Trước (Biceps)
        exercises.add(Exercise.builder().name("Barbell Bicep Curl").description("Cuốn tạ đòn tay trước.").equipment("Barbell").muscleGroup(mgMap.get("Tay Trước")).build());
        exercises.add(Exercise.builder().name("Dumbbell Curl").description("Cuốn tạ đơn đứng luân phiên.").equipment("Dumbbell").muscleGroup(mgMap.get("Tay Trước")).build());
        exercises.add(Exercise.builder().name("Hammer Curl").description("Cuốn tạ đơn cầm dọc (như cái búa).").equipment("Dumbbell").muscleGroup(mgMap.get("Tay Trước")).build());
        exercises.add(Exercise.builder().name("Preacher Curl").description("Cuốn tạ trên ghế cô lập bắp tay.").equipment("Machine").muscleGroup(mgMap.get("Tay Trước")).build());
        exercises.add(Exercise.builder().name("Concentration Curl").description("Ngồi cuốn tạ đơn cô lập một tay.").equipment("Dumbbell").muscleGroup(mgMap.get("Tay Trước")).build());

        // Tay Sau (Triceps)
        exercises.add(Exercise.builder().name("Tricep Pushdown").description("Kéo cáp tay sau đòn ngang hoặc thừng.").equipment("Cable").muscleGroup(mgMap.get("Tay Sau")).build());
        exercises.add(Exercise.builder().name("Skull Crusher").description("Nằm ghế đẩy tạ EZ qua đầu.").equipment("EZ Bar").muscleGroup(mgMap.get("Tay Sau")).build());
        exercises.add(Exercise.builder().name("Overhead Tricep Extension").description("Kéo cáp hoặc đẩy tạ đơn qua đầu.").equipment("Cable").muscleGroup(mgMap.get("Tay Sau")).build());
        exercises.add(Exercise.builder().name("Close Grip Bench Press").description("Đẩy ngực ngang cầm chụm tay.").equipment("Barbell").muscleGroup(mgMap.get("Tay Sau")).build());
        exercises.add(Exercise.builder().name("Tricep Kickback").description("Cúi tì ghế bật tạ đơn tay sau.").equipment("Dumbbell").muscleGroup(mgMap.get("Tay Sau")).build());

        // Cardio
        exercises.add(Exercise.builder().name("Treadmill Running").description("Chạy bộ trên máy.").equipment("Cardio Machine").muscleGroup(mgMap.get("Cardio")).build());
        exercises.add(Exercise.builder().name("Cycling").description("Đạp xe tốc độ cao trên máy.").equipment("Cardio Machine").muscleGroup(mgMap.get("Cardio")).build());
        exercises.add(Exercise.builder().name("Elliptical").description("Tập leo cầu thang / trượt tuyết trên Elliptical.").equipment("Cardio Machine").muscleGroup(mgMap.get("Cardio")).build());
        exercises.add(Exercise.builder().name("Rowing Machine").description("Kéo thuyền máy (Rowing).").equipment("Cardio Machine").muscleGroup(mgMap.get("Cardio")).build());
        exercises.add(Exercise.builder().name("Burpees").description("Chuỗi hít đất bật nhảy toàn thân.").equipment("Bodyweight").muscleGroup(mgMap.get("Cardio")).build());

        exerciseRepository.saveAll(exercises);
        Map<String, Exercise> exMap = exerciseRepository.findAll().stream()
                .collect(Collectors.toMap(Exercise::getName, ex -> ex));

        GoalType tangCo = goalTypeRepository.findAll().stream().filter(g -> g.getName().equals("Tăng Cơ")).findFirst().orElse(null);
        GoalType giamCan = goalTypeRepository.findAll().stream().filter(g -> g.getName().equals("Giảm Cân")).findFirst().orElse(null);

        // 4. Seed Workout Plans
        seedWorkoutPlans(tangCo, giamCan, exMap);
        //5. add meal and food
        seedMealFood();
        //6. add images from static folder
        seedImages(exMap);
    }

    private void seedMealFood() {

        if (foodRepository.count() > 0) {
            return;
        }

        // =========================
        // 1. Seed Food
        // =========================
        List<Food> foods = List.of(
                Food.builder().name("Cơm trắng").caloriesPer100g(130f).proteinPer100g(2.7f).carbsPer100g(28f).fatsPer100g(0.3f).unit("g").build(),
                Food.builder().name("Ức gà").caloriesPer100g(165f).proteinPer100g(31f).carbsPer100g(0f).fatsPer100g(3.6f).unit("g").build(),
                Food.builder().name("Trứng gà").caloriesPer100g(155f).proteinPer100g(13f).carbsPer100g(1.1f).fatsPer100g(11f).unit("quả").build(),
                Food.builder().name("Khoai lang").caloriesPer100g(86f).proteinPer100g(1.6f).carbsPer100g(20f).fatsPer100g(0.1f).unit("g").build(),
                Food.builder().name("Cá hồi").caloriesPer100g(208f).proteinPer100g(20f).carbsPer100g(0f).fatsPer100g(13f).unit("g").build(),
                Food.builder().name("Chuối").caloriesPer100g(89f).proteinPer100g(1.1f).carbsPer100g(23f).fatsPer100g(0.3f).unit("g").build(),
                Food.builder().name("Yến mạch").caloriesPer100g(389f).proteinPer100g(17f).carbsPer100g(66f).fatsPer100g(7f).unit("g").build(),
                Food.builder().name("Thịt bò nạc").caloriesPer100g(250f).proteinPer100g(26f).carbsPer100g(0f).fatsPer100g(15f).unit("g").build(),
                Food.builder().name("Sữa tươi không đường").caloriesPer100g(42f).proteinPer100g(3.4f).carbsPer100g(5f).fatsPer100g(1f).unit("ml").build(),
                Food.builder().name("Đậu hũ").caloriesPer100g(76f).proteinPer100g(8f).carbsPer100g(1.9f).fatsPer100g(4.8f).unit("g").build()
        );

        foodRepository.saveAll(foods);

    }
    private void seedWorkoutPlans(GoalType tangCo, GoalType giamCan, Map<String, Exercise> exMap) {
        // Plan 1: Beginner Full Body (3 days)
        WorkoutPlan plan1 = WorkoutPlan.builder()
                .name("Newbie Full Body (3 Ngày/Tuần)")
                .description("Lịch tập toàn thân cơ bản (Thứ 2-4-6) thiết kế đặc biệt cho người hoàn toàn mới tập gym, giúp làm quen các bài tập compound hiệu quả nhất.")
                .difficultyLevel("Beginner")
                .estimatedDurationMinutes(60)
                .isSystemPlan(true)
                .goalType(tangCo)
                .build();

        // Day 1
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Barbell Squat")).dayOfWeek(1).orderIndex(1).sets(3).reps(10).restSeconds(90).build());
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Barbell Bench Press")).dayOfWeek(1).orderIndex(2).sets(3).reps(10).restSeconds(90).build());
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Lat Pulldown")).dayOfWeek(1).orderIndex(3).sets(3).reps(12).restSeconds(60).build());
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Crunch")).dayOfWeek(1).orderIndex(4).sets(3).reps(15).restSeconds(60).build());
        // Day 3
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Leg Press")).dayOfWeek(3).orderIndex(1).sets(3).reps(12).restSeconds(90).build());
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Overhead Press")).dayOfWeek(3).orderIndex(2).sets(3).reps(10).restSeconds(90).build());
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Barbell Row")).dayOfWeek(3).orderIndex(3).sets(3).reps(10).restSeconds(90).build());
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Plank")).dayOfWeek(3).orderIndex(4).sets(3).reps(1).restSeconds(60).build());
        // Day 5
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Romanian Deadlift")).dayOfWeek(5).orderIndex(1).sets(3).reps(10).restSeconds(90).build());
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Push Up")).dayOfWeek(5).orderIndex(2).sets(3).reps(15).restSeconds(60).build());
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Pull Up")).dayOfWeek(5).orderIndex(3).sets(3).reps(8).restSeconds(90).build());
        plan1.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Treadmill Running")).dayOfWeek(5).orderIndex(4).sets(1).reps(15).restSeconds(0).build()); // 15 mins
        workoutPlanRepository.save(plan1);

        // Plan 2: Push Pull Legs (6 days)
        WorkoutPlan plan2 = WorkoutPlan.builder()
                .name("Push Pull Legs - PPL (6 Ngày/Tuần)")
                .description("Lịch tập PPL tiêu chuẩn cường độ cao, phù hợp cho người tập lâu năm muốn tối đa hóa sự phát triển cơ bắp và khối lượng tập luyện.")
                .difficultyLevel("Advanced")
                .estimatedDurationMinutes(75)
                .isSystemPlan(true)
                .goalType(tangCo)
                .build();

        // Push 1 (Monday)
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Barbell Bench Press")).dayOfWeek(1).orderIndex(1).sets(4).reps(8).restSeconds(120).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Incline Dumbbell Press")).dayOfWeek(1).orderIndex(2).sets(3).reps(10).restSeconds(90).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Overhead Press")).dayOfWeek(1).orderIndex(3).sets(4).reps(8).restSeconds(120).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Lateral Raise")).dayOfWeek(1).orderIndex(4).sets(4).reps(15).restSeconds(60).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Tricep Pushdown")).dayOfWeek(1).orderIndex(5).sets(3).reps(12).restSeconds(60).build());
        
        // Pull 1 (Tuesday)
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Deadlift")).dayOfWeek(2).orderIndex(1).sets(4).reps(5).restSeconds(180).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Lat Pulldown")).dayOfWeek(2).orderIndex(2).sets(3).reps(10).restSeconds(90).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Dumbbell Row")).dayOfWeek(2).orderIndex(3).sets(3).reps(10).restSeconds(90).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Face Pull")).dayOfWeek(2).orderIndex(4).sets(3).reps(15).restSeconds(60).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Barbell Bicep Curl")).dayOfWeek(2).orderIndex(5).sets(4).reps(10).restSeconds(60).build());

        // Legs 1 (Wednesday)
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Barbell Squat")).dayOfWeek(3).orderIndex(1).sets(4).reps(8).restSeconds(180).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Leg Press")).dayOfWeek(3).orderIndex(2).sets(3).reps(12).restSeconds(120).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Romanian Deadlift")).dayOfWeek(3).orderIndex(3).sets(3).reps(10).restSeconds(120).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Leg Extension")).dayOfWeek(3).orderIndex(4).sets(3).reps(15).restSeconds(60).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Calf Raise")).dayOfWeek(3).orderIndex(5).sets(4).reps(15).restSeconds(60).build());

        // Push 2 (Thursday)
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Overhead Press")).dayOfWeek(4).orderIndex(1).sets(4).reps(8).restSeconds(120).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Incline Dumbbell Press")).dayOfWeek(4).orderIndex(2).sets(3).reps(10).restSeconds(90).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Chest Fly")).dayOfWeek(4).orderIndex(3).sets(3).reps(12).restSeconds(60).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Lateral Raise")).dayOfWeek(4).orderIndex(4).sets(4).reps(15).restSeconds(60).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Skull Crusher")).dayOfWeek(4).orderIndex(5).sets(3).reps(10).restSeconds(60).build());

        // Pull 2 (Friday)
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Barbell Row")).dayOfWeek(5).orderIndex(1).sets(4).reps(8).restSeconds(120).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Pull Up")).dayOfWeek(5).orderIndex(2).sets(3).reps(10).restSeconds(90).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Seated Cable Row")).dayOfWeek(5).orderIndex(3).sets(3).reps(12).restSeconds(90).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Reverse Pec Deck")).dayOfWeek(5).orderIndex(4).sets(3).reps(15).restSeconds(60).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Hammer Curl")).dayOfWeek(5).orderIndex(5).sets(3).reps(12).restSeconds(60).build());

        // Legs 2 (Saturday)
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Leg Press")).dayOfWeek(6).orderIndex(1).sets(4).reps(10).restSeconds(120).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Bulgarian Split Squat")).dayOfWeek(6).orderIndex(2).sets(3).reps(10).restSeconds(90).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Leg Curl")).dayOfWeek(6).orderIndex(3).sets(3).reps(12).restSeconds(60).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Walking Lunges")).dayOfWeek(6).orderIndex(4).sets(3).reps(20).restSeconds(90).build());
        plan2.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Ab Wheel Rollout")).dayOfWeek(6).orderIndex(5).sets(3).reps(12).restSeconds(60).build());
        
        workoutPlanRepository.save(plan2);

        // Plan 3: Lịch Giảm Mỡ Cấp Tốc (4 Ngày/Tuần)
        WorkoutPlan plan3 = WorkoutPlan.builder()
                .name("Giảm Mỡ Cardio & Tạ Phối Hợp")
                .description("Thiết kế dành riêng cho vòng eo thon gọn, kết hợp tạ cường độ nhẹ và các bài Cardio, HIIT nhằm đốt cháy lượng calo khổng lồ.")
                .difficultyLevel("Intermediate")
                .estimatedDurationMinutes(50)
                .isSystemPlan(true)
                .goalType(giamCan)
                .build();
        
        // Day 2 (Tuesday) - Upper + Cardio
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Push Up")).dayOfWeek(2).orderIndex(1).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Lat Pulldown")).dayOfWeek(2).orderIndex(2).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Dumbbell Shoulder Press")).dayOfWeek(2).orderIndex(3).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Burpees")).dayOfWeek(2).orderIndex(4).sets(4).reps(10).restSeconds(60).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Treadmill Running")).dayOfWeek(2).orderIndex(5).sets(1).reps(20).restSeconds(0).build());

        // Day 3 (Wednesday) - Lower + Core
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Leg Press")).dayOfWeek(3).orderIndex(1).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Walking Lunges")).dayOfWeek(3).orderIndex(2).sets(3).reps(20).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Crunch")).dayOfWeek(3).orderIndex(3).sets(4).reps(25).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Plank")).dayOfWeek(3).orderIndex(4).sets(3).reps(1).restSeconds(60).build()); // 1 phút
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Cycling")).dayOfWeek(3).orderIndex(5).sets(1).reps(20).restSeconds(0).build()); // 20 min

        // Day 5 (Friday) - Upper + Cardio
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Incline Dumbbell Press")).dayOfWeek(5).orderIndex(1).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Seated Cable Row")).dayOfWeek(5).orderIndex(2).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Lateral Raise")).dayOfWeek(5).orderIndex(3).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Burpees")).dayOfWeek(5).orderIndex(4).sets(4).reps(10).restSeconds(60).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Elliptical")).dayOfWeek(5).orderIndex(5).sets(1).reps(20).restSeconds(0).build());

        // Day 6 (Saturday) - Full Body Circuit
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Barbell Squat")).dayOfWeek(6).orderIndex(1).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Overhead Press")).dayOfWeek(6).orderIndex(2).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Lat Pulldown")).dayOfWeek(6).orderIndex(3).sets(3).reps(15).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Russian Twist")).dayOfWeek(6).orderIndex(4).sets(3).reps(20).restSeconds(45).build());
        plan3.addExercise(WorkoutPlanExercise.builder().exercise(exMap.get("Rowing Machine")).dayOfWeek(6).orderIndex(5).sets(1).reps(15).restSeconds(0).build()); // 15 min
        
        workoutPlanRepository.save(plan3);
    }

    private void seedImages(Map<String, Exercise> exMap) {
        long imageCount = imageRepository.count();
        if (imageCount > 0) {
            // Check nếu đã có URL đúng (CloudFront) → skip
            boolean alreadySeeded = imageRepository.findAll().stream()
                    .anyMatch(img -> img.getUrl() != null && img.getUrl().contains("cloudfront.net"));
            if (alreadySeeded) {
                log.info("Images already seeded with correct S3 URLs. Skipping.");
                return;
            }
            // Data cũ (URL không phải CloudFront) → xóa và seed lại
            log.info("Detected {} stale image records. Clearing and re-seeding from S3...", imageCount);
            imageRepository.deleteAll();
        }

        log.info("Seeding images from S3 JSON...");
        ObjectMapper mapper = new ObjectMapper();
        List<com.example.fitme.module.media.entity.Image> imagesToSave = new ArrayList<>();
        List<Food> allFoods = foodRepository.findAll();
        List<WorkoutPlan> allPlans = workoutPlanRepository.findAll();

        try (InputStream is = new org.springframework.core.io.ClassPathResource("s3_images_upload.json").getInputStream()) {
            JsonNode root = mapper.readTree(is);
            JsonNode imagesNode = root.get("images");
            if (imagesNode == null || !imagesNode.isArray()) {
                log.warn("s3_images_upload.json does not contain an 'images' array.");
                return;
            }

            for (JsonNode imgNode : imagesNode) {
                String bucket = imgNode.get("bucket").asText();
                String s3Key = imgNode.get("s3_key").asText();
                String folder = imgNode.get("folder").asText();
                String filename = imgNode.get("filename").asText();
                
                // Ưu tiên cloudfront_url từ JSON (tránh lộ S3 bucket), fallback về path-style S3 URL
                JsonNode cfNode = imgNode.get("cloudfront_url");
                String imageUrl;
                if (cfNode != null && !cfNode.isNull() && !cfNode.asText().isEmpty()) {
                    imageUrl = cfNode.asText();
                } else {
                    String region = "ap-southeast-1";
                    imageUrl = "https://s3." + region + ".amazonaws.com/" + bucket + "/" + s3Key;
                    imageUrl = imageUrl.replace(" ", "%20");
                }

                // Normalize: hyphens → spaces để so khớp với tên entity trong DB
                // VD: "ab-wheel-rollout" → "ab wheel rollout", so với "Ab Wheel Rollout".toLowerCase()
                String nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')).toLowerCase();
                String nameNormalized = nameWithoutExt.replace("-", " ");

                com.example.fitme.module.media.entity.Image img = new com.example.fitme.module.media.entity.Image();
                img.setUrl(imageUrl);
                img.setIsThumbnail(true);

                boolean matched = false;

                if ("exercises".equals(folder)) {
                    Exercise matchedEx = exMap.values().stream()
                            .filter(e -> {
                                String exName = e.getName().toLowerCase();
                                // Match 1: hyphens→spaces  ("ab-wheel-rollout" → "ab wheel rollout" == "ab wheel rollout")
                                if (exName.equals(nameNormalized)) return true;
                                // Match 2: spaces→hyphens  ("t-bar row" → "t-bar-row" == "t-bar-row")
                                if (exName.replace(" ", "-").equals(nameWithoutExt)) return true;
                                return false;
                            })
                            .findFirst().orElse(null);
                    if (matchedEx != null) {
                        img.setExercise(matchedEx);
                        matched = true;
                    } else {
                        log.warn("No exercise matched for filename: {}", filename);
                    }
                } else if ("foods".equals(folder)) {
                    // Thử match trực tiếp tên food (lowercase) với nameNormalized
                    Food matchedFood = allFoods.stream()
                            .filter(f -> f.getName().toLowerCase().equals(nameNormalized))
                            .findFirst().orElse(null);
                    if (matchedFood == null) {
                        // Fallback: keyword matching (hỗ trợ cả hyphens)
                        if (nameNormalized.contains("com trang") || nameWithoutExt.contains("com-trang"))
                            matchedFood = allFoods.stream().filter(f -> f.getName().contains("Cơm")).findFirst().orElse(null);
                        else if (nameNormalized.contains("ức gà") || nameWithoutExt.contains("ức-gà"))
                            matchedFood = allFoods.stream().filter(f -> f.getName().contains("Ức")).findFirst().orElse(null);
                        else if (nameNormalized.contains("cá hồi") || nameWithoutExt.contains("cá-hồi"))
                            matchedFood = allFoods.stream().filter(f -> f.getName().contains("Cá")).findFirst().orElse(null);
                        else if (nameNormalized.contains("chuối") || nameWithoutExt.contains("chuối"))
                            matchedFood = allFoods.stream().filter(f -> f.getName().contains("Chuối")).findFirst().orElse(null);
                        else if (nameNormalized.contains("khoai lang") || nameWithoutExt.contains("khoai-lang"))
                            matchedFood = allFoods.stream().filter(f -> f.getName().contains("Khoai")).findFirst().orElse(null);
                        else if (nameNormalized.contains("sữa tươi") || nameWithoutExt.contains("sữa-tươi"))
                            matchedFood = allFoods.stream().filter(f -> f.getName().contains("Sữa")).findFirst().orElse(null);
                        else if (nameWithoutExt.equals("thit-bo-nac") || nameNormalized.contains("thit bo nac"))
                            // "Thịt bò nạc" là food duy nhất startsWith("th") — dùng ASCII filter tránh Unicode mismatch
                            matchedFood = allFoods.stream().filter(f -> f.getName().toLowerCase().startsWith("th")).findFirst().orElse(null);
                        else if (nameNormalized.contains("trứng gà") || nameWithoutExt.contains("trứng-gà"))
                            matchedFood = allFoods.stream().filter(f -> f.getName().contains("Trứng")).findFirst().orElse(null);
                        else if (nameNormalized.contains("yến mạch") || nameWithoutExt.contains("yến-mạch"))
                            matchedFood = allFoods.stream().filter(f -> f.getName().contains("Yến")).findFirst().orElse(null);
                        else if (nameNormalized.contains("đậu hũ") || nameWithoutExt.contains("đậu-hũ"))
                            matchedFood = allFoods.stream().filter(f -> f.getName().contains("Đậu")).findFirst().orElse(null);
                    }
                    if (matchedFood != null) {
                        img.setFood(matchedFood);
                        matched = true;
                    } else {
                        log.warn("No food matched for filename: {}", filename);
                    }
                } else if ("workoutPlans".equals(folder)) {
                    WorkoutPlan matchedPlan = null;
                    if (nameNormalized.contains("giảm mỡ") || nameWithoutExt.contains("giam-mo"))
                        matchedPlan = allPlans.stream().filter(p -> p.getName().contains("Giảm Mỡ")).findFirst().orElse(null);
                    else if (nameNormalized.contains("push pull") || nameWithoutExt.contains("push-pull"))
                        matchedPlan = allPlans.stream().filter(p -> p.getName().contains("Push Pull")).findFirst().orElse(null);
                    else if (nameNormalized.contains("newbie") || nameWithoutExt.contains("newbie"))
                        matchedPlan = allPlans.stream().filter(p -> p.getName().contains("Newbie")).findFirst().orElse(null);
                    if (matchedPlan != null) {
                        img.setWorkoutPlan(matchedPlan);
                        matched = true;
                    } else {
                        log.warn("No workoutPlan matched for filename: {}", filename);
                    }
                }

                if (matched) {
                    imagesToSave.add(img);
                }
            }

            if (!imagesToSave.isEmpty()) {
                imageRepository.saveAll(imagesToSave);
                log.info("Successfully seeded {} images to the database from S3 JSON.", imagesToSave.size());
            } else {
                log.warn("No matching images found to seed from JSON.");
            }
        } catch (Exception e) {
            log.error("Failed to seed S3 images: {}", e.getMessage(), e);
        }
    }
}
