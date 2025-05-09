package com.booking.repository;

import com.booking.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByDateGreaterThanEqual(LocalDate date);
    List<Event> findByCategory(String category);
    List<Event> findByNameContainingIgnoreCase(String name);
} 