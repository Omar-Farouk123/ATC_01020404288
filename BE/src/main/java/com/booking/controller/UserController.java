package com.booking.controller;

import com.booking.dto.UserRegistrationRequest;
import com.booking.dto.UserStatusUpdateDTO;
import com.booking.entity.User;
import com.booking.service.UserService;
import com.booking.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            User user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPassword(password);
            user.setPhoneNumber(phoneNumber != null ? phoneNumber : "");
            user.setAddress(address != null ? address : "");
            user.setRole(role != null ? User.UserRole.valueOf(role) : User.UserRole.USER);
            user.setEnabled(false);
            
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            Map<String, Object> response = authenticationService.authenticate(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "enabled", required = false) Boolean enabled,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            User existingUser = userService.getUserById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update fields if provided
            if (fullName != null) existingUser.setFullName(fullName);
            if (email != null) existingUser.setEmail(email);
            if (phoneNumber != null) existingUser.setPhoneNumber(phoneNumber);
            if (address != null) existingUser.setAddress(address);
            
            // Only admin can update these fields
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (isAdmin) {
                if (role != null) existingUser.setRole(User.UserRole.valueOf(role));
                if (enabled != null) existingUser.setEnabled(enabled);
            }

            // Handle image upload if provided
            if (image != null && !image.isEmpty()) {
                try {
                    String imageUrl = authenticationService.saveUserImage(image);
                    existingUser.setImageUrl(imageUrl);
                } catch (IOException e) {
                    return ResponseEntity.badRequest().body("Failed to save user image: " + e.getMessage());
                }
            }

            User updatedUser = userService.updateUser(existingUser);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UserStatusUpdateDTO statusUpdate) {
        System.out.println("=== User Status Update Debug ===");
        System.out.println("User ID: " + id);
        System.out.println("Status Update Request: " + statusUpdate);
        System.out.println("Active Status: " + statusUpdate.isActive());
        
        try {
            System.out.println("Calling userService.updateUserStatus...");
            userService.updateUserStatus(id, statusUpdate.isActive());
            System.out.println("User status updated successfully");
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.out.println("Error updating user status: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/book-event")
    public ResponseEntity<?> bookEvent(@RequestBody Map<String, Object> bookingRequest) {
        try {
            Long userId = Long.parseLong(bookingRequest.get("userId").toString());
            Long eventId = Long.parseLong(bookingRequest.get("eventId").toString());
            String bookingDate = bookingRequest.get("bookingDate").toString();

            // Call service to create booking
            Map<String, Object> booking = userService.createBooking(userId, eventId, bookingDate);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to book event: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/booked-events")
    public ResponseEntity<?> getUserBookedEvents(@PathVariable Long id) {
        try {
            System.out.println("Fetching booked events for user ID: " + id);
            Set<Long> bookedEventIds = userService.getUserBookedEventIds(id);
            System.out.println("Found booked events: " + bookedEventIds);
            return ResponseEntity.ok(bookedEventIds);
        } catch (Exception e) {
            System.out.println("Error fetching booked events: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to fetch booked events: " + e.getMessage());
        }
    }

    @PostMapping("/cancel-booking")
    public ResponseEntity<?> cancelBooking(@RequestBody Map<String, Object> cancelRequest) {
        try {
            Long userId = Long.parseLong(cancelRequest.get("userId").toString());
            Long eventId = Long.parseLong(cancelRequest.get("eventId").toString());

            // Call service to cancel booking
            userService.cancelBooking(userId, eventId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to cancel booking: " + e.getMessage());
        }
    }
} 