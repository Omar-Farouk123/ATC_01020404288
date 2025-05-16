package com.booking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.resource.VersionResourceResolver;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${event.images.dir:uploads/events}")
    private String eventImagesDir;

    @Value("${user.images.dir:uploads/users}")
    private String userImagesDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // Get the absolute path to the images directory
            String absolutePath = new File("").getAbsolutePath();
            String imagesDir = absolutePath + "/src/main/resources/static/images/";
            String uploadsDir = absolutePath + "/src/main/resources/static/uploads/";
            
            System.out.println("=== Resource Handler Configuration ===");
            System.out.println("Absolute Path: " + absolutePath);
            System.out.println("Images Directory: " + imagesDir);
            System.out.println("Uploads Directory: " + uploadsDir);
            
            // Create directories if they don't exist
            File imagesDirFile = new File(imagesDir);
            File uploadsDirFile = new File(uploadsDir + "users/");
            File eventsDirFile = new File(uploadsDir + "events/");
            
            System.out.println("Creating directories...");
            System.out.println("Images directory exists: " + imagesDirFile.exists());
            System.out.println("Users upload directory exists: " + uploadsDirFile.exists());
            System.out.println("Events upload directory exists: " + eventsDirFile.exists());
            
            imagesDirFile.mkdirs();
            uploadsDirFile.mkdirs();
            eventsDirFile.mkdirs();
            
            System.out.println("After creation:");
            System.out.println("Images directory exists: " + imagesDirFile.exists());
            System.out.println("Users upload directory exists: " + uploadsDirFile.exists());
            System.out.println("Events upload directory exists: " + eventsDirFile.exists());
            
            // Set directory permissions
            imagesDirFile.setReadable(true, false);
            imagesDirFile.setExecutable(true, false);
            uploadsDirFile.setReadable(true, false);
            uploadsDirFile.setExecutable(true, false);
            eventsDirFile.setReadable(true, false);
            eventsDirFile.setExecutable(true, false);
            
            System.out.println("Directory permissions set");
            System.out.println("Images directory readable: " + imagesDirFile.canRead());
            System.out.println("Users upload directory readable: " + uploadsDirFile.canRead());
            System.out.println("Events upload directory readable: " + eventsDirFile.canRead());

            // Serve event images
            registry.addResourceHandler("/api/images/events/**")
                    .addResourceLocations("file:" + imagesDir)
                    .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS))
                    .resourceChain(true)
                    .addResolver(new VersionResourceResolver().addContentVersionStrategy("/**"));

            // Serve user images
            registry.addResourceHandler("/uploads/users/**")
                    .addResourceLocations("file:" + uploadsDir + "users/")
                    .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS))
                    .resourceChain(true)
                    .addResolver(new VersionResourceResolver().addContentVersionStrategy("/**"));

            System.out.println("Resource handlers configured successfully");
            System.out.println("=====================================");
        } catch (Exception e) {
            System.err.println("Error configuring resource handlers: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
} 