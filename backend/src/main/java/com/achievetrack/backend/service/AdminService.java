package com.achievetrack.backend.service;

import com.achievetrack.backend.exception.ApiException;
import com.achievetrack.backend.model.Achievement;
import com.achievetrack.backend.model.Event;
import com.achievetrack.backend.model.EventRegistration;
import com.achievetrack.backend.model.User;
import com.achievetrack.backend.repository.AchievementRepository;
import com.achievetrack.backend.repository.EventRegistrationRepository;
import com.achievetrack.backend.repository.EventRepository;
import com.achievetrack.backend.repository.UserRepository;
import com.achievetrack.backend.security.AuthenticatedUser;
import com.achievetrack.backend.security.SecurityUtils;
import com.achievetrack.backend.util.ApiDataMapper;
import java.time.LocalDate;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final ApiDataMapper mapper;

    public AdminService(
            UserRepository userRepository,
            AchievementRepository achievementRepository,
            EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            ApiDataMapper mapper
    ) {
        this.userRepository = userRepository;
        this.achievementRepository = achievementRepository;
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats(AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);

        List<Achievement> achievements = achievementRepository.findAllByOrderByCreatedAtDesc();
        List<Event> events = eventRepository.findAllByOrderByDateAsc();
        List<EventRegistration> registrations = eventRegistrationRepository.findAll().stream()
                .filter(registration -> "registered".equalsIgnoreCase(registration.getStatus()))
                .toList();
        Map<Long, User> usersById = loadUsersForAchievements(achievements);
        Map<Long, List<EventRegistration>> registrationsByEvent = registrations.stream()
                .collect(Collectors.groupingBy(EventRegistration::getEventId));

        LinkedHashMap<String, Object> achievementStats = new LinkedHashMap<>();
        achievementStats.put("total", (long) achievements.size());
        achievementStats.put("pending", achievements.stream().filter(achievement -> "pending".equalsIgnoreCase(achievement.getStatus())).count());
        achievementStats.put("approved", achievements.stream().filter(this::isApprovedLike).count());
        achievementStats.put("rejected", achievements.stream().filter(achievement -> "rejected".equalsIgnoreCase(achievement.getStatus())).count());

        LinkedHashMap<String, Object> eventStats = new LinkedHashMap<>();
        eventStats.put("total", (long) events.size());
        eventStats.put("upcoming", events.stream().filter(event -> !event.getDate().isBefore(LocalDate.now())).count());
        eventStats.put("past", events.stream().filter(event -> event.getDate().isBefore(LocalDate.now())).count());

        List<Map<String, Object>> recentAchievements = achievements.stream()
                .limit(5)
                .map(achievement -> {
                    LinkedHashMap<String, Object> data = new LinkedHashMap<>();
                    data.put("id", achievement.getId());
                    data.put("title", achievement.getTitle());
                    data.put("status", achievement.getStatus());
                    data.put("created_at", achievement.getCreatedAt());
                    User student = usersById.get(achievement.getStudentId());
                    data.put("student_name", student != null ? student.getName() : null);
                    return (Map<String, Object>) data;
                })
                .toList();

        List<Map<String, Object>> upcomingEvents = events.stream()
                .filter(event -> !event.getDate().isBefore(LocalDate.now()))
                .limit(5)
                .map(event -> {
                    LinkedHashMap<String, Object> data = new LinkedHashMap<>();
                    data.put("id", event.getId());
                    data.put("title", event.getTitle());
                    data.put("date", event.getDate());
                    data.put("time", event.getTime());
                    data.put("registered_count", registrationsByEvent.getOrDefault(event.getId(), List.of()).size());
                    return (Map<String, Object>) data;
                })
                .toList();

        List<Map<String, Object>> categoryBreakdown = achievements.stream()
                .collect(Collectors.groupingBy(Achievement::getCategory))
                .entrySet()
                .stream()
                .map(entry -> {
                    LinkedHashMap<String, Object> data = new LinkedHashMap<>();
                    data.put("category", entry.getKey());
                    data.put("count", entry.getValue().size());
                    data.put("approved", entry.getValue().stream().filter(this::isApprovedLike).count());
                    return (Map<String, Object>) data;
                })
                .toList();

        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("students", userRepository.countByRole("student"));
        data.put("achievements", achievementStats);
        data.put("events", eventStats);
        data.put("registrations", registrations.size());
        data.put("recentAchievements", recentAchievements);
        data.put("upcomingEvents", upcomingEvents);
        data.put("categoryBreakdown", categoryBreakdown);
        return data;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAchievementReport(
            AuthenticatedUser currentUser,
            LocalDate startDate,
            LocalDate endDate,
            String category
    ) {
        ensureAdmin(currentUser);

        List<Achievement> achievements = achievementRepository.findAll().stream()
                .filter(achievement -> startDate == null || !achievement.getDate().isBefore(startDate))
                .filter(achievement -> endDate == null || !achievement.getDate().isAfter(endDate))
                .filter(achievement -> !StringUtils.hasText(category) || Objects.equals(achievement.getCategory(), category))
                .toList();

        LinkedHashMap<String, Object> overview = new LinkedHashMap<>();
        overview.put("total", (long) achievements.size());
        overview.put("approved", achievements.stream().filter(this::isApprovedLike).count());
        overview.put("pending", achievements.stream().filter(achievement -> "pending".equalsIgnoreCase(achievement.getStatus())).count());
        overview.put("rejected", achievements.stream().filter(achievement -> "rejected".equalsIgnoreCase(achievement.getStatus())).count());
        overview.put("totalPoints", achievements.stream()
                .mapToInt(achievement -> achievement.getPoints() == null ? 0 : achievement.getPoints())
                .sum());

        Map<String, Map<String, Object>> byCategory = achievements.stream()
                .collect(Collectors.groupingBy(Achievement::getCategory, LinkedHashMap::new, Collectors.collectingAndThen(Collectors.toList(), list -> {
                    LinkedHashMap<String, Object> values = new LinkedHashMap<>();
                    values.put("count", list.size());
                    values.put("approved", list.stream().filter(this::isApprovedLike).count());
                    values.put("points", list.stream()
                            .filter(this::isApprovedLike)
                            .mapToInt(achievement -> achievement.getPoints() == null ? 0 : achievement.getPoints())
                            .sum());
                    return values;
                })));

        Map<String, Map<String, Object>> byMonth = achievements.stream()
                .collect(Collectors.groupingBy(
                        achievement -> achievement.getDate().toString().substring(0, 7),
                        LinkedHashMap::new,
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            LinkedHashMap<String, Object> values = new LinkedHashMap<>();
                            values.put("count", list.size());
                            values.put("approved", list.stream().filter(this::isApprovedLike).count());
                            return values;
                        })
                ));

        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("overview", overview);
        data.put("byCategory", byCategory);
        data.put("byMonth", byMonth);
        data.put("topStudents", buildTopStudents());
        return data;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingAchievements(AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);

        List<Achievement> achievements = achievementRepository.findByStatusOrderByCreatedAtDesc("pending");
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
    public Map<String, Object> getEventReport(
            AuthenticatedUser currentUser,
            LocalDate startDate,
            LocalDate endDate,
            String category
    ) {
        ensureAdmin(currentUser);

        List<Event> events = eventRepository.findAll().stream()
                .filter(event -> startDate == null || !event.getDate().isBefore(startDate))
                .filter(event -> endDate == null || !event.getDate().isAfter(endDate))
                .filter(event -> !StringUtils.hasText(category) || Objects.equals(event.getCategory(), category))
                .toList();

        List<EventRegistration> registrations = eventRegistrationRepository.findAll().stream()
                .filter(registration -> "registered".equalsIgnoreCase(registration.getStatus()))
                .toList();
        Map<Long, List<EventRegistration>> registrationsByEvent = registrations.stream()
                .collect(Collectors.groupingBy(EventRegistration::getEventId));
        Map<Long, User> usersById = userRepository.findAllById(events.stream()
                        .map(Event::getCreatedBy)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        List<Map<String, Object>> allEvents = events.stream()
                .map(event -> {
                    int registrationCount = registrationsByEvent.getOrDefault(event.getId(), List.of()).size();
                    LinkedHashMap<String, Object> data = new LinkedHashMap<>(mapper.event(
                            event,
                            event.getCreatedBy() == null ? null : usersById.get(event.getCreatedBy()),
                            registrationCount,
                            List.of()
                    ));
                    data.put("registration_count", registrationCount);
                    data.put("fill_rate", fillRate(registrationCount, event.getMaxParticipants()));
                    return (Map<String, Object>) data;
                })
                .toList();

        int totalRegistrations = allEvents.stream()
                .mapToInt(event -> ((Number) event.get("registration_count")).intValue())
                .sum();

        LinkedHashMap<String, Object> overview = new LinkedHashMap<>();
        overview.put("total", (long) events.size());
        overview.put("upcoming", events.stream().filter(event -> !event.getDate().isBefore(LocalDate.now())).count());
        overview.put("past", events.stream().filter(event -> event.getDate().isBefore(LocalDate.now())).count());
        overview.put("totalRegistrations", totalRegistrations);
        overview.put("averageFillRate", events.isEmpty()
                ? "0.00"
                : String.format(
                        Locale.US,
                        "%.2f",
                        allEvents.stream()
                                .mapToDouble(event -> Double.parseDouble(String.valueOf(event.get("fill_rate"))))
                                .average()
                                .orElse(0.0)
                ));

        Map<String, Map<String, Object>> byCategory = allEvents.stream()
                .collect(Collectors.groupingBy(
                        event -> String.valueOf(event.get("category")),
                        LinkedHashMap::new,
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            LinkedHashMap<String, Object> values = new LinkedHashMap<>();
                            values.put("count", list.size());
                            values.put("registrations", list.stream()
                                    .mapToInt(item -> ((Number) item.get("registration_count")).intValue())
                                    .sum());
                            return values;
                        })
                ));

        Map<String, Map<String, Object>> byMonth = allEvents.stream()
                .collect(Collectors.groupingBy(
                        event -> String.valueOf(event.get("date")).substring(0, 7),
                        LinkedHashMap::new,
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            LinkedHashMap<String, Object> values = new LinkedHashMap<>();
                            values.put("count", list.size());
                            values.put("registrations", list.stream()
                                    .mapToInt(item -> ((Number) item.get("registration_count")).intValue())
                                    .sum());
                            return values;
                        })
                ));

        List<Map<String, Object>> popularEvents = allEvents.stream()
                .sorted((left, right) -> Integer.compare(
                        ((Number) right.get("registration_count")).intValue(),
                        ((Number) left.get("registration_count")).intValue()
                ))
                .limit(10)
                .map(event -> {
                    LinkedHashMap<String, Object> data = new LinkedHashMap<>();
                    data.put("id", event.get("id"));
                    data.put("title", event.get("title"));
                    data.put("date", event.get("date"));
                    data.put("registrations", event.get("registration_count"));
                    data.put("capacity", event.get("max_participants"));
                    data.put("fillRate", event.get("fill_rate"));
                    return (Map<String, Object>) data;
                })
                .toList();

        LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        data.put("overview", overview);
        data.put("byCategory", byCategory);
        data.put("byMonth", byMonth);
        data.put("popularEvents", popularEvents);
        data.put("allEvents", allEvents);
        return data;
    }

    private List<Map<String, Object>> buildTopStudents() {
        List<Achievement> achievements = achievementRepository.findAll();
        return userRepository.findByRole("student").stream()
                .map(student -> {
                    List<Achievement> studentAchievements = achievements.stream()
                            .filter(achievement -> Objects.equals(achievement.getStudentId(), student.getId()))
                            .toList();
                    long approvedAchievements = studentAchievements.stream().filter(this::isApprovedLike).count();
                    int totalPoints = studentAchievements.stream()
                            .filter(this::isApprovedLike)
                            .mapToInt(achievement -> achievement.getPoints() == null ? 0 : achievement.getPoints())
                            .sum();

                    LinkedHashMap<String, Object> data = new LinkedHashMap<>();
                    data.put("id", student.getId());
                    data.put("name", student.getName());
                    data.put("student_id", student.getStudentId());
                    data.put("total_achievements", studentAchievements.size());
                    data.put("approved_achievements", approvedAchievements);
                    data.put("total_points", totalPoints);
                    return (Map<String, Object>) data;
                })
                .sorted((left, right) -> Integer.compare(
                        ((Number) right.get("total_points")).intValue(),
                        ((Number) left.get("total_points")).intValue()
                ))
                .limit(10)
                .toList();
    }

    private Map<Long, User> loadUsersForAchievements(Collection<Achievement> achievements) {
        Set<Long> userIds = achievements.stream()
                .flatMap(achievement -> java.util.stream.Stream.of(achievement.getStudentId(), achievement.getVerifiedBy()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));
    }

    private String fillRate(int registrationCount, Integer maxParticipants) {
        int capacity = maxParticipants == null || maxParticipants == 0 ? 1 : maxParticipants;
        return String.format(Locale.US, "%.2f", registrationCount * 100.0 / capacity);
    }

    private boolean isApprovedLike(Achievement achievement) {
        return "accepted".equalsIgnoreCase(achievement.getStatus()) || "approved".equalsIgnoreCase(achievement.getStatus());
    }

    private void ensureAdmin(AuthenticatedUser currentUser) {
        if (!SecurityUtils.isAdmin(currentUser)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to access this route");
        }
    }
}
