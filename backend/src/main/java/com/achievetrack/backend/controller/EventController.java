package com.achievetrack.backend.controller;

import com.achievetrack.backend.dto.ApiResponse;
import com.achievetrack.backend.dto.request.EventRequest;
import com.achievetrack.backend.security.SecurityUtils;
import com.achievetrack.backend.service.EventService;
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
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean upcoming
    ) {
        List<Map<String, Object>> events = eventService.getEvents(category, status, upcoming);
        return ResponseEntity.ok(ApiResponse.success(events, events.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getEvent(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createEvent(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Event created successfully",
                        eventService.createEvent(request, SecurityUtils.getAuthenticatedUser())
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Event updated successfully",
                eventService.updateEvent(id, request, SecurityUtils.getAuthenticatedUser())
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id, SecurityUtils.getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<Object>> registerForEvent(@PathVariable Long id) {
        eventService.registerForEvent(id, SecurityUtils.getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success("Successfully registered for event", null));
    }

    @DeleteMapping("/{id}/unregister")
    public ResponseEntity<ApiResponse<Object>> unregisterFromEvent(@PathVariable Long id) {
        eventService.unregisterFromEvent(id, SecurityUtils.getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success("Successfully unregistered from event", null));
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEventRegistrations(@PathVariable Long id) {
        List<Map<String, Object>> registrations = eventService.getEventRegistrations(id, SecurityUtils.getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success(registrations, registrations.size()));
    }
}
