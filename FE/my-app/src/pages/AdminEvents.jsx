<div className="event-card">
  <div className="event-image-container">
    {event?.imageUrl ? (
      <img
        src={event?.imageUrl}
        alt={event?.name}
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
  <div className="event-details">
    // ... existing code ...
  </div>
</div> 