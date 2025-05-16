import React, { useState, useRef } from 'react';
import { adminAPI } from '../services/api';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
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

  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState();
  const [imgSrc, setImgSrc] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value) error = 'Name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        else if (value.length > 100) error = 'Name must be less than 100 characters';
        break;
      case 'description':
        if (!value) error = 'Description is required';
        else if (value.length < 2) error = 'Description must be at least 2 characters';
        else if (value.length > 2000) error = 'Description must be less than 2000 characters';
        break;
      case 'date':
        if (!value) error = 'Date is required';
        else if (new Date(value) < new Date()) error = 'Date must be in the future';
        break;
      case 'time':
        if (!value) error = 'Time is required';
        break;
      case 'location':
        if (!value) error = 'Location is required';
        break;
      case 'category':
        if (!value) error = 'Category is required';
        break;
      case 'price':
        if (!value) error = 'Price is required';
        else if (parseFloat(value) < 0) error = 'Price must be greater than or equal to 0';
        break;
      case 'availableTickets':
        if (!value) error = 'Available tickets is required';
        else if (parseInt(value) < 1) error = 'Available tickets must be at least 1';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate the field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropSize = Math.min(width, height);
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: 'px',
          width: cropSize,
          height: cropSize,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImg = (src, crop) => {
    const image = new Image();
    image.src = src;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match the crop size
        canvas.width = 300;
        canvas.height = 300;

        // Get the actual image dimensions
        const imgWidth = image.naturalWidth;
        const imgHeight = image.naturalHeight;

        // Calculate the scale factor between the displayed image and the actual image
        const scaleX = imgWidth / imgRef.current.width;
        const scaleY = imgHeight / imgRef.current.height;

        // Calculate the actual crop coordinates and dimensions
        const cropX = Math.round(crop.x * scaleX);
        const cropY = Math.round(crop.y * scaleY);
        const cropWidth = Math.round(crop.width * scaleX);
        const cropHeight = Math.round(crop.height * scaleY);

        // Create circular clip path
        ctx.beginPath();
        ctx.arc(150, 150, 150, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate the scaling factor to fit the crop into the 300x300 canvas
        const scale = Math.min(300 / cropWidth, 300 / cropHeight);

        // Calculate the position to center the image
        const scaledWidth = cropWidth * scale;
        const scaledHeight = cropHeight * scale;
        const x = (300 - scaledWidth) / 2;
        const y = (300 - scaledHeight) / 2;

        // Draw the cropped image
        ctx.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          x,
          y,
          scaledWidth,
          scaledHeight
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg', 0.95);
      };
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !crop) return;

    try {
      console.log('Crop coordinates:', {
        x: crop.x,
        y: crop.y,
        width: crop.width,
        height: crop.height,
        imageWidth: imgRef.current.width,
        imageHeight: imgRef.current.height,
        naturalWidth: imgRef.current.naturalWidth,
        naturalHeight: imgRef.current.naturalHeight
      });
      
      const croppedImage = await getCroppedImg(imgSrc, crop);
      setSelectedFile(croppedImage);
      setShowCropModal(false);
    } catch (e) {
      console.error('Error cropping image:', e);
      setError('Failed to crop image. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const formattedData = {
        ...formData,
        price: parseFloat(formData.price),
        availableTickets: parseInt(formData.availableTickets, 10)
      };

      const response = await adminAPI.createEvent(formattedData);
      const eventId = response.data.id;

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

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImgSrc('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
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
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
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
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
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
                className={errors.time ? 'error' : ''}
              />
              {errors.time && <span className="field-error">{errors.time}</span>}
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
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <span className="field-error">{errors.location}</span>}
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
                className={errors.category ? 'error' : ''}
              >
                <option value="">Select a category</option>
                <option value="sports">Sports</option>
                <option value="music">Music</option>
                <option value="arts">Arts</option>
                <option value="food">Food</option>
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
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
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
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
                ref={fileInputRef}
                type="file"
                id="eventImage"
                accept="image/*"
                onChange={onSelectFile}
                className="file-input"
              />
              {selectedFile && (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                    />
                  </div>
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={handleRemoveImage}
                    title="Remove image"
                  >
                    <i className="fas fa-times"></i>
                  </button>
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
              className={errors.availableTickets ? 'error' : ''}
            />
            {errors.availableTickets && <span className="field-error">{errors.availableTickets}</span>}
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

        {showCropModal && (
          <div className="crop-modal">
            <div className="crop-modal-content">
              <h3>Crop Image</h3>
              <p className="crop-instructions">Select a circular area for your event image</p>
              <div className="crop-container">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={1}
                  circularCrop={true}
                  className="crop-area"
                >
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    onLoad={onImageLoad}
                    alt="Crop preview"
                    style={{ maxWidth: '100%', maxHeight: '60vh' }}
                  />
                </ReactCrop>
              </div>
              <div className="crop-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowCropModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="submit-button"
                  onClick={handleCropComplete}
                >
                  Crop & Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEventForm; 