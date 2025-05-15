package com.booking.controller;

import com.booking.entity.Event;
import com.booking.repository.EventRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

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
    public ResponseEntity<?> uploadEventImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        System.out.println("Received image upload request for event ID: " + id);
        System.out.println("Original filename: " + file.getOriginalFilename());
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(imagesDir).toAbsolutePath();
        File dir = uploadPath.toFile();
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            System.out.println("Created upload directory: " + created);
        }

        // Generate unique filename
        String filename = "event_" + id + "_" + System.currentTimeMillis() + "_" 
            + StringUtils.cleanPath(file.getOriginalFilename());
        System.out.println("Generated filename: " + filename);

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());
        System.out.println("File saved at: " + filePath);

        // Verify file exists and is readable
        File savedFile = filePath.toFile();
        System.out.println("File exists: " + savedFile.exists());
        System.out.println("File is readable: " + savedFile.canRead());
        System.out.println("File size: " + savedFile.length());

        // Update event with image URL
        String imageUrl = "/api/images/events/" + filename;
        System.out.println("Setting image URL: " + imageUrl);
        
        event.setImageUrl(imageUrl);
        eventRepository.save(event);
        System.out.println("Event updated with image URL");

        return ResponseEntity.ok().body(imageUrl);
    }
} 