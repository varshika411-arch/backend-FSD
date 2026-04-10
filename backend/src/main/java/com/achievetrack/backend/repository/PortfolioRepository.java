package com.achievetrack.backend.repository;

import com.achievetrack.backend.model.Portfolio;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByStudentIdOrderByDateDesc(Long studentId);

    Optional<Portfolio> findByIdAndStudentId(Long id, Long studentId);
}
