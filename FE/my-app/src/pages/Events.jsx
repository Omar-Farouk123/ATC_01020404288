import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userDetails = JSON.parse(localStorage.getItem('user'));
    
    if (token && userDetails) {
      setIsLoggedIn(true);
      setUser(userDetails);
    }

    // Fetch events
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/events');
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  const isEventInDateRange = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case 'today':
        return eventDateTime.getTime() === today.getTime();
      case 'week':
        const weekLater = new Date(today);
        weekLater.setDate(today.getDate() + 7);
        return eventDateTime >= today && eventDateTime <= weekLater;
      case 'month':
        const monthLater = new Date(today);
        monthLater.setMonth(today.getMonth() + 1);
        return eventDateTime >= today && eventDateTime <= monthLater;
      default:
        return true;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesDate = isEventInDateRange(event.date);
    return matchesSearch && matchesCategory && matchesDate;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-bar"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="events-page">
      {/* Login Prompt Banner */}
      {!isLoggedIn && (
        <div className="login-prompt-banner">
          <div className="login-prompt-content">
            <i className="fas fa-info-circle"></i>
            <span>Login to start booking events and manage your reservations</span>
            <Link to="/login" className="login-prompt-button">
              Login Now
            </Link>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="nav-button home-button">
            <i className="fas fa-home"></i>
            Home
          </Link>
        </div>
        
        {isLoggedIn ? (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="user-details">
                <h3>{user?.fullName || 'Guest'}</h3>
                <p>{user?.email}</p>
              </div>
            </div>
            
            <nav className="sidebar-nav">
              <Link to="/settings" className="nav-link">
                <i className="fas fa-cog"></i>
                Settings
              </Link>
              <Link to="/booked-events" className="nav-link">
                <i className="fas fa-calendar-check"></i>
                Booked Events
              </Link>
              <Link to="/statistics" className="nav-link">
                <i className="fas fa-chart-bar"></i>
                Statistics
              </Link>
              <button onClick={handleLogout} className="nav-link logout">
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </nav>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="auth-button">
              <i className="fas fa-sign-in-alt"></i>
              Login
            </Link>
            <Link to="/register" className="auth-button">
              <i className="fas fa-user-plus"></i>
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="events-container">
        <div className="events-header">
          <h1>Book your Events today</h1>
          <p>Discover and book amazing events in your area</p>
        </div>

        <div className="search-filter-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search events by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters-group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="concert">Concerts</option>
              <option value="sports">Sports</option>
              <option value="theater">Theater</option>
              <option value="exhibition">Exhibitions</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="date-filter"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <div className="events-grid">
          {filteredEvents.length === 0 ? (
            <div className="no-events-message">
              <i className="fas fa-calendar-times"></i>
              <p>No events found matching your criteria</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-image">
                  <img src={event.imageUrl} alt={event.name} />
                </div>
                <div className="event-details">
                  <h3>{event.name}</h3>
                  <div className="event-info">
                    <span><i className="fas fa-calendar"></i> {new Date(event.date).toLocaleDateString()}</span>
                    <span><i className="fas fa-clock"></i> {event.time}</span>
                  </div>
                  <div className="event-location">
                    <i className="fas fa-map-marker-alt"></i> {event.location}
                  </div>
                  <p className="event-description">{event.description}</p>
                  <div className="event-footer">
                    <span className="event-price">${event.price}</span>
                    <button 
                      className={`book-button ${!isLoggedIn ? 'disabled' : ''}`}
                      disabled={!isLoggedIn}
                      title={!isLoggedIn ? "Please login to book events" : "Book this event"}
                    >
                      {isLoggedIn ? 'Book Now' : 'Login to Book'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/faq">How to Book</Link></li>
              <li><Link to="/faq">Cancellation Policy</Link></li>
              <li><Link to="/faq">Refund Policy</Link></li>
              <li><Link to="/faq">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul>
              <li><i className="fas fa-envelope"></i> support@eventbooking.com</li>
              <li><i className="fas fa-phone"></i> +1 (555) 123-4567</li>
              <li><i className="fas fa-map-marker-alt"></i> 123 Event Street, City, Country</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Event Booking System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Events; 