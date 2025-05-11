import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Session management
  const checkSession = () => {
    const token = localStorage.getItem('token');
    const userDetails = JSON.parse(localStorage.getItem('user'));
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !userDetails || !tokenExpiry) {
      clearSession();
      return false;
    }

    // Check if token has expired
    if (new Date().getTime() > parseInt(tokenExpiry)) {
      clearSession();
      return false;
    }

    // Check if user is admin
    if (userDetails.role !== 'ADMIN') {
      clearSession();
      return false;
    }

    return true;
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const isSessionValid = checkSession();
    setIsLoggedIn(isSessionValid);
    if (isSessionValid) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }

    const sessionCheckInterval = setInterval(() => {
      const isValid = checkSession();
      if (!isValid) {
        setIsLoggedIn(false);
        setUser(null);
      }
    }, 60000);

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

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
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
    <div className="admin-page">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
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
        
        {isLoggedIn ? (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              {isSidebarExpanded && (
                <div className="user-details">
                  <h3>{user?.fullName || 'Admin'}</h3>
                  <p>{user?.email}</p>
                </div>
              )}
            </div>
            
            <nav className="sidebar-nav">
              <Link to="/admin/settings" className="nav-link" title="Settings">
                <i className="fas fa-cog"></i>
                {isSidebarExpanded && <span>Settings</span>}
              </Link>
              <Link to="/admin/users" className="nav-link" title="Manage Users">
                <i className="fas fa-users"></i>
                {isSidebarExpanded && <span>Manage Users</span>}
              </Link>
              <Link to="/admin/statistics" className="nav-link" title="Statistics">
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
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your events and users</p>
          <div className="admin-actions">
            <button className="admin-button add-event">
              <i className="fas fa-plus"></i> Add New Event
            </button>
            <button className="admin-button manage-users">
              <i className="fas fa-users"></i> Manage Users
            </button>
          </div>
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
                    <div className="event-actions">
                      <button className="edit-button">
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="delete-button">
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 