import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../config';
import authService from '../services/AuthService';
import './Events.css';

const BookedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userImageUrl, setUserImageUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const fetchBookedEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userDetails = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userDetails) {
        navigate('/login');
        return;
      }

      // First get the booked event IDs
      const bookedResponse = await axios.get(`http://localhost:8080/api/users/${userDetails.id}/booked-events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Then fetch the full event details for each booked event
      const bookedEventIds = bookedResponse.data;
      const eventsPromises = bookedEventIds.map(id => 
        axios.get(`http://localhost:8080/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );

      const eventsResponses = await Promise.all(eventsPromises);
      const bookedEvents = eventsResponses.map(response => response.data);
      
      setEvents(bookedEvents);
      setError(null);
    } catch (err) {
      console.error('Error fetching booked events:', err);
      setError('Failed to fetch booked events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        navigate('/login');
        return;
      }
      setUser(userData);
      
      // Log complete user data to check all attributes
      console.log('Complete user data:', {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        imageUrl: userData.imageUrl,
        token: userData.token ? 'exists' : 'missing'
      });
      
      // Fetch user image if available
      if (userData.id) {
        try {
          // Check if imageUrl exists and is valid
          if (!userData.imageUrl) {
            console.log('No image URL found for user');
            setUserImageUrl(null);
            return;
          }

          // Extract filename from the full path if needed
          const imageFilename = userData.imageUrl.split('/').pop();
          console.log('Attempting to fetch image:', `${API_URL}/api/images/users/${imageFilename}`);

          const response = await axios.get(`${API_URL}/api/images/users/${imageFilename}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'image/jpeg'
            },
            responseType: 'blob'
          });
          
          if (response.data) {
            const imageUrl = URL.createObjectURL(response.data);
            setUserImageUrl(imageUrl);
            console.log('Successfully loaded user image');
          }
        } catch (error) {
          console.error('Error fetching user image:', {
            error: error.message,
            status: error.response?.status,
            data: error.response?.data,
            userData: {
              id: userData.id,
              email: userData.email,
              imageUrl: userData.imageUrl
            }
          });
          setUserImageUrl(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
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
      // Fetch complete user data including image URL
      fetchUserData();
      fetchBookedEvents();
    } else {
      // Clear expired session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      setIsLoggedIn(false);
      setUser(null);
      navigate('/login');
    }
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
      case 'all':
        return true;
      case 'upcoming':
        return eventDateTime >= today;
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
      case 'year':
        const yearLater = new Date(today);
        yearLater.setFullYear(today.getFullYear() + 1);
        return eventDateTime >= today && eventDateTime <= yearLater;
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

  const handleCancelBooking = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const userDetails = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userDetails) {
        navigate('/login');
        return;
      }

      await axios.post('http://localhost:8080/api/users/cancel-booking', {
        userId: userDetails.id,
        eventId: eventId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Refresh the events list
      fetchBookedEvents();
      setShowCancelModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Error canceling booking:', err);
      setError('Failed to cancel booking. Please try again later.');
    }
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
      {/* Header at the top of the page */}
      <div className="events-header">
        <div className="events-header-content">
          <div className="header-left">
            <h1>Your Booked Events</h1>
            <p>View and manage your event bookings</p>
          </div>
          {user && (
            <div className="header-right">
              <div className="user-avatar">
                {userImageUrl ? (
                  <img 
                    src={userImageUrl}
                    alt="User avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      setUserImageUrl(null);
                    }}
                  />
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="events-content">
        <div className="events-sidebar">
          <Link to="/" className="events-nav-btn">
            <FaHome />
            <span>Home</span>
          </Link>
          <Link to="/events" className="events-nav-btn">
            <FaCalendarAlt />
            <span>Events</span>
          </Link>
          <div className="events-nav-btn active">
            <FaTicketAlt />
            <span>Booked Events</span>
          </div>
          <button onClick={handleLogout} className="events-nav-btn events-logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>

        <div className="events-main">
          <div className="search-filter-container">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search your booked events..."
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
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          <div className="events-grid">
            {filteredEvents.length === 0 ? (
              <div className="no-events-message">
                <i className="fas fa-calendar-times"></i>
                <p>No booked events found matching your criteria</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="booked-flag">
                    <i className="fas fa-check-circle"></i> Booked
                  </div>
                  <div className="event-image-container">
                    <div className="image-loading-placeholder">
                      <div className="loading-spinner"></div>
                    </div>
                    <img
                      src={event.imageUrl ? `http://localhost:8080${event.imageUrl}` : '/placeholder-event.jpg'}
                      alt={event.name}
                      className="event-image"
                      onLoad={(e) => {
                        e.target.previousSibling.classList.add('hidden');
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-event.jpg';
                        e.target.previousSibling.classList.add('hidden');
                      }}
                    />
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
                        className="cancel-button"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowCancelModal(true);
                        }}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h2>Cancel Booking</h2>
              <button className="close-button" onClick={() => {
                setShowCancelModal(false);
                setSelectedEvent(null);
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to cancel your booking for {selectedEvent.name}?</p>
              <div className="event-details-confirm">
                <p><i className="fas fa-calendar"></i> Date: {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p><i className="fas fa-clock"></i> Time: {selectedEvent.time}</p>
                <p><i className="fas fa-map-marker-alt"></i> Location: {selectedEvent.location}</p>
                <p className="price">Price: ${selectedEvent.price}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedEvent(null);
                }}
              >
                Keep Booking
              </button>
              <button 
                className="confirm-button"
                onClick={() => handleCancelBooking(selectedEvent.id)}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
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

export default BookedEvents; 