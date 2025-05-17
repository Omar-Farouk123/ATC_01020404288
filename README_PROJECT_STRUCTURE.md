# Project Structure Guide

This repository contains a full-stack Event Booking application, organized into two main folders:

- **FE/** — Frontend (React)
- **BE/** — Backend (Spring Boot)

## Folder Overview

```
Areeb_Tech_Task/
│
├── FE/           # Frontend React app
│   └── my-app/   # Main React project
│       ├── src/
│       ├── public/
│       └── ...
│
├── BE/           # Backend Spring Boot app
│   ├── src/
│   ├── pom.xml
│   └── ...
│
├── uploads/      # Uploaded images (user/event)
│   ├── users/
│   └── events/
│
└── README_PROJECT_STRUCTURE.md  # This file
```

## FE/ (Frontend)
- Built with React (in `my-app/`)
- Contains all UI, pages, components, and API service logic
- See `FE/my-app/README.md` for setup and usage

## BE/ (Backend)
- Built with Spring Boot (Java)
- Contains all REST API logic, database config, and business logic
- See `BE/README.md` for setup and usage

## uploads/
- Stores uploaded images for users and events
- Used by both frontend and backend for image display and upload

## How to Use
- Start the backend (BE) first, then the frontend (FE)
- Both communicate via REST API (default: http://localhost:8080)
- See individual READMEs in FE/ and BE/ for more details

---

This file provides a high-level overview of the project structure for new developers and maintainers.
