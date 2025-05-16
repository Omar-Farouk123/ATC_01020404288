package com.booking.controller;

import com.booking.entity.Event;
import com.booking.service.EventService;
import com.booking.dto.EventCreateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/events")
@Validated
public class EventController {
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    @Autowired
    private EventService eventService;

    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventCreateDTO eventDTO) {
        try {
            // Validate date is not in the past
            if (eventDTO.getDate().isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid date",
                    "message", "Event date cannot be in the past"
                ));
            }

            Event event = new Event();
            event.setName(eventDTO.getName());
            event.setDescription(eventDTO.getDescription());
            event.setDate(eventDTO.getDate());
            event.setTime(eventDTO.getTime());
            event.setLocation(eventDTO.getLocation());
            event.setPrice(eventDTO.getPrice());
            event.setCategory(eventDTO.getCategory());
            event.setAvailableTickets(eventDTO.getAvailableTickets());
            event.setCreatedAt(LocalDateTime.now());

            Event savedEvent = eventService.createEvent(eventDTO);
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            logger.error("Error creating event: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error creating event",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllEvents() {
        try {
            logger.info("Fetching all events");
            List<Event> events = eventService.getAllEvents();
            logger.info("Found {} events", events.size());
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            logger.error("Error fetching events: ", e);
            return ResponseEntity.status(500).body("Error fetching events: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        event.setId(id);
        return ResponseEntity.ok(eventService.updateEvent(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }
} 