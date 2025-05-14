package com.booking.service;

import com.booking.entity.User;
import com.booking.repository.UserRepository;
import com.booking.repository.EventRepository;
import com.booking.entity.Event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;



    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepository.existsByFullName(user.getFullName())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> authenticateUser(String fullName, String password) {
        Optional<User> userOpt = userRepository.findByFullName(fullName);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByFullName(String fullName) {
        return userRepository.findByFullName(fullName);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(User user) {
        if (!userRepository.existsById(user.getId())) {
            throw new RuntimeException("User not found");
        }
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public void updateUserStatus(Long id, boolean active) {
        System.out.println("UserService - updateUserStatus called with id: " + id + ", active: " + active);
        try {
            userRepository.updateStatus(id, active);
            System.out.println("UserService - Status update completed successfully");
        } catch (Exception e) {
            System.out.println("UserService - Error updating status: " + e.getMessage());
            throw new RuntimeException("Failed to update user status: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> createBooking(Long userId, Long eventId, String bookingDate) {
        // Validate user and event exist
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));

        // Check if user already has booked this event
        if (user.getBookedEvents().contains(event)) {
            throw new RuntimeException("You have already booked this event");
        }

        // Check if event has available tickets
        if (event.getAvailableTickets() <= 0) {
            throw new RuntimeException("No tickets available for this event");
        }

        // Add event to user's booked events
        user.getBookedEvents().add(event);
        
        // Decrease available tickets
        event.setAvailableTickets(event.getAvailableTickets() - 1);

        // Save both user and event
        userRepository.save(user);
        eventRepository.save(event);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("eventName", event.getName());
        response.put("bookingDate", bookingDate);
        response.put("availableTickets", event.getAvailableTickets());

        return response;
    }

    public Set<Long> getUserBookedEventIds(Long userId) {
        System.out.println("Getting booked events for user ID: " + userId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Set<Long> bookedEventIds = user.getBookedEvents().stream()
            .map(Event::getId)
            .collect(Collectors.toSet());
        
        System.out.println("User has booked events: " + bookedEventIds);
        return bookedEventIds;
    }
} 