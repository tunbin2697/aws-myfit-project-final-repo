package com.example.fitme.module.media.entity;

import com.example.fitme.module.food.entity.Food;
import com.example.fitme.module.system_workout.entity.Exercise;
import com.example.fitme.module.system_workout.entity.WorkoutPlan;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "image")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "is_thumbnail")
    private Boolean isThumbnail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id")
    private Food food;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_plan_id")
    private WorkoutPlan workoutPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
