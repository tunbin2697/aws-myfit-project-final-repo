package com.example.fitme.module.food.entity;

import com.example.fitme.common.entity.EntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "food")
@Entity
@SuperBuilder
public class Food extends EntityBase {
    private String name;
    private float caloriesPer100g;
    private float proteinPer100g;
    private float carbsPer100g;
    private float fatsPer100g;

    private String unit;

}
