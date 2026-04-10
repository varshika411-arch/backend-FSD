package com.achievetrack.backend.controller;

import com.achievetrack.backend.dto.ApiResponse;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/health")
    public ResponseEntity<ApiResponse<Object>> health() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return ResponseEntity.ok(ApiResponse.<Object>builder()
                    .success(true)
                    .status("success")
                    .message("AchieveTrack API is running")
                    .database("connected")
                    .timestamp(Instant.now().toString())
                    .build());
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.<Object>builder()
                            .success(false)
                            .status("error")
                            .message("Database unavailable")
                            .database("disconnected")
                            .timestamp(Instant.now().toString())
                            .build());
        }
    }
}
