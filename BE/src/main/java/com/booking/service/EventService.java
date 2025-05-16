package com.booking.service;

import com.booking.entity.Event;
import com.booking.entity.User;
import com.booking.repository.EventRepository;
import com.booking.repository.UserRepository;
import com.booking.dto.EventCreateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Value("${event.images.dir:uploads/events}")
    private String imagesDir;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Event createEvent(EventCreateDTO eventDTO) {
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
        
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public Event updateEvent(Event event) {
        if (!eventRepository.existsById(event.getId())) {
            throw new RuntimeException("Event not found");
        }
        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));

        // Delete the event's image file if it exists
        if (event.getImageUrl() != null && !event.getImageUrl().isEmpty()) {
            try {
                String filename = event.getImageUrl().substring(event.getImageUrl().lastIndexOf("/") + 1);
                Path filePath = Paths.get(imagesDir).resolve(filename);
                File imageFile = filePath.toFile();
                if (imageFile.exists()) {
                    imageFile.delete();
                }
            } catch (Exception e) {
                // Log the error but continue with event deletion
                System.err.println("Error deleting event image: " + e.getMessage());
            }
        }

        // Remove the event from all users' bookings
        for (User user : event.getRegisteredUsers()) {
            user.getBookedEvents().remove(event);
            userRepository.save(user);
        }

        // Clear the registered users set
        event.getRegisteredUsers().clear();
        eventRepository.save(event);

        // Now we can safely delete the event
        eventRepository.deleteById(id);
    }
} 