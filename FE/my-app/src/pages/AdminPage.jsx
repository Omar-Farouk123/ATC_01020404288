import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCog, FaUsers, FaChartBar, FaSignOutAlt, FaUser, FaHome } from 'react-icons/fa';
import { eventsAPI, adminAPI } from '../services/api';
import AddEventForm from '../components/AddEventForm';
import './AdminPage.css';

const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage and check token expiration
    const userData = JSON.parse(localStorage.getItem('user'));
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    const isTokenExpired = tokenExpiry && new Date().getTime() > parseInt(tokenExpiry);
    
    if (userData && !isTokenExpired) {
      setUser(userData);
    } else {
      // Clear expired session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      navigate('/login');
    }
    
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAllEvents();
      console.log('All events:', response.data);
      setEvents(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      setLoading(false);
      console.error('Error fetching events:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    navigate('/login');
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await adminAPI.deleteEvent(eventId);
        await fetchEvents(); // Refresh the events list
      } catch (err) {
        setError('Failed to delete event. Please try again later.');
        console.error('Error deleting event:', err);
      }
    }
  };

  const handleEditEvent = async (eventId, updatedData) => {
    try {
      await adminAPI.updateEvent(eventId, updatedData);
      await fetchEvents(); // Refresh the events list
    } catch (err) {
      setError('Failed to update event. Please try again later.');
      console.error('Error updating event:', err);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'upcoming' && new Date(event.date) > new Date()) ||
                       (dateFilter === 'past' && new Date(event.date) < new Date());
    return matchesSearch && matchesCategory && matchesDate;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-bar"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-content">
        <div className="admin-header">
          <div className="admin-header-content">
            <h1>Admin Dashboard</h1>
            <p>Manage your events and users</p>
          </div>
        </div>

        <div className="admin-actions">
          <button 
            className="admin-btn add-event-btn"
            onClick={() => setIsAddEventModalOpen(true)}
          >
            Add New Event
          </button>
          <Link to="/admin/users" className="admin-btn manage-users-btn">
            Manage Users
          </Link>
        </div>

        <div className="admin-search-filter">
          <div className="admin-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-filters">
            <select 
              className="admin-filter-select"
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="sports">Sports</option>
              <option value="music">Music</option>
              <option value="arts">Arts</option>
              <option value="food">Food</option>
            </select>
            <select 
              className="admin-filter-select"
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="admin-events-grid">
          {filteredEvents.length === 0 ? (
            <div className="no-events">No events found</div>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className="admin-event-card">
                <div className="admin-event-content">
                  <div className="admin-event-header">
                    <h3>{event.name}</h3>
                    <p className="admin-event-description">{event.description}</p>
                  </div>
                  <div className="admin-event-details">
                    <div className="admin-event-detail">
                      <span className="admin-event-label">Category</span>
                      <span className="admin-event-value">{event.category}</span>
                    </div>
                    <div className="admin-event-detail">
                      <span className="admin-event-label">Date</span>
                      <span className="admin-event-value">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="admin-event-detail">
                      <span className="admin-event-label">Time</span>
                      <span className="admin-event-value">{event.time}</span>
                    </div>
                    <div className="admin-event-detail">
                      <span className="admin-event-label">Location</span>
                      <span className="admin-event-value">{event.location}</span>
                    </div>
                    <div className="admin-event-detail">
                      <span className="admin-event-label">Price</span>
                      <span className="admin-event-value">${event.price}</span>
                    </div>
                    <div className="admin-event-detail">
                      <span className="admin-event-label">Available Tickets</span>
                      <span className="admin-event-value">{event.availableTickets}</span>
                    </div>
                  </div>
                  <div className="admin-event-actions">
                    <button 
                      className="admin-action-btn edit-btn"
                      onClick={() => handleEditEvent(event.id, event)}
                    >
                      Edit
                    </button>
                    <button 
                      className="admin-action-btn delete-btn"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Delete
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
          onEventAdded={fetchEvents}
        />
      )}
    </div>
  );
};

export default AdminPage; 