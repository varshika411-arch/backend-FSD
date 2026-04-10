package com.achievetrack.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record EventRequest(
        @NotBlank(message = "Title is required")
        String title,
        String description,
        @NotNull(message = "Date is required")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date,
        @NotBlank(message = "Time is required")
        String time,
        @NotBlank(message = "Location is required")
        String location,
        @NotNull(message = "Maximum participants is required")
        @Min(value = 1, message = "Maximum participants must be at least 1")
        @JsonAlias("max_participants")
        Integer maxParticipants,
        String category,
        String status
) {
}
