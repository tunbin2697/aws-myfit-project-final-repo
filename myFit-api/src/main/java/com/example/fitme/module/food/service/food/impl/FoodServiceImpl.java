package com.example.fitme.module.food.service.food.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.food.dtos.food.FoodRequest;
import com.example.fitme.module.food.dtos.food.FoodResponse;
import com.example.fitme.module.food.entity.Food;
import com.example.fitme.module.food.mapper.food.FoodMapper;
import com.example.fitme.module.food.repository.FoodRepository;
import com.example.fitme.module.food.service.food.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

@Service
public class FoodServiceImpl implements FoodService {

    @Autowired
    private FoodRepository foodRepository;

    @Override
    public FoodResponse create(FoodRequest request) {
        Food food = FoodMapper.toEntity(request);

        Food savedFood = foodRepository.save(food);

        return FoodMapper.toResponse(savedFood);
    }

    @Override
    public FoodResponse update(UUID id, FoodRequest request) {

        Food food = foodRepository.findById(id).orElseThrow(
                () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Food with id " + id + " not found")
        );

        food.setCaloriesPer100g(request.caloriesPer100g());
        food.setProteinPer100g(request.proteinPer100g());
        food.setCarbsPer100g(request.carbsPer100g());
        food.setFatsPer100g(request.fatsPer100g());
        food.setUnit(request.unit());

        Food updated = foodRepository.save(food);

        return FoodMapper.toResponse(updated);
    }

    @Override
    public void delete(UUID id) {

        Food food = foodRepository.findById(id).orElseThrow(
                () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Food with id " + id + " not found")
        );

        foodRepository.delete(food);

    }

    @Override
    public FoodResponse findById(UUID id) {
        Food food = foodRepository.findById(id).orElseThrow(
                () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Food with id " + id + " not found")
        );

        return FoodMapper.toResponse(food);
    }

    @Override
    public Page<FoodResponse> findAll(Pageable pageable) {

        return foodRepository.findAll(pageable)
                .map(FoodMapper::toResponse);
    }


    @Override
    public List<FoodResponse> search(String keyword) {

        return foodRepository
                .findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(FoodMapper::toResponse)
                .toList();
    }

    @Override
    public List<FoodResponse> filter(Long categoryId,
                                     Double minCalories,
                                     Double maxCalories,
                                     Double minProtein,
                                     Double minCarb,
                                     Double minFat) {

        float minCal = minCalories != null ? minCalories.floatValue() : 0f;
        float maxCal = maxCalories != null ? maxCalories.floatValue() : Float.MAX_VALUE;
        float minPro = minProtein != null ? minProtein.floatValue() : 0f;

        return foodRepository
                .findByCaloriesPer100gBetweenAndProteinPer100gGreaterThanEqual(
                        minCal,
                        maxCal,
                        minPro
                )
                .stream()
                .map(FoodMapper::toResponse)
                .toList();
    }
}
