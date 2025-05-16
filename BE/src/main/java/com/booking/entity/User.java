package com.booking.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private boolean enabled = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;

    @Column
    private String phoneNumber = "";

    @Column
    private String address = "";

    @Column
    private String imageUrl;

    @JsonBackReference
    @ManyToMany
    @JoinTable(
        name = "user_events",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "event_id")
    )
    private Set<Event> bookedEvents = new HashSet<>();

    public enum UserRole {
        USER,
        ADMIN
    }

    public boolean isAdmin() {
        return this.role == UserRole.ADMIN;
    }
} 