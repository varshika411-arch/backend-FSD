package com.achievetrack.backend.service;

import com.achievetrack.backend.dto.request.PortfolioRequest;
import com.achievetrack.backend.dto.request.StudentUpdateRequest;
import com.achievetrack.backend.exception.ApiException;
import com.achievetrack.backend.model.Achievement;
import com.achievetrack.backend.model.Notification;
import com.achievetrack.backend.model.Portfolio;
import com.achievetrack.backend.model.User;
import com.achievetrack.backend.repository.AchievementRepository;
import com.achievetrack.backend.repository.EventRegistrationRepository;
import com.achievetrack.backend.repository.NotificationRepository;
import com.achievetrack.backend.repository.PortfolioRepository;
import com.achievetrack.backend.repository.UserRepository;
import com.achievetrack.backend.security.AuthenticatedUser;
import com.achievetrack.backend.security.SecurityUtils;
import com.achievetrack.backend.util.ApiDataMapper;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class StudentService {

    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final NotificationRepository notificationRepository;
    private final PortfolioRepository portfolioRepository;
    private final ApiDataMapper mapper;

    public StudentService(
            UserRepository userRepository,
            AchievementRepository achievementRepository,
            EventRegistrationRepository eventRegistrationRepository,
            NotificationRepository notificationRepository,
            PortfolioRepository portfolioRepository,
            ApiDataMapper mapper
    ) {
        this.userRepository = userRepository;
        this.achievementRepository = achievementRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.notificationRepository = notificationRepository;
        this.portfolioRepository = portfolioRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudents(
            AuthenticatedUser currentUser,
            String department,
            String year,
            String status
    ) {
        ensureAdmin(currentUser);

        List<User> students = userRepository.findByRoleOrderByNameAsc("student").stream()
                .filter(matches(user -> user.getDepartment(), department))
                .filter(matches(user -> user.getYear(), year))
                .filter(matches(user -> user.getStatus(), status))
                .toList();

        List<Achievement> allAchievements = achievementRepository.findAll();
        Map<Long, Long> achievementCounts = allAchievements.stream()
                .collect(Collectors.groupingBy(Achievement::getStudentId, Collectors.counting()));

        Map<Long, Long> approvedCounts = allAchievements.stream()
                .filter(this::isApprovedLike)
                .collect(Collectors.groupingBy(Achievement::getStudentId, Collectors.counting()));

        return students.stream()
                .map(student -> mapper.studentList(
                        student,
                        achievementCounts.getOrDefault(student.getId(), 0L),
                        approvedCounts.getOrDefault(student.getId(), 0L)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudent(Long id, AuthenticatedUser currentUser) {
        if (!SecurityUtils.isAdmin(currentUser) && !Objects.equals(currentUser.id(), id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to access this profile");
        }

        User student = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));

        List<Achievement> studentAchievements = achievementRepository.findByStudentIdOrderByCreatedAtDesc(id);
        long approved = studentAchievements.stream().filter(this::isApprovedLike).count();
        long pending = studentAchievements.stream().filter(achievement -> "pending".equalsIgnoreCase(achievement.getStatus())).count();
        long rejected = studentAchievements.stream().filter(achievement -> "rejected".equalsIgnoreCase(achievement.getStatus())).count();
        int totalPoints = studentAchievements.stream()
                .filter(this::isApprovedLike)
                .mapToInt(achievement -> achievement.getPoints() == null ? 0 : achievement.getPoints())
                .sum();

        LinkedHashMap<String, Object> achievementStats = new LinkedHashMap<>();
        achievementStats.put("total", (long) studentAchievements.size());
        achievementStats.put("approved", approved);
        achievementStats.put("pending", pending);
        achievementStats.put("rejected", rejected);
        achievementStats.put("total_points", totalPoints);

        LinkedHashMap<String, Object> stats = new LinkedHashMap<>();
        stats.put("achievements", achievementStats);
        stats.put("events", eventRegistrationRepository.countByStudentId(id));

        return mapper.studentDetail(student, stats);
    }

    @Transactional
    public Map<String, Object> updateStudent(Long id, AuthenticatedUser currentUser, StudentUpdateRequest request) {
        if (!SecurityUtils.isAdmin(currentUser) && !Objects.equals(currentUser.id(), id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to update this profile");
        }

        User student = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));

        student.setName(request.name().trim());
        student.setPhone(trimToNull(request.phone()));
        student.setDepartment(trimToNull(request.department()));
        student.setYear(trimToNull(request.year()));
        student.setBio(trimToNull(request.bio()));
        student.setCgpa(trimToNull(request.cgpa()));
        student.setDateOfBirth(request.dateOfBirth());
        student.setUpdatedAt(LocalDateTime.now());

        return mapper.user(userRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Long id, AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);
        User student = userRepository.findByIdAndRole(id, "student")
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));
        userRepository.delete(student);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::notification)
                .toList();
    }

    @Transactional
    public void markAllNotificationsAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> notification.setRead(true));
        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId, Long userId) {
        notificationRepository.findByIdAndUserId(notificationId, userId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        notificationRepository.findByIdAndUserId(notificationId, userId)
                .ifPresent(notificationRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPortfolio(Long userId) {
        return portfolioRepository.findByStudentIdOrderByDateDesc(userId).stream()
                .map(mapper::portfolio)
                .toList();
    }

    @Transactional
    public Map<String, Object> createPortfolio(Long userId, PortfolioRequest request) {
        Portfolio portfolio = Portfolio.builder()
                .studentId(userId)
                .title(request.title().trim())
                .description(trimToNull(request.description()))
                .category(request.category().trim())
                .link(trimToNull(request.link()))
                .date(request.date())
                .createdAt(LocalDateTime.now())
                .build();

        return mapper.portfolio(portfolioRepository.save(portfolio));
    }

    @Transactional
    public Map<String, Object> updatePortfolio(Long userId, Long portfolioId, PortfolioRequest request) {
        Portfolio portfolio = portfolioRepository.findByIdAndStudentId(portfolioId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Portfolio item not found"));

        portfolio.setTitle(request.title().trim());
        portfolio.setDescription(trimToNull(request.description()));
        portfolio.setCategory(request.category().trim());
        portfolio.setLink(trimToNull(request.link()));
        portfolio.setDate(request.date());

        return mapper.portfolio(portfolioRepository.save(portfolio));
    }

    @Transactional
    public void deletePortfolio(Long userId, Long portfolioId) {
        portfolioRepository.findByIdAndStudentId(portfolioId, userId)
                .ifPresent(portfolioRepository::delete);
    }

    private Predicate<User> matches(java.util.function.Function<User, String> extractor, String expected) {
        return user -> !StringUtils.hasText(expected) || Objects.equals(extractor.apply(user), expected);
    }

    private boolean isApprovedLike(Achievement achievement) {
        return "accepted".equalsIgnoreCase(achievement.getStatus()) || "approved".equalsIgnoreCase(achievement.getStatus());
    }

    private void ensureAdmin(AuthenticatedUser currentUser) {
        if (!SecurityUtils.isAdmin(currentUser)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to access this route");
        }
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
