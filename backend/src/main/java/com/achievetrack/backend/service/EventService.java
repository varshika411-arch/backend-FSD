package com.achievetrack.backend.service;

import com.achievetrack.backend.dto.request.EventRequest;
import com.achievetrack.backend.exception.ApiException;
import com.achievetrack.backend.model.Event;
import com.achievetrack.backend.model.EventRegistration;
import com.achievetrack.backend.model.Notification;
import com.achievetrack.backend.model.User;
import com.achievetrack.backend.repository.EventRegistrationRepository;
import com.achievetrack.backend.repository.EventRepository;
import com.achievetrack.backend.repository.NotificationRepository;
import com.achievetrack.backend.repository.UserRepository;
import com.achievetrack.backend.security.AuthenticatedUser;
import com.achievetrack.backend.security.SecurityUtils;
import com.achievetrack.backend.util.ApiDataMapper;
import java.time.LocalDate;
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

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ApiDataMapper mapper;

    public EventService(
            EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            ApiDataMapper mapper
    ) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEvents(String category, String status, Boolean upcoming) {
        List<Event> events = eventRepository.findAllByOrderByDateAsc().stream()
                .filter(event -> !StringUtils.hasText(category) || Objects.equals(event.getCategory(), category))
                .filter(event -> !StringUtils.hasText(status) || Objects.equals(event.getStatus(), status))
                .filter(event -> !Boolean.TRUE.equals(upcoming) || !event.getDate().isBefore(LocalDate.now()))
                .toList();

        Map<Long, List<EventRegistration>> registrationsByEvent = getRegisteredEventMap(events);
        Map<Long, User> usersById = loadUsersForEvents(events, registrationsByEvent.values().stream().flatMap(Collection::stream).toList());

        return events.stream()
                .map(event -> toEventResponse(event, registrationsByEvent.getOrDefault(event.getId(), List.of()), usersById))
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));

        List<EventRegistration> registrations = eventRegistrationRepository.findByEventIdAndStatusOrderByRegisteredAtDesc(id, "registered");
        Map<Long, User> usersById = loadUsersForEvents(List.of(event), registrations);

        LinkedHashMap<String, Object> data = new LinkedHashMap<>(toEventResponse(event, registrations, usersById));
        data.put("registrations", registrations.stream()
                .map(registration -> mapper.eventRegistration(registration, usersById.get(registration.getStudentId())))
                .toList());
        return data;
    }

    @Transactional
    public Map<String, Object> createEvent(EventRequest request, AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);

        LocalDateTime now = LocalDateTime.now();
        Event event = Event.builder()
                .title(request.title().trim())
                .description(trimToNull(request.description()))
                .date(request.date())
                .time(request.time().trim())
                .location(request.location().trim())
                .maxParticipants(request.maxParticipants())
                .category(StringUtils.hasText(request.category()) ? request.category().trim() : "Other")
                .status(StringUtils.hasText(request.status()) ? request.status().trim() : "upcoming")
                .createdBy(currentUser.id())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Event savedEvent = eventRepository.save(event);
        User creator = userRepository.findById(currentUser.id()).orElse(null);
        return mapper.event(savedEvent, creator, 0L, List.of());
    }

    @Transactional
    public Map<String, Object> updateEvent(Long id, EventRequest request, AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));

        event.setTitle(request.title().trim());
        event.setDescription(trimToNull(request.description()));
        event.setDate(request.date());
        event.setTime(request.time().trim());
        event.setLocation(request.location().trim());
        event.setMaxParticipants(request.maxParticipants());
        event.setCategory(StringUtils.hasText(request.category()) ? request.category().trim() : event.getCategory());
        event.setStatus(StringUtils.hasText(request.status()) ? request.status().trim() : event.getStatus());
        event.setUpdatedAt(LocalDateTime.now());

        Event updatedEvent = eventRepository.save(event);
        List<EventRegistration> registrations = eventRegistrationRepository.findByEventIdAndStatusOrderByRegisteredAtDesc(updatedEvent.getId(), "registered");
        Map<Long, User> usersById = loadUsersForEvents(List.of(updatedEvent), registrations);
        return toEventResponse(updatedEvent, registrations, usersById);
    }

    @Transactional
    public void deleteEvent(Long id, AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));
        eventRepository.delete(event);
    }

    @Transactional
    public void registerForEvent(Long id, AuthenticatedUser currentUser) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));

        long registeredCount = eventRegistrationRepository.countByEventIdAndStatus(id, "registered");
        if (registeredCount >= event.getMaxParticipants()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Event is full");
        }

        if (eventRegistrationRepository.findByEventIdAndStudentId(id, currentUser.id()).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Already registered for this event");
        }

        eventRegistrationRepository.save(EventRegistration.builder()
                .eventId(id)
                .studentId(currentUser.id())
                .status("registered")
                .registeredAt(LocalDateTime.now())
                .build());

        notificationRepository.save(Notification.builder()
                .userId(currentUser.id())
                .title("Event Registration Confirmed")
                .message("You have successfully registered for " + event.getTitle())
                .type("event")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Transactional
    public void unregisterFromEvent(Long id, AuthenticatedUser currentUser) {
        EventRegistration registration = eventRegistrationRepository.findByEventIdAndStudentId(id, currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Registration not found"));

        eventRegistrationRepository.delete(registration);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEventRegistrations(Long id, AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);
        eventRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));

        List<EventRegistration> registrations = eventRegistrationRepository.findByEventIdAndStatusOrderByRegisteredAtDesc(id, "registered");
        Map<Long, User> usersById = userRepository.findAllById(registrations.stream()
                        .map(EventRegistration::getStudentId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        return registrations.stream()
                .map(registration -> mapper.eventRegistration(registration, usersById.get(registration.getStudentId())))
                .toList();
    }

    private Map<Long, List<EventRegistration>> getRegisteredEventMap(List<Event> events) {
        Set<Long> eventIds = events.stream().map(Event::getId).collect(Collectors.toSet());
        return eventRegistrationRepository.findAll().stream()
                .filter(registration -> eventIds.contains(registration.getEventId()))
                .filter(registration -> "registered".equalsIgnoreCase(registration.getStatus()))
                .collect(Collectors.groupingBy(EventRegistration::getEventId));
    }

    private Map<Long, User> loadUsersForEvents(List<Event> events, List<EventRegistration> registrations) {
        Set<Long> userIds = events.stream()
                .map(Event::getCreatedBy)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        userIds.addAll(registrations.stream()
                .map(EventRegistration::getStudentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));
    }

    private Map<String, Object> toEventResponse(Event event, List<EventRegistration> registrations, Map<Long, User> usersById) {
        List<String> registeredStudents = registrations.stream()
                .map(registration -> usersById.get(registration.getStudentId()))
                .filter(Objects::nonNull)
                .map(User::getName)
                .toList();

        return mapper.event(
                event,
                event.getCreatedBy() == null ? null : usersById.get(event.getCreatedBy()),
                registrations.size(),
                registeredStudents
        );
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
