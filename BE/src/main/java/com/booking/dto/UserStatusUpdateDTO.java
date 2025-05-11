package com.booking.dto;

public class UserStatusUpdateDTO {
    private boolean active;

    public UserStatusUpdateDTO() {
    }

    public UserStatusUpdateDTO(boolean active) {
        this.active = active;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
} 