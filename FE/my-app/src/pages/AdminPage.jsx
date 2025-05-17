import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCog, FaUsers, FaChartBar, FaSignOutAlt, FaUser, FaHome } from 'react-icons/fa';
import { eventsAPI, adminAPI } from '../services/api';
import { API_URL } from '../config';
import AddEventForm from '../components/AddEventForm';
import EditEventForm from '../components/EditEventForm';
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage and check token expiration
    const userData = JSON.parse(localStorage.getItem('user'));
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const token = localStorage.getItem('token');
    
    console.log('Current token:', token ? 'Present' : 'Missing');
    console.log('Token expiry:', tokenExpiry ? new Date(parseInt(tokenExpiry)).toLocaleString() : 'Missing');
    console.log('User data:', userData);
    
    const isTokenExpired = tokenExpiry && new Date().getTime() > parseInt(tokenExpiry);
    
    if (userData && !isTokenExpired) {
      console.log('User role:', userData.role);
      if (userData.role?.toUpperCase() !== 'ADMIN') {
        console.error('User is not an admin');
        setError('You do not have admin privileges');
        navigate('/login');
        return;
      }
      setUser(userData);
    } else {
      console.log('Session expired or invalid');
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
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        console.log('Delete request details:', {
          eventId,
          token: token ? 'Present' : 'Missing',
          userRole: userData?.role,
          headers: {
            Authorization: token ? 'Bearer [TOKEN]' : 'Missing'
          }
        });

        if (!token) {
          setError('Authentication token is missing. Please login again.');
          navigate('/login');
          return;
        }

        if (userData?.role?.toUpperCase() !== 'ADMIN') {
          setError('You do not have admin privileges to delete events.');
          return;
        }

        await adminAPI.deleteEvent(eventId);
        console.log('Event deleted successfully');
        await fetchEvents(); // Refresh the events list
      } catch (err) {
        console.error('Error deleting event:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });

        if (err.response?.status === 403) {
          setError('You do not have permission to delete events. Please check your admin privileges.');
        } else if (err.response?.status === 401) {
          setError('Your session has expired. Please login again.');
          navigate('/login');
        } else {
          setError('Failed to delete event. Please try again later.');
        }
      }
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
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
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p>Manage your events and users</p>
          </div>
          {user && (
            <div className="header-right">
              <div className="user-avatar">
                {user.imageUrl ? (
                  <img 
                    src={`${API_URL}/api/images/users/${user.imageUrl}`}
                    alt={user.fullName}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="avatar-fallback" style={{ display: user.imageUrl ? 'none' : 'flex' }}>
                  {user.fullName.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-nav">
          <Link to="/" className="nav-btn">
            <FaHome />
            <span>Home</span>
          </Link>
          <Link to="/admin" className="nav-btn active">
            <FaChartBar />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/users" className="nav-btn">
            <FaUsers />
            <span>Users</span>
          </Link>
          <button onClick={handleLogout} className="nav-btn logout">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>

        <div className="admin-main">
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

          <div className="admin-actions">
            <button 
              className="admin-btn add-event-btn"
              onClick={() => setIsAddEventModalOpen(true)}
            >
              Add New Event
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="admin-events-grid">
            {filteredEvents.length === 0 ? (
              <div className="no-events">No events found</div>
            ) : (
              filteredEvents.map(event => (
                <div key={event.id} className="admin-event-card">
                  <div className="event-image-container">
                    {event.imageUrl ? (
                      <img
                        src={`http://localhost:8080${event.imageUrl}`}
                        alt={event.name}
                        className="event-image"
                        onError={(e) => {
                          console.error('Error loading image:', e);
                          e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }}
                      />
                    ) : (
                      <img
                        src="https://via.placeholder.com/300x300?text=No+Image"
                        alt="No image available"
                        className="event-image"
                      />
                    )}
                  </div>
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
                        className="admin-event-action-btn edit-btn"
                        onClick={() => handleEditEvent(event)}
                      >
                        Edit
                      </button>
                      <button 
                        className="admin-event-action-btn delete-btn"
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
      </div>

      {isAddEventModalOpen && (
        <AddEventForm 
          onClose={() => setIsAddEventModalOpen(false)}
          onEventAdded={fetchEvents}
        />
      )}

      {isEditModalOpen && selectedEvent && (
        <EditEventForm
          event={selectedEvent}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          onEventUpdated={fetchEvents}
        />
      )}
    </div>
  );
};

export default AdminPage; 