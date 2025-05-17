# Event Booking Backend (Spring Boot)

This is the backend for the Event Booking application, built with Spring Boot. It provides RESTful APIs for user authentication, event management, booking, and admin operations.

## Features
- User registration and login (JWT authentication)
- Admin and user roles
- Event CRUD (create, read, update, delete)
- Event booking and cancellation
- User management (admin)
- Image upload for users and events

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- MySQL or H2 Database (configurable)

### Setup & Run
1. Clone the repository and navigate to the backend directory:
   ```sh
   cd BE
   ```
2. Configure your database in `src/main/resources/application.properties` (default is H2 in-memory DB).
3. Build and run the backend:
   ```sh
   mvn spring-boot:run
   ```
   The backend will start at [http://localhost:8080](http://localhost:8080).

### API Endpoints
- **Auth:** `/api/auth/login`, `/api/auth/register`
- **Events:** `/api/events`, `/api/events/{id}`
- **Booking:** `/api/users/book-event`, `/api/users/{id}/booked-events`
- **Users:** `/api/users`, `/api/users/{id}`
- **Admin:** `/api/admin/stats/events`, `/api/admin/stats/users`
- **Image Upload:** `/api/images/users/{filename}`, `/api/images/events/{filename}`

### Project Structure
```
BE/
  src/
    main/
      java/com/booking/   # Java source code
      resources/          # application.properties, data.sql
  pom.xml                 # Maven config
```

### Configuration
- Edit `src/main/resources/application.properties` for DB, JWT, and file upload settings.
- Sample data can be loaded via `data.sql`.

## Notes
- The backend is stateless and uses JWT for authentication.
- CORS is enabled for frontend integration.
- For frontend setup, see the README in the `FE/` directory.

---

Feel free to customize this README for your deployment or team needs.
