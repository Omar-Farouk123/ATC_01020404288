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

import java.util.List;

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
            logger.info("Received event creation request: {}", eventDTO);
            Event createdEvent = eventService.createEvent(eventDTO);
            return ResponseEntity.ok(createdEvent);
        } catch (Exception e) {
            logger.error("Error creating event: ", e);
            return ResponseEntity.badRequest().body("Error creating event: " + e.getMessage());
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