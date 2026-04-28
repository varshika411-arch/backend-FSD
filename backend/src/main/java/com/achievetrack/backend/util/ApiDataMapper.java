package com.achievetrack.backend.util;

import com.achievetrack.backend.model.Achievement;
import com.achievetrack.backend.model.Event;
import com.achievetrack.backend.model.EventRegistration;
import com.achievetrack.backend.model.Notification;
import com.achievetrack.backend.model.Portfolio;
import com.achievetrack.backend.model.User;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ApiDataMapper {

    public Map<String, Object> user(User user) {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("student_id", user.getStudentId());
        data.put("role", user.getRole());
        data.put("status", user.getStatus());
        data.put("phone", user.getPhone());
        data.put("department", user.getDepartment());
        data.put("year", user.getYear());
        data.put("bio", user.getBio());
        data.put("cgpa", user.getCgpa());
        data.put("date_of_birth", user.getDateOfBirth());
        data.put("profile_image", user.getProfileImage());
        data.put("created_at", user.getCreatedAt());
        data.put("updated_at", user.getUpdatedAt());
        return data;
    }

    public Map<String, Object> studentList(User user, long achievementCount, long approvedAchievements) {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>(user(user));
        data.put("achievementCount", achievementCount);
        data.put("approvedAchievements", approvedAchievements);
        return data;
    }

    public Map<String, Object> studentDetail(User user, Map<String, Object> stats) {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>(user(user));
        data.put("stats", stats);
        return data;
    }

    public Map<String, Object> achievement(Achievement achievement, User student, User verifiedBy) {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("id", achievement.getId());
        data.put("student_id", achievement.getStudentId());
        data.put("title", achievement.getTitle());
        data.put("description", achievement.getDescription());
        data.put("category", achievement.getCategory());
        data.put("date", achievement.getDate());
        data.put("evidence_url", achievement.getEvidenceUrl());
        data.put("status", achievement.getStatus());
        data.put("points", achievement.getPoints());
        data.put("verified", achievement.getVerified());
        data.put("verified_by", achievement.getVerifiedBy());
        data.put("verified_at", achievement.getVerifiedAt());
        data.put("rejection_reason", achievement.getRejectionReason());
        data.put("created_at", achievement.getCreatedAt());
        data.put("updated_at", achievement.getUpdatedAt());
        data.put("student_name", student != null ? student.getName() : null);
        data.put("student_number", student != null ? student.getStudentId() : null);
        data.put("student_email", student != null ? student.getEmail() : null);
        data.put("verified_by_name", verifiedBy != null ? verifiedBy.getName() : null);
        return data;
    }

    public Map<String, Object> event(Event event, User createdBy, long registeredCount, List<String> registeredStudents) {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("id", event.getId());
        data.put("title", event.getTitle());
        data.put("description", event.getDescription());
        data.put("date", event.getDate());
        data.put("time", event.getTime());
        data.put("location", event.getLocation());
        data.put("max_participants", event.getMaxParticipants());
        data.put("category", event.getCategory());
        data.put("status", event.getStatus());
        data.put("created_by", event.getCreatedBy());
        data.put("created_at", event.getCreatedAt());
        data.put("updated_at", event.getUpdatedAt());
        data.put("created_by_name", createdBy != null ? createdBy.getName() : null);
        data.put("registered_count", registeredCount);
        data.put("registeredStudents", registeredStudents);
        return data;
    }

    public Map<String, Object> eventRegistration(EventRegistration registration, User student) {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("id", registration.getId());
        data.put("event_id", registration.getEventId());
        data.put("student_id", registration.getStudentId());
        data.put("status", registration.getStatus());
        data.put("registered_at", registration.getRegisteredAt());
        if (student != null) {
            data.put("name", student.getName());
            data.put("email", student.getEmail());
            data.put("student_id", student.getStudentId());
            data.put("department", student.getDepartment());
            data.put("year", student.getYear());
        }
        return data;
    }

    public Map<String, Object> notification(Notification notification) {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("id", notification.getId());
        data.put("user_id", notification.getUserId());
        data.put("title", notification.getTitle());
        data.put("message", notification.getMessage());
        data.put("type", notification.getType());
        data.put("read", notification.getRead());
        data.put("created_at", notification.getCreatedAt());
        return data;
    }

    public Map<String, Object> portfolio(Portfolio portfolio) {
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("id", portfolio.getId());
        data.put("student_id", portfolio.getStudentId());
        data.put("title", portfolio.getTitle());
        data.put("description", portfolio.getDescription());
        data.put("category", portfolio.getCategory());
        data.put("link", portfolio.getLink());
        data.put("date", portfolio.getDate());
        data.put("created_at", portfolio.getCreatedAt());
        return data;
    }
}
