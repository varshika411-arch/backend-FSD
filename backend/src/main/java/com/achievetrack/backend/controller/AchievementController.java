package com.achievetrack.backend.controller;

import com.achievetrack.backend.dto.ApiResponse;
import com.achievetrack.backend.dto.request.AchievementRequest;
import com.achievetrack.backend.dto.request.VerifyAchievementRequest;
import com.achievetrack.backend.security.AuthenticatedUser;
import com.achievetrack.backend.security.SecurityUtils;
import com.achievetrack.backend.service.AchievementService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAchievements(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(name = "student_id", required = false) Long studentId
    ) {
        AuthenticatedUser currentUser = SecurityUtils.getAuthenticatedUser();
        List<Map<String, Object>> achievements = achievementService.getAchievements(currentUser, category, status, studentId);
        return ResponseEntity.ok(ApiResponse.success(achievements, achievements.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAchievement(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(achievementService.getAchievement(id, SecurityUtils.getAuthenticatedUser())));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAchievement(
            @Valid @ModelAttribute AchievementRequest request,
            @RequestParam(value = "evidence", required = false) MultipartFile evidence
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Achievement submitted successfully",
                        achievementService.createAchievement(SecurityUtils.getAuthenticatedUser(), request, evidence)
                ));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateAchievement(
            @PathVariable Long id,
            @Valid @ModelAttribute AchievementRequest request,
            @RequestParam(value = "evidence", required = false) MultipartFile evidence
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Achievement updated successfully",
                achievementService.updateAchievement(id, SecurityUtils.getAuthenticatedUser(), request, evidence)
        ));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyAchievement(
            @PathVariable Long id,
            @Valid @RequestBody VerifyAchievementRequest request
    ) {
        Map<String, Object> data = achievementService.verifyAchievement(id, SecurityUtils.getAuthenticatedUser(), request);
        Map<String, Object> achievement = (Map<String, Object>) data.get("achievement");
        String status = achievement == null ? "updated" : String.valueOf(achievement.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Achievement " + status, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteAchievement(@PathVariable Long id) {
        achievementService.deleteAchievement(id, SecurityUtils.getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success("Achievement deleted successfully", null));
    }
}
