# Event Booking Frontend (React)

This is the frontend for the Event Booking application, built with React. It provides user and admin interfaces for browsing, booking, and managing events and users.

## Features

- **User Authentication:**
  - Login and registration for users.
  - Hardcoded admin login (email:`admin@gmail.com` /pass:`admin`) to create new user if its ur first launch for the project.

- **User Management (Admin):**
  - Admin can create, edit, enable/disable, and assign roles to users.
  - Compact, scrollable user edit form with image upload and role selector.

- **Event Management (Admin):**
  - Admin can add, edit, and delete events.

- **Profile Management:**
  - Admin can update any user profile and upload a profile picture.

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Installation
1. Navigate to the frontend directory:
   ```sh
   cd FE/my-app
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the App
Start the development server:
```sh
npm start
```
The app will run at [http://localhost:3000](http://localhost:3000).

### Environment Configuration
- API endpoints are configured in `src/config.js`.
- By default, the frontend expects the backend to run at `http://localhost:8080`.

## Project Structure
```
FE/my-app/
  src/
    components/      # Reusable UI components (forms, cards, etc.)
    pages/           # Main pages (Home, Events, Admin, etc.)
    services/        # API service modules
    context/         # React context (e.g., Auth)
    App.js           # Main app routes
    config.js        # API URL config
```

## Admin Login
- Use the following credentials to access admin features:
  - **Email:** `admin@gmail.com`
  - **Password:** `admin`

## Notes
- The UI is responsive and designed for usability.
- All user and event management features are accessible via the admin panel.
- For backend setup, see the backend README in the `BE/` directory.

---

Feel free to customize this README for your deployment or team needs.
