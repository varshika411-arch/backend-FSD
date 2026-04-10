package com.achievetrack.backend.service;

import com.achievetrack.backend.dto.request.AchievementRequest;
import com.achievetrack.backend.dto.request.VerifyAchievementRequest;
import com.achievetrack.backend.exception.ApiException;
import com.achievetrack.backend.model.Achievement;
import com.achievetrack.backend.model.Notification;
import com.achievetrack.backend.model.User;
import com.achievetrack.backend.repository.AchievementRepository;
import com.achievetrack.backend.repository.NotificationRepository;
import com.achievetrack.backend.repository.UserRepository;
import com.achievetrack.backend.security.AuthenticatedUser;
import com.achievetrack.backend.security.SecurityUtils;
import com.achievetrack.backend.util.ApiDataMapper;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final FileStorageService fileStorageService;
    private final ApiDataMapper mapper;

    public AchievementService(
            AchievementRepository achievementRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            FileStorageService fileStorageService,
            ApiDataMapper mapper
    ) {
        this.achievementRepository = achievementRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.fileStorageService = fileStorageService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAchievements(
            AuthenticatedUser currentUser,
            String category,
            String status,
            Long studentId
    ) {
        List<Achievement> achievements = achievementRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(achievement -> SecurityUtils.isAdmin(currentUser)
                        ? studentId == null || Objects.equals(achievement.getStudentId(), studentId)
                        : Objects.equals(achievement.getStudentId(), currentUser.id()))
                .filter(achievement -> !StringUtils.hasText(category) || Objects.equals(achievement.getCategory(), category))
                .filter(achievement -> !StringUtils.hasText(status) || Objects.equals(achievement.getStatus(), status))
                .toList();

        Map<Long, User> usersById = loadUsersForAchievements(achievements);

        return achievements.stream()
                .map(achievement -> mapper.achievement(
                        achievement,
                        usersById.get(achievement.getStudentId()),
                        usersById.get(achievement.getVerifiedBy())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAchievement(Long id, AuthenticatedUser currentUser) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Achievement not found"));

        if (!SecurityUtils.isAdmin(currentUser) && !Objects.equals(achievement.getStudentId(), currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to access this achievement");
        }

        Map<Long, User> usersById = loadUsersForAchievements(List.of(achievement));
        return mapper.achievement(
                achievement,
                usersById.get(achievement.getStudentId()),
                usersById.get(achievement.getVerifiedBy())
        );
    }

    @Transactional
    public Map<String, Object> createAchievement(
            AuthenticatedUser currentUser,
            AchievementRequest request,
            MultipartFile evidence
    ) {
        String evidenceUrl = fileStorageService.storeAchievementEvidence(evidence);
        if (!StringUtils.hasText(evidenceUrl) && StringUtils.hasText(request.getEvidenceUrl())) {
            evidenceUrl = request.getEvidenceUrl().trim();
        }

        LocalDateTime now = LocalDateTime.now();
        Achievement achievement = Achievement.builder()
                .studentId(currentUser.id())
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(normalizeCategory(request.getCategory()))
                .date(request.getDate())
                .evidenceUrl(evidenceUrl)
                .status("pending")
                .points(0)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Achievement savedAchievement = achievementRepository.save(achievement);
        List<Notification> notifications = userRepository.findByRole("admin").stream()
                .map(admin -> Notification.builder()
                        .userId(admin.getId())
                        .title("New Achievement Submitted")
                        .message(currentUser.name() + " submitted a new achievement: " + savedAchievement.getTitle())
                        .type("achievement")
                        .read(false)
                        .createdAt(now)
                        .build())
                .toList();

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }

        User student = userRepository.findById(currentUser.id()).orElse(null);
        return mapper.achievement(savedAchievement, student, null);
    }

    @Transactional
    public Map<String, Object> updateAchievement(
            Long id,
            AuthenticatedUser currentUser,
            AchievementRequest request,
            MultipartFile evidence
    ) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Achievement not found"));

        if (!SecurityUtils.isAdmin(currentUser) && !Objects.equals(achievement.getStudentId(), currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to update this achievement");
        }

        if (!SecurityUtils.isAdmin(currentUser) && !"pending".equalsIgnoreCase(achievement.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Can only update pending achievements");
        }

        String evidenceUrl = fileStorageService.storeAchievementEvidence(evidence);
        if (!StringUtils.hasText(evidenceUrl)) {
            evidenceUrl = StringUtils.hasText(request.getEvidenceUrl()) ? request.getEvidenceUrl().trim() : achievement.getEvidenceUrl();
        }

        achievement.setTitle(request.getTitle().trim());
        achievement.setDescription(request.getDescription().trim());
        achievement.setCategory(normalizeCategory(request.getCategory()));
        achievement.setDate(request.getDate());
        achievement.setEvidenceUrl(evidenceUrl);
        achievement.setUpdatedAt(LocalDateTime.now());

        Achievement updatedAchievement = achievementRepository.save(achievement);
        Map<Long, User> usersById = loadUsersForAchievements(List.of(updatedAchievement));
        return mapper.achievement(
                updatedAchievement,
                usersById.get(updatedAchievement.getStudentId()),
                usersById.get(updatedAchievement.getVerifiedBy())
        );
    }

    @Transactional
    public void deleteAchievement(Long id, AuthenticatedUser currentUser) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Achievement not found"));

        if (!SecurityUtils.isAdmin(currentUser) && !Objects.equals(achievement.getStudentId(), currentUser.id())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to delete this achievement");
        }

        achievementRepository.delete(achievement);
    }

    @Transactional
    public Map<String, Object> verifyAchievement(Long id, AuthenticatedUser currentUser, VerifyAchievementRequest request) {
        ensureAdmin(currentUser);

        if (!Set.of("accepted", "approved", "rejected").contains(request.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status. Must be \"accepted\" or \"rejected\"");
        }

        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Achievement not found"));

        if (!"pending".equalsIgnoreCase(achievement.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending achievements can be verified");
        }

        String normalizedStatus = "accepted".equalsIgnoreCase(request.status()) ? "approved" : request.status();
        achievement.setStatus(normalizedStatus);
        achievement.setPoints(request.points() == null ? 0 : request.points());
        achievement.setVerifiedBy(currentUser.id());
        achievement.setVerifiedAt(LocalDateTime.now());
        achievement.setRejectionReason(StringUtils.hasText(request.rejectionReason()) ? request.rejectionReason().trim() : null);
        achievement.setUpdatedAt(LocalDateTime.now());

        Achievement savedAchievement = achievementRepository.save(achievement);

        String notificationMessage = "approved".equalsIgnoreCase(normalizedStatus)
                ? "Your achievement \"" + achievement.getTitle() + "\" has been approved!"
                : "Your achievement \"" + achievement.getTitle() + "\" was rejected. "
                        + (StringUtils.hasText(request.rejectionReason()) ? request.rejectionReason().trim() : "");

        notificationRepository.save(Notification.builder()
                .userId(achievement.getStudentId())
                .title("Achievement Verification")
                .message(notificationMessage)
                .type("achievement")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build());

        Map<Long, User> usersById = loadUsersForAchievements(List.of(savedAchievement));
        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("achievement", mapper.achievement(
                savedAchievement,
                usersById.get(savedAchievement.getStudentId()),
                usersById.get(savedAchievement.getVerifiedBy())
        ));
        data.put("student", getStudentSummary(savedAchievement.getStudentId()));
        return data;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentSummary(Long studentId) {
        User student = userRepository.findByIdAndRole(studentId, "student").orElse(null);
        if (student == null) {
            return null;
        }

        List<Achievement> achievements = achievementRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        long approved = achievements.stream().filter(this::isApprovedLike).count();
        long pending = achievements.stream().filter(achievement -> "pending".equalsIgnoreCase(achievement.getStatus())).count();
        long rejected = achievements.stream().filter(achievement -> "rejected".equalsIgnoreCase(achievement.getStatus())).count();
        int totalPoints = achievements.stream()
                .filter(this::isApprovedLike)
                .mapToInt(achievement -> achievement.getPoints() == null ? 0 : achievement.getPoints())
                .sum();

        LinkedHashMap<String, Object> achievementStats = new LinkedHashMap<>();
        achievementStats.put("total", (long) achievements.size());
        achievementStats.put("approved", approved);
        achievementStats.put("pending", pending);
        achievementStats.put("rejected", rejected);
        achievementStats.put("total_points", totalPoints);

        LinkedHashMap<String, Object> stats = new LinkedHashMap<>();
        stats.put("achievements", achievementStats);

        return mapper.studentDetail(student, stats);
    }

    private Map<Long, User> loadUsersForAchievements(Collection<Achievement> achievements) {
        Set<Long> userIds = achievements.stream()
                .flatMap(achievement -> java.util.stream.Stream.of(achievement.getStudentId(), achievement.getVerifiedBy()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));
    }

    private void ensureAdmin(AuthenticatedUser currentUser) {
        if (!SecurityUtils.isAdmin(currentUser)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to access this route");
        }
    }

    private boolean isApprovedLike(Achievement achievement) {
        return "accepted".equalsIgnoreCase(achievement.getStatus()) || "approved".equalsIgnoreCase(achievement.getStatus());
    }

    private String normalizeCategory(String category) {
        String normalized = category == null ? "" : category.trim().toLowerCase();
        return switch (normalized) {
            case "academic" -> "Academic";
            case "sports" -> "Sports";
            case "cultural", "arts" -> "Cultural";
            case "technical", "technical/it" -> "Technical";
            case "leadership" -> "Leadership";
            case "community", "community service" -> "Community Service";
            case "other" -> "Other";
            default -> category;
        };
    }
}
