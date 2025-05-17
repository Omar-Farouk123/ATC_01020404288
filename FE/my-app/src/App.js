import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Events from './pages/Events';
import BookedEvents from './pages/BookedEvents';
import AdminPage from './pages/AdminPage';
import UserManagementPage from './pages/UserManagementPage';
import LoadingBar from './components/LoadingBar';
import ProtectedRoute from './components/ProtectedRoute';
import NewUserForm from './components/NewUserForm';
import './components/LoadingBar.css';
import './App.css';

function App() {
  return (
    <Router>
      <LoadingBar />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/new-user" element={<NewUserForm onClose={() => {}} onSubmit={() => {}} />} />
          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booked-events" 
            element={
              <ProtectedRoute>
                <BookedEvents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
