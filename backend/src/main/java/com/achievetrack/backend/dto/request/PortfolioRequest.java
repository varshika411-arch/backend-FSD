package com.achievetrack.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record PortfolioRequest(
        @NotBlank(message = "Title is required")
        String title,
        String description,
        @NotBlank(message = "Category is required")
        String category,
        String link,
        @NotNull(message = "Date is required")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date
) {
}
