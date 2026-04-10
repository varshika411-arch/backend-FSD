package com.achievetrack.backend.controller;

import com.achievetrack.backend.dto.ApiResponse;
import com.achievetrack.backend.dto.request.StudentUpdateRequest;
import com.achievetrack.backend.dto.request.VerifyAchievementRequest;
import com.achievetrack.backend.security.SecurityUtils;
import com.achievetrack.backend.service.AdminService;
import com.achievetrack.backend.service.AchievementService;
import com.achievetrack.backend.service.StudentService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AchievementService achievementService;
    private final StudentService studentService;

    public AdminController(
            AdminService adminService,
            AchievementService achievementService,
            StudentService studentService
    ) {
        this.adminService = adminService;
        this.achievementService = achievementService;
        this.studentService = studentService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.getDashboardStats(SecurityUtils.getAuthenticatedUser())
        ));
    }

    @GetMapping("/achievements/pending")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPendingAchievements() {
        List<Map<String, Object>> achievements = adminService.getPendingAchievements(SecurityUtils.getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success(achievements, achievements.size()));
    }

    @PutMapping("/achievements/{id}/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyAchievement(
            @PathVariable Long id,
            @Valid @RequestBody VerifyAchievementRequest request
    ) {
        Map<String, Object> data = achievementService.verifyAchievement(id, SecurityUtils.getAuthenticatedUser(), request);
        Map<String, Object> achievement = (Map<String, Object>) data.get("achievement");
        String status = achievement == null ? "updated" : String.valueOf(achievement.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Achievement " + status, data));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Profile updated successfully",
                studentService.updateStudent(id, SecurityUtils.getAuthenticatedUser(), request)
        ));
    }

    @GetMapping("/reports/achievements")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAchievementReport(
            @RequestParam(name = "start_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "end_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.getAchievementReport(SecurityUtils.getAuthenticatedUser(), startDate, endDate, category)
        ));
    }

    @GetMapping("/reports/events")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEventReport(
            @RequestParam(name = "start_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "end_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.getEventReport(SecurityUtils.getAuthenticatedUser(), startDate, endDate, category)
        ));
    }
}
