package com.achievetrack.backend.repository;

import com.achievetrack.backend.model.EventRegistration;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByEventIdAndStatusOrderByRegisteredAtDesc(Long eventId, String status);

    List<EventRegistration> findByStudentId(Long studentId);

    Optional<EventRegistration> findByEventIdAndStudentId(Long eventId, Long studentId);

    long countByEventIdAndStatus(Long eventId, String status);

    long countByStudentId(Long studentId);

    long countByStatus(String status);

    void deleteByEventIdAndStudentId(Long eventId, Long studentId);
}
