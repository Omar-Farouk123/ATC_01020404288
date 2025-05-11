import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddEventForm from '../components/AddEventForm';
import '../pages/Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    // Check if user is logged in and token is not expired
    const token = localStorage.getItem('token');
    const userDetails = JSON.parse(localStorage.getItem('user'));
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    const isTokenExpired = tokenExpiry && new Date().getTime() > parseInt(tokenExpiry);
    
    if (token && userDetails && !isTokenExpired) {
      setIsLoggedIn(true);
      setUser(userDetails);
    } else {
      // Clear expired session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      setIsLoggedIn(false);
      setUser(null);
    }

    // Fetch events
    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
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

  const handleAddEvent = () => {
    setIsAddEventModalOpen(true);
  };

  const handleEventAdded = () => {
    fetchEvents();
  };

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
      <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="header-buttons">
            <button 
              className="toggle-sidebar"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              <i className={`fas ${isSidebarExpanded ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
            </button>
            {isSidebarExpanded && (
              <Link to="/" className="nav-button home-button">
                <i className="fas fa-home"></i>
                Home
              </Link>
            )}
          </div>
        </div>
        
        {isLoggedIn ? (
          <div className="user-section">
            {!isSidebarExpanded && (
              <div className="user-info">
                <div className="user-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="user-details">
                  <h3>{user?.fullName || 'Guest'}</h3>
                  <p>{user?.email}</p>
                </div>
              </div>
            )}
            
            <nav className="sidebar-nav">
              <Link to="/settings" className="nav-link" title="Settings">
                <i className="fas fa-cog"></i>
                {isSidebarExpanded && <span>Settings</span>}
              </Link>
              <Link to="/booked-events" className="nav-link" title="Booked Events">
                <i className="fas fa-calendar-check"></i>
                {isSidebarExpanded && <span>Booked Events</span>}
              </Link>
              <Link to="/statistics" className="nav-link" title="Statistics">
                <i className="fas fa-chart-bar"></i>
                {isSidebarExpanded && <span>Statistics</span>}
              </Link>
              <button onClick={handleLogout} className="nav-link logout" title="Logout">
                <i className="fas fa-sign-out-alt"></i>
                {isSidebarExpanded && <span>Logout</span>}
              </button>
            </nav>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="auth-button" title="Login">
              <i className="fas fa-sign-in-alt"></i>
              {isSidebarExpanded && <span>Login</span>}
            </Link>
            <Link to="/register" className="auth-button" title="Register">
              <i className="fas fa-user-plus"></i>
              {isSidebarExpanded && <span>Register</span>}
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`events-container ${!isSidebarExpanded ? 'expanded' : ''}`}>
        <div className="events-header">
          <h1>Book your Events today</h1>
          <p>Discover and book amazing events in your area</p>
          {isLoggedIn && (
            <button className="add-event-btn" onClick={handleAddEvent}>
              <i className="fas fa-plus"></i> Add New Event
            </button>
          )}
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

      {isAddEventModalOpen && (
        <AddEventForm 
          onClose={() => setIsAddEventModalOpen(false)}
          onEventAdded={handleEventAdded}
        />
      )}

      <footer className={`footer ${!isSidebarExpanded ? 'expanded' : ''}`}>
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