package com.achievetrack.backend.repository;

import com.achievetrack.backend.model.Event;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByDateAsc();
}
