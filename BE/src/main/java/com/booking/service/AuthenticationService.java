package com.booking.service;

import com.booking.config.JwtService;
import com.booking.entity.User;
import com.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    @Autowired
    private AuthenticationManager authenticationManager;

    private static final String UPLOAD_DIR = "uploads/users/";

    public String saveUserImage(MultipartFile image) throws IOException {
        System.out.println("=== Saving User Image ===");
        System.out.println("Original filename: " + image.getOriginalFilename());
        System.out.println("Content type: " + image.getContentType());
        System.out.println("Size: " + image.getSize() + " bytes");
        
        // Create upload directory if it doesn't exist
        File uploadDir = new File(UPLOAD_DIR);
        System.out.println("Upload directory path: " + uploadDir.getAbsolutePath());
        System.out.println("Upload directory exists: " + uploadDir.exists());
        
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            System.out.println("Created upload directory: " + created);
        }
        
        // Set directory permissions
        uploadDir.setReadable(true, false);
        uploadDir.setExecutable(true, false);
        System.out.println("Upload directory readable: " + uploadDir.canRead());
        System.out.println("Upload directory executable: " + uploadDir.canExecute());

        // Generate unique filename
        String originalFilename = image.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;
        System.out.println("Generated filename: " + filename);
        
        // Save file
        File destFile = new File(uploadDir.getAbsolutePath() + File.separator + filename);
        System.out.println("Destination file path: " + destFile.getAbsolutePath());
        
        image.transferTo(destFile);
        
        System.out.println("File saved successfully");
        System.out.println("File exists: " + destFile.exists());
        System.out.println("File readable: " + destFile.canRead());
        System.out.println("File size: " + destFile.length() + " bytes");
        
        // Return the URL path that will be used to access the image
        String imageUrl = filename;
        System.out.println("Returning image URL: " + imageUrl);
        System.out.println("=========================");
        
        return imageUrl;
    }

    public Map<String, Object> register(User request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        var user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setEnabled(true);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setImageUrl(request.getImageUrl());

        userRepository.save(user);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            user.isEnabled(),
            true,
            true,
            true,
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        var jwtToken = jwtService.generateToken(userDetails);
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", user.getRole());
        response.put("imageUrl", user.getImageUrl());
        return response;
    }

    public Map<String, Object> authenticate(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            user.isEnabled(),
            true,
            true,
            true,
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        var jwtToken = jwtService.generateToken(userDetails);
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", user.getRole());
        response.put("imageUrl", user.getImageUrl());
        return response;
    }
} 