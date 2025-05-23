package com.booking.controller;

import com.booking.entity.Event;
import com.booking.repository.EventRepository;
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

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/events")
public class EventImageController {

    @Value("${event.images.dir:uploads/events}")
    private String imagesDir;

    private final EventRepository eventRepository;

    public EventImageController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
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

    @PostMapping("/{id}/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadEventImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        System.out.println("=== Uploading Event Image ===");
        System.out.println("Event ID: " + id);
        System.out.println("Original filename: " + file.getOriginalFilename());
        System.out.println("Content type: " + file.getContentType());
        System.out.println("File size: " + file.getSize() + " bytes");
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

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
        String filename = "event_" + id + "_" + System.currentTimeMillis() + "_" 
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

        // Update event with image URL
        String imageUrl = "/api/images/events/" + filename;
        System.out.println("Setting image URL: " + imageUrl);
        
        event.setImageUrl(imageUrl);
        eventRepository.save(event);
        
        System.out.println("Event updated with new image URL");
        System.out.println("=============================");
        
        return ResponseEntity.ok(imageUrl);
    }
} 