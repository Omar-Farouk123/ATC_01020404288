import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/Events.css';
import { FaHome, FaTicketAlt, FaSignOutAlt, FaCalendarAlt, FaSignInAlt } from 'react-icons/fa';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [bookedEventIds, setBookedEventIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming'); // Set default to upcoming
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const navigate = useNavigate();
  const isAuthenticated = !!user;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/events', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Extract only the necessary event data, including imageUrl
      const cleanedEvents = response.data.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        price: event.price,
        category: event.category,
        availableTickets: event.availableTickets,
        imageUrl: event.imageUrl,
        createdAt: event.createdAt
      }));
      
      console.log('Fetched events:', cleanedEvents); // Debug log
      setEvents(cleanedEvents);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events. Please try again later.');
      setEvents([]);
    } finally {
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
      console.log('User is logged in:', userDetails);
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
  }, []); // Remove dependencies to prevent infinite loop

  // Helper to fetch booked events
  const fetchBookedEvents = async (userId) => {
    try {
      const bookedResponse = await axios.get(`http://localhost:8080/api/users/${userId}/booked-events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Normalize IDs to numbers
      setBookedEventIds(new Set((bookedResponse.data || []).map(id => Number(id))));
    } catch (err) {
      console.error('Error fetching booked events:', err);
      setBookedEventIds(new Set());
    }
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchBookedEvents(user.id);
    }
  }, [isLoggedIn, user]);

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
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return eventDateTime.getTime() === tomorrow.getTime();
      case 'week':
        const weekLater = new Date(today);
        weekLater.setDate(today.getDate() + 7);
        return eventDateTime >= today && eventDateTime <= weekLater;
      case 'month':
        const monthLater = new Date(today);
        monthLater.setMonth(today.getMonth() + 1);
        return eventDateTime >= today && eventDateTime <= monthLater;
      case 'upcoming':
        return eventDateTime >= today;
      default:
        return eventDateTime >= today; // Default to upcoming
    }
  };

  const isEventInPriceRange = (eventPrice) => {
    switch (priceFilter) {
      case 'free':
        return eventPrice === 0;
      case 'paid':
        return eventPrice > 0;
      case '0-50':
        return eventPrice >= 0 && eventPrice <= 50;
      case '50-100':
        return eventPrice > 50 && eventPrice <= 100;
      case '100+':
        return eventPrice > 100;
      default:
        return true;
    }
  };

  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDate = isEventInDateRange(event.date);
    const matchesPrice = isEventInPriceRange(event.price);
    return matchesSearch && matchesCategory && matchesDate && matchesPrice;
  }) : [];

  const handleBookNow = (event) => {
    if (!isLoggedIn) {
      setShowLoginNotification(true);
      setTimeout(() => {
        setShowLoginNotification(false);
        navigate('/login');
      }, 1500);
      return;
    }
    setSelectedEvent(event);
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setBookingStatus('loading');
      const response = await axios.post('http://localhost:8080/api/users/book-event', {
        eventId: selectedEvent.id,
        userId: user.id,
        bookingDate: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBookingStatus('success');
      // Refresh events and booked events to update available tickets and booked flag
      fetchEvents();
      if (isLoggedIn && user) {
        await fetchBookedEvents(user.id);
      }
      setTimeout(() => {
        setShowConfirmation(false);
        setBookingStatus(null);
        setSelectedEvent(null);
      }, 2000);
    } catch (err) {
      setBookingStatus('error');
      setTimeout(() => {
        setBookingStatus(null);
      }, 3000);
    }
  };

  const handleCancelBooking = () => {
    setShowConfirmation(false);
    setSelectedEvent(null);
    setBookingStatus(null);
  };

  const eventDateTime = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
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

      {/* Header at the top of the page */}
      <div className="events-header">
        <div className="events-header-content">
          <h1>Book your Events today</h1>
          <p>Discover and book amazing events in your area</p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h2>Confirm Booking</h2>
              <button className="close-button" onClick={handleCancelBooking}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <h3>{selectedEvent?.name}</h3>
              <div className="event-details-confirm">
                <p><i className="fas fa-calendar"></i> {new Date(selectedEvent?.date).toLocaleDateString()}</p>
                <p><i className="fas fa-clock"></i> {selectedEvent?.time}</p>
                <p><i className="fas fa-map-marker-alt"></i> {selectedEvent?.location}</p>
                <p className="price">Price: ${selectedEvent?.price}</p>
              </div>
              {bookingStatus === 'loading' && (
                <div className="booking-status loading">
                  <i className="fas fa-spinner fa-spin"></i> Processing booking...
                </div>
              )}
              {bookingStatus === 'success' && (
                <div className="booking-status success">
                  <i className="fas fa-check-circle"></i> Booking confirmed!
                </div>
              )}
              {bookingStatus === 'error' && (
                <div className="booking-status error">
                  <i className="fas fa-exclamation-circle"></i> Failed to book event. Please try again.
                </div>
              )}
              {!bookingStatus && (
                <div className="modal-actions">
                  <button className="cancel-button" onClick={handleCancelBooking}>
                    Cancel
                  </button>
                  <button className="confirm-button" onClick={handleConfirmBooking}>
                    Confirm Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="events-content">
        <div className="events-sidebar">
          <Link to="/" className="events-nav-btn">
            <FaHome />
            <span>Home</span>
          </Link>
          <div className="events-nav-btn active">
            <FaCalendarAlt />
            <span>Events</span>
          </div>
          {isAuthenticated && (
            <Link to="/booked-events" className="events-nav-btn">
              <FaTicketAlt />
              <span>Booked Events</span>
            </Link>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="events-nav-btn events-logout-btn">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/login" className="events-nav-btn">
              <FaSignInAlt />
              <span>Login</span>
            </Link>
          )}
        </div>

        <div className="events-main">
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
            <div className="filters-group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-filter"
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
                className="date-filter"
              >
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="price-filter"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100+">$100+</option>
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
              filteredEvents.map((event) => {
                const eventDate = eventDateTime(event.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return (
                  <div key={event.id} className="event-card">
                    {event.imageUrl && (
                      <div className="event-image-container">
                        <img 
                          src={`http://localhost:8080${event.imageUrl}`}
                          alt={event.name}
                          className="event-image"
                          onError={(e) => {
                            console.error('Image failed to load:', {
                              imageUrl: event.imageUrl,
                              eventId: event.id,
                              eventName: event.name
                            });
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image+Available';
                          }}
                        />
                      </div>
                    )}
                    {!event.imageUrl && (
                      <div className="event-image-container">
                        <img 
                          src="https://via.placeholder.com/400x200?text=No+Image+Available"
                          alt="No image available"
                          className="event-image"
                        />
                      </div>
                    )}
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
                      <div className="event-flags">
                        {eventDate < today && (
                          <span className="date-passed-flag">Date Passed</span>
                        )}
                        {bookedEventIds.has(event.id) && (
                          <span className="booked-flag"><i className="fas fa-check-circle"></i> Booked</span>
                        )}
                      </div>
                      <div className="event-footer">
                        <span className="event-price">${event.price}</span>
                        {!bookedEventIds.has(event.id) && (
                          <button 
                            className={`book-button ${!isLoggedIn ? 'disabled' : ''}`}
                            disabled={!isLoggedIn}
                            onClick={() => handleBookNow(event)}
                            title={!isLoggedIn ? "Please login to book events" : "Book this event"}
                          >
                            {isLoggedIn ? 'Book Now' : 'Login to Book'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer at the bottom of the page */}
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

      {showLoginNotification && (
        <div className="login-notification">
          Please login to book events
        </div>
      )}
    </div>
  );
};

export default Events; 