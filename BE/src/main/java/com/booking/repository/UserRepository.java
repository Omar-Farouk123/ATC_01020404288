package com.booking.repository;

import com.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByFullName(String fullName);
    Optional<User> findByEmail(String email);
    boolean existsByFullName(String fullName);
    boolean existsByEmail(String email);
    
    @Modifying
    @Query("UPDATE User u SET u.enabled = :active WHERE u.id = :id")
    void updateStatus(@Param("id") Long id, @Param("active") boolean active);
} 