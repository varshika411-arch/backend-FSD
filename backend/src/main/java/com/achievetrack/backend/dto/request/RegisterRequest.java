package com.achievetrack.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Name is required")
        String name,
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email")
        String email,
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,
        String studentId,
        @NotBlank(message = "Role is required")
        @Pattern(regexp = "student|admin", message = "Invalid role selected")
        String role,
        @NotBlank(message = "Phone is required")
        String phone
) {
}
