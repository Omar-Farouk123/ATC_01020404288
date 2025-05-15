import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = (e) => {
    console.log('Image failed to load. Event:', event);
    console.log('Attempted image URL:', `http://localhost:8080${event.imageUrl}`);
    console.log('Full event data:', JSON.stringify(event, null, 2));
    setImageError(true);
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/400x200?text=No+Image+Available';
  };

  return (
    <div className="event-card">
      {event.imageUrl && !imageError && (
        <div className="event-image-container">
          <img 
            src={`http://localhost:8080${event.imageUrl}`}
            alt={event.name}
            className="event-image"
            onError={handleImageError}
          />
        </div>
      )}
      {(!event.imageUrl || imageError) && (
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
        <p className="event-description">{event.description}</p>
        <div className="event-info">
          <span className="event-date">{event.date}</span>
          <span className="event-time">{event.time}</span>
        </div>
        <div className="event-location">
          <i className="fas fa-map-marker-alt"></i>
          <span>{event.location}</span>
        </div>
        <div className="event-price">
          <span>${event.price}</span>
        </div>
        <div className="event-category">
          <span>{event.category}</span>
        </div>
        <div className="event-tickets">
          <span>{event.availableTickets} tickets available</span>
        </div>
        <Link to={`/events/${event.id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard; 