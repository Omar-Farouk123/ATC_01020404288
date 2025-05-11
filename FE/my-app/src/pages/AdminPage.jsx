import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBars, FaCog, FaUsers, FaChartBar, FaSignOutAlt, FaUser } from 'react-icons/fa';
import axios from 'axios';
import AddEventForm from '../components/AddEventForm';
import './AdminPage.css';

const AdminPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
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
      const response = await axios.get('http://localhost:8080/api/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEvents(response.data);
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="admin-page">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="header-buttons">
            <button 
              className="toggle-sidebar-btn"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              <FaBars />
            </button>
          </div>
        </div>
        
        <div className="sidebar-user-section">
          <div className="sidebar-user-info">
            {!isSidebarExpanded && (
              <div className="sidebar-user-avatar">
                <FaUser />
              </div>
            )}
            {isSidebarExpanded && (
              <div className="sidebar-user-details">
                <h3>{user?.fullName || 'Guest'}</h3>
                <p>{user?.email || 'Not logged in'}</p>
              </div>
            )}
          </div>
          
          <nav className="sidebar-nav">
            <button className="nav-item">
              <FaCog />
              {isSidebarExpanded && <span>Settings</span>}
            </button>
            <Link to="/admin/users" className="nav-item">
              <FaUsers />
              {isSidebarExpanded && <span>Manage Users</span>}
            </Link>
            <button className="nav-item">
              <FaChartBar />
              {isSidebarExpanded && <span>Statistics</span>}
            </button>
            <button onClick={handleLogout} className="nav-item logout">
              <FaSignOutAlt />
              {isSidebarExpanded && <span>Logout</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${!isSidebarExpanded ? 'expanded' : ''}`}>
        <div className="content-header">
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">Manage your events and users</p>
        </div>

        <div className="header-actions">
          <button 
            className="add-event-btn"
            onClick={() => setIsAddEventModalOpen(true)}
          >
            Add New Event
          </button>
          <Link to="/admin/users" className="manage-users-btn">
            Manage Users
          </Link>
        </div>

        <div className="search-filter-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <select 
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

        <div className="events-list">
          {filteredEvents.length === 0 ? (
            <div className="no-events">No events found</div>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-details">
                    <span className="event-category">{event.category}</span>
                    <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="event-actions">
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
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