import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
  return (
    <div className="event-card">
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