package com.achievetrack.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private final boolean success;
    private final String status;
    private final String message;
    private final T data;
    private final Long count;
    private final String database;
    private final String timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .status("success")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .status("success")
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, long count) {
        return ApiResponse.<T>builder()
                .success(true)
                .status("success")
                .data(data)
                .count(count)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data, long count) {
        return ApiResponse.<T>builder()
                .success(true)
                .status("success")
                .message(message)
                .data(data)
                .count(count)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .status("error")
                .message(message)
                .build();
    }
}
