package com.example.fitme.module.food.service.meal.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.authentication.service.UserProfileService.UserProfileService;
import com.example.fitme.module.food.dtos.meal.MealRequest;
import com.example.fitme.module.food.dtos.meal.MealResponse;
import com.example.fitme.module.food.entity.Meal;
import com.example.fitme.module.food.enums.MealType;
import com.example.fitme.module.food.mapper.meal.MealMapper;
import com.example.fitme.module.food.repository.MealRepository;
import com.example.fitme.module.food.service.meal.MealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class MealServiceImpl implements MealService {


    @Autowired
    private MealRepository mealRepository;
    @Autowired
    private UserProfileService userProfileService;
    @Override
    public MealResponse create(MealRequest request) {
        Meal meal = MealMapper.toEntity(request);

        meal.setUserProfile(userProfileService.findById(request.user_id()));

        Meal saved = mealRepository.save(meal);

        return MealMapper.toResponse(saved);
    }

    @Override
    public MealResponse update(UUID id, MealRequest request) {
        Meal meal = mealRepository.findById(id).orElseThrow(
                () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Meal with id " + id + " not found")
        );

        meal.setDate(request.date());
        meal.setMealType(request.mealType());
        meal.setNote(request.note());

        Meal updated = mealRepository.save(meal);

        return MealMapper.toResponse(updated);    }

    @Override
    public void delete(UUID id) {
        Meal meal = mealRepository.findById(id).orElseThrow(
                () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Meal with id " + id + " not found")
        );

        mealRepository.delete(meal);
    }

    @Override
    public MealResponse findById(UUID id) {
        Meal meal = mealRepository.findById(id).orElseThrow(
                () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Meal with id " + id + " not found")
        );

        return MealMapper.toResponse(meal);
    }

    @Override
    public Page<MealResponse> findAll(Pageable pageable) {

        return mealRepository.findAll(pageable)
                .map(MealMapper::toResponse);
    }

    @Override
    public List<MealResponse> findByDate(LocalDate date) {

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        return mealRepository.findByDateBetween(start, end)
                .stream()
                .map(MealMapper::toResponse)
                .toList();
    }

    @Override
    public List<MealResponse> findByMealType(String mealType) {

        MealType type = MealType.valueOf(mealType.toUpperCase());

        return mealRepository.findByMealType(type)
                .stream()
                .map(MealMapper::toResponse)
                .toList();    }

    @Override
    public List<Meal> findByDateBetween(LocalDateTime start, LocalDateTime end) {
        return (List<Meal>) mealRepository.findByDateBetween(start,end);
    }

    @Override
    public List<MealResponse> findByUserId(UUID id) {
        return mealRepository.findByUserProfileId(id)
                .stream().map(MealMapper::toResponse).toList();
    }
}
