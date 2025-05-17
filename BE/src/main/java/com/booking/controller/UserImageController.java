package com.booking.controller;

import com.booking.entity.User;
import com.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/users")
public class UserImageController {

    @Value("${user.images.dir:uploads/users}")
    private String imagesDir;

    private final UserRepository userRepository;

    public UserImageController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        try {
            File uploadDir = new File(imagesDir);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            // Set directory permissions to readable
            uploadDir.setReadable(true, false);
            uploadDir.setExecutable(true, false);
        } catch (Exception e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<?> getUserImage(@PathVariable Long id) {
        System.out.println("=== Fetching User Image ===");
        System.out.println("User ID: " + id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getImageUrl() == null || user.getImageUrl().isEmpty()) {
            System.out.println("No image URL found for user");
            return ResponseEntity.notFound().build();
        }

        System.out.println("User image URL: " + user.getImageUrl());
        return ResponseEntity.ok(user.getImageUrl());
    }

    @PostMapping("/{id}/upload-image")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<?> uploadUserImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        System.out.println("=== Uploading User Image ===");
        System.out.println("User ID: " + id);
        System.out.println("Original filename: " + file.getOriginalFilename());
        System.out.println("Content type: " + file.getContentType());
        System.out.println("File size: " + file.getSize() + " bytes");
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(imagesDir).toAbsolutePath();
        File dir = uploadPath.toFile();
        System.out.println("Upload directory path: " + uploadPath);
        System.out.println("Directory exists: " + dir.exists());
        
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            System.out.println("Created directory: " + created);
        }

        // Set directory permissions
        dir.setReadable(true, false);
        dir.setExecutable(true, false);
        System.out.println("Directory readable: " + dir.canRead());
        System.out.println("Directory executable: " + dir.canExecute());

        // Generate unique filename
        String filename = "user_" + id + "_" + System.currentTimeMillis() + "_" 
            + StringUtils.cleanPath(file.getOriginalFilename());
        System.out.println("Generated filename: " + filename);

        // Save file
        Path filePath = uploadPath.resolve(filename);
        System.out.println("Full file path: " + filePath);
        
        Files.write(filePath, file.getBytes());
        System.out.println("File saved successfully");
        System.out.println("File exists: " + filePath.toFile().exists());
        System.out.println("File readable: " + filePath.toFile().canRead());
        System.out.println("File size: " + filePath.toFile().length() + " bytes");

        // Update user with image URL
        String imageUrl = filename;
        System.out.println("Setting image URL: " + imageUrl);
        
        user.setImageUrl(imageUrl);
        userRepository.save(user);
        
        System.out.println("User updated with new image URL");
        System.out.println("=============================");
        
        return ResponseEntity.ok(imageUrl);
    }
} 