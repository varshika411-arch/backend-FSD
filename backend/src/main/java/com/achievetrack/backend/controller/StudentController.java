package com.achievetrack.backend.controller;

import com.achievetrack.backend.dto.ApiResponse;
import com.achievetrack.backend.dto.request.PortfolioRequest;
import com.achievetrack.backend.dto.request.StudentUpdateRequest;
import com.achievetrack.backend.security.AuthenticatedUser;
import com.achievetrack.backend.security.SecurityUtils;
import com.achievetrack.backend.service.StudentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String status
    ) {
        AuthenticatedUser currentUser = SecurityUtils.getAuthenticatedUser();
        List<Map<String, Object>> students = studentService.getStudents(currentUser, department, year, status);
        return ResponseEntity.ok(ApiResponse.success(students, students.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudent(id, SecurityUtils.getAuthenticatedUser())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Profile updated successfully",
                studentService.updateStudent(id, SecurityUtils.getAuthenticatedUser(), request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id, SecurityUtils.getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications() {
        List<Map<String, Object>> notifications = studentService.getNotifications(SecurityUtils.getAuthenticatedUser().id());
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Object>> markAllNotificationsAsRead() {
        studentService.markAllNotificationsAsRead(SecurityUtils.getAuthenticatedUser().id());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<ApiResponse<Object>> markNotificationAsRead(@PathVariable Long notificationId) {
        studentService.markNotificationAsRead(notificationId, SecurityUtils.getAuthenticatedUser().id());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @DeleteMapping("/notifications/{notificationId}")
    public ResponseEntity<ApiResponse<Object>> deleteNotification(@PathVariable Long notificationId) {
        studentService.deleteNotification(notificationId, SecurityUtils.getAuthenticatedUser().id());
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }

    @GetMapping("/portfolio")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPortfolio() {
        List<Map<String, Object>> portfolio = studentService.getPortfolio(SecurityUtils.getAuthenticatedUser().id());
        return ResponseEntity.ok(ApiResponse.success(portfolio));
    }

    @PostMapping("/portfolio")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPortfolio(@Valid @RequestBody PortfolioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(studentService.createPortfolio(SecurityUtils.getAuthenticatedUser().id(), request)));
    }

    @PutMapping("/portfolio/{portfolioId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePortfolio(
            @PathVariable Long portfolioId,
            @Valid @RequestBody PortfolioRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.updatePortfolio(SecurityUtils.getAuthenticatedUser().id(), portfolioId, request)
        ));
    }

    @DeleteMapping("/portfolio/{portfolioId}")
    public ResponseEntity<ApiResponse<Object>> deletePortfolio(@PathVariable Long portfolioId) {
        studentService.deletePortfolio(SecurityUtils.getAuthenticatedUser().id(), portfolioId);
        return ResponseEntity.ok(ApiResponse.success("Portfolio item deleted", null));
    }
}
