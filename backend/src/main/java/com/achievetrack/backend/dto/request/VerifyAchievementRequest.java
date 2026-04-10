package com.achievetrack.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record VerifyAchievementRequest(
        @NotBlank(message = "Status is required")
        String status,
        Integer points,
        @JsonAlias("rejection_reason")
        String rejectionReason
) {
}
