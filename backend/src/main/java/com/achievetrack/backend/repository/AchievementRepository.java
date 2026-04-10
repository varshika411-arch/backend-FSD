package com.achievetrack.backend.repository;

import com.achievetrack.backend.model.Achievement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findAllByOrderByCreatedAtDesc();

    List<Achievement> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Achievement> findByStatusOrderByCreatedAtDesc(String status);
}
