package com.example.fitme.module.food.service.food;

import com.example.fitme.module.food.dtos.food.FoodRequest;
import com.example.fitme.module.food.dtos.food.FoodResponse;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;


public interface FoodService {

    FoodResponse create(FoodRequest request);

    FoodResponse update(UUID id, FoodRequest request);

    void delete(UUID id);

    FoodResponse findById(UUID id);

    Page<FoodResponse> findAll(Pageable pageable);

    List<FoodResponse> search(String keyword);

    List<FoodResponse> filter(
            Long categoryId,
            Double minCalories,
            Double maxCalories,
            Double minProtein,
            Double minCarb,
            Double minFat
    );

}
