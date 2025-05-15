import React, { useState } from 'react';
import { adminAPI } from '../services/api';
import './AddEventForm.css';

const AddEventForm = ({ onClose, onEventAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    price: '',
    availableTickets: 100
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First create the event
      const formattedData = {
        ...formData,
        price: parseFloat(formData.price),
        availableTickets: parseInt(formData.availableTickets, 10)
      };

      const response = await adminAPI.createEvent(formattedData);
      const eventId = response.data.id;

      // Then upload the image if one was selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        await adminAPI.uploadEventImage(eventId, formData);
      }

      onEventAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Event</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="add-event-form">
          <div className="form-group">
            <label htmlFor="name">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter event name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter event description"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter event location"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="sports">Sports</option>
                <option value="music">Music</option>
                <option value="arts">Arts</option>
                <option value="food">Food</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter price"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventImage">Event Image</label>
            <div className="file-upload-container">
              <label htmlFor="eventImage" className="file-upload-label">
                <i className="fas fa-cloud-upload-alt upload-icon"></i>
                <span>{selectedFile ? selectedFile.name : 'Drop your image here or click to browse'}</span>
              </label>
              <input
                type="file"
                id="eventImage"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              {selectedFile && (
                <div className="image-preview">
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Preview" 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="availableTickets">Available Tickets</label>
            <input
              type="number"
              id="availableTickets"
              name="availableTickets"
              value={formData.availableTickets}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter number of available tickets"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Adding Event...' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm; 