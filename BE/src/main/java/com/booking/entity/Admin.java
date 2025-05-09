package com.booking.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "admins")
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private String role = "ADMIN";

    // Additional admin-specific fields
    @Column
    private String department;

    @Column
    private String phoneNumber;

    @Column
    private String lastLogin;
} 