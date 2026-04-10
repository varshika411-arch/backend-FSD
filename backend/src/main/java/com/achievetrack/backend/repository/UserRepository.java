package com.achievetrack.backend.repository;

import com.achievetrack.backend.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(String role);

    List<User> findByRoleOrderByNameAsc(String role);

    Optional<User> findByIdAndRole(Long id, String role);

    long countByRole(String role);
}
