package com.booking.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:3000")
public class ImageController {

    private final Path eventUploadDir = Paths.get("uploads/events");
    private final Path userUploadDir = Paths.get("uploads/users");

    @GetMapping("/events/{filename:.+}")
    public ResponseEntity<Resource> getEventImage(@PathVariable String filename) {
        try {
            Path file = eventUploadDir.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) // or determine dynamically based on file extension
                    .body(resource);
            } else {
                System.out.println("Event image not found: " + file.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            System.out.println("Error accessing event image: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{filename:.+}")
    public ResponseEntity<Resource> getUserImage(@PathVariable String filename) {
        try {
            Path file = userUploadDir.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) // or determine dynamically based on file extension
                    .body(resource);
            } else {
                System.out.println("User image not found: " + file.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            System.out.println("Error accessing user image: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
} 