package com.example.fitme.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    SUCCESS(1000, "Success", HttpStatus.OK),

    // error for auth service
    INVALID_INFO(4003, "Sai thông tin đăng nhập", HttpStatus.BAD_REQUEST),
    INVALID_USER_ID(4004, "Thông tin user không hợp lệ", HttpStatus.BAD_REQUEST),

    // error for health metrics service
    GOAL_TYPE_NOT_FOUND(4041, "Goal type không tồn tại", HttpStatus.NOT_FOUND),
    GOAL_TYPE_DUPLICATE(4091, "Goal type đã tồn tại", HttpStatus.CONFLICT),
    HEALTH_CALCULATION_NOT_FOUND(4042, "Không tìm thấy bản ghi tính toán", HttpStatus.NOT_FOUND),
    INVALID_METRICS_INPUT(4005, "Dữ liệu tính toán không hợp lệ", HttpStatus.BAD_REQUEST),
    
    // error for body metrics service
    BODY_METRIC_NOT_FOUND(4043, "Không tìm thấy body metric", HttpStatus.NOT_FOUND),
    BODY_METRIC_INVALID(4006, "Dữ liệu body metric không hợp lệ", HttpStatus.BAD_REQUEST),

    // error for workout module
    MUSCLE_GROUP_NOT_FOUND(4044, "Muscle group not found", HttpStatus.NOT_FOUND),
    MUSCLE_GROUP_DUPLICATE(4092, "Muscle group already exists", HttpStatus.CONFLICT),
    EXERCISE_NOT_FOUND(4045, "Exercise not found", HttpStatus.NOT_FOUND),
    EXERCISE_DUPLICATE(4093, "Exercise already exists", HttpStatus.CONFLICT),
    WORKOUT_PLAN_NOT_FOUND(4046, "Workout plan not found", HttpStatus.NOT_FOUND),
    WORKOUT_PLAN_DUPLICATE(4094, "Workout plan already exists", HttpStatus.CONFLICT),
    WORKOUT_PLAN_EXERCISE_NOT_FOUND(4047, "Workout plan exercise not found", HttpStatus.NOT_FOUND),

    // error for user workout plan module
    USER_WORKOUT_PLAN_NOT_FOUND(4048, "User workout plan not found", HttpStatus.NOT_FOUND),
    USER_WORKOUT_PLAN_EXERCISE_NOT_FOUND(4049, "User workout plan exercise not found", HttpStatus.NOT_FOUND),
    USER_WORKOUT_PLAN_FORBIDDEN(4031, "You do not own this workout plan", HttpStatus.FORBIDDEN),

    // custom handling error for user behavior for 4xx
    VALIDATION_ERROR(4000, "Validation failed", HttpStatus.BAD_REQUEST),
    MALFORMED_JSON(4001, "Malformed JSON request", HttpStatus.BAD_REQUEST),
    INVALID_INPUT(4002, "Invalid input", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(4010, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    FORBIDDEN_ACTION(4030, "Forbidden", HttpStatus.FORBIDDEN),

    RESOURCE_NOT_FOUND(4040, "Not found", HttpStatus.NOT_FOUND),
    DUPLICATE_RESOURCE(4090, "Conflict", HttpStatus.CONFLICT),

    UNSUPPORTED_MEDIA_TYPE(4150, "Unsupported media type", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    TOO_MANY_REQUESTS(4290, "Too many requests", HttpStatus.TOO_MANY_REQUESTS),

    REQUEST_FAILED(4999, "Request failed", HttpStatus.BAD_REQUEST),
    UNEXPECTED_ERROR(5000, "Unexpected error", HttpStatus.INTERNAL_SERVER_ERROR);
    private final int code;
    private final String defaultMessage;
    private final HttpStatus status;
}
