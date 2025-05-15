package com.booking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${event.images.dir:uploads/events}")
    private String imagesDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // Get the absolute path of the uploads directory
            Path absolutePath = Paths.get(imagesDir).toAbsolutePath();
            System.out.println("Configuring resource handler for images directory: " + absolutePath);
            
            // Create the directory if it doesn't exist
            File uploadDir = absolutePath.toFile();
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Configure the resource handler
            registry.addResourceHandler("/api/images/events/**")
                    .addResourceLocations("file:" + absolutePath + "/")
                    .setCachePeriod(3600)
                    .resourceChain(true)
                    .addResolver(new PathResourceResolver());
            
            System.out.println("Resource handler configured successfully");
        } catch (Exception e) {
            System.err.println("Error configuring resource handler: " + e.getMessage());
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