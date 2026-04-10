package com.achievetrack.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record StudentUpdateRequest(
        @NotBlank(message = "Name is required")
        String name,
        String phone,
        String department,
        String year,
        String bio,
        String cgpa,
        @JsonAlias("date_of_birth")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate dateOfBirth
) {
}
