package com.booking.controller;

import com.booking.entity.User;
import com.booking.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(
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
            
            // Handle image upload
            if (image != null && !image.isEmpty()) {
                try {
                    String imageUrl = authenticationService.saveUserImage(image);
                    user.setImageUrl(imageUrl);
                    System.out.println("Image saved successfully. URL: " + imageUrl); // Debug log
                } catch (IOException e) {
                    System.err.println("Failed to save user image: " + e.getMessage()); // Debug log
                    return ResponseEntity.badRequest().body("Failed to save user image: " + e.getMessage());
                }
            }

            Map<String, Object> response = authenticationService.register(user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body("Email and password are required");
            }

            Map<String, Object> response = authenticationService.authenticate(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }
} 