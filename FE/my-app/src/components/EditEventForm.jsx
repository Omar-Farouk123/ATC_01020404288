import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../services/api';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './AddEventForm.css';
import axios from 'axios';

const EditEventForm = ({ event, onClose, onEventUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    category: '',
    availableTickets: '',
    imageUrl: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [crop, setCrop] = useState();
  const [imgSrc, setImgSrc] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        time: event.time || '',
        location: event.location || '',
        price: event.price || '',
        category: event.category || '',
        availableTickets: event.availableTickets || '',
        imageUrl: event.imageUrl || ''
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropSize = 300; // Fixed size for the crop
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
    return new Promise((resolve, reject) => {
      try {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = src;

        image.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 300;

            const imgWidth = image.naturalWidth;
            const imgHeight = image.naturalHeight;
            const scaleX = imgWidth / imgRef.current.width;
            const scaleY = imgHeight / imgRef.current.height;

            const cropX = Math.round(crop.x * scaleX);
            const cropY = Math.round(crop.y * scaleY);
            const cropWidth = Math.round(crop.width * scaleX);
            const cropHeight = Math.round(crop.height * scaleY);

            ctx.beginPath();
            ctx.arc(150, 150, 150, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            const scale = Math.min(300 / cropWidth, 300 / cropHeight);
            const scaledWidth = cropWidth * scale;
            const scaledHeight = cropHeight * scale;
            const x = (300 - scaledWidth) / 2;
            const y = (300 - scaledHeight) / 2;

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
                reject(new Error('Canvas is empty'));
                return;
              }
              const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
              resolve(file);
            }, 'image/jpeg', 0.95);
          } catch (err) {
            reject(new Error(`Error processing image: ${err.message}`));
          }
        };

        image.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      } catch (err) {
        reject(new Error(`Error in getCroppedImg: ${err.message}`));
      }
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !crop) {
      console.error('Missing image reference or crop data');
      setError('Failed to crop image. Please try again.');
      return;
    }

    try {
      // Check authentication and role
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      console.log('Auth Check:', {
        hasToken: !!token,
        tokenLength: token?.length,
        userRole: userData?.role,
        userId: userData?.id,
        eventId: event.id
      });
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!userData || userData.role?.toUpperCase() !== 'ADMIN') {
        throw new Error('You do not have permission to upload images');
      }

      console.log('Starting crop process...');
      const croppedImage = await getCroppedImg(imgSrc, crop);
      console.log('Image cropped successfully');

      const formDataToUpload = new FormData();
      formDataToUpload.append('file', croppedImage);
      console.log('FormData created with cropped image');

      // Log request details
      console.log('Upload Request Details:', {
        url: `http://localhost:8080/api/events/${event.id}/upload-image`,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token.substring(0, 10)}...` // Log only part of token for security
        },
        eventId: event.id
      });

      // Use the API service with proper endpoint
      const response = await axios.post(
        `http://localhost:8080/api/events/${event.id}/upload-image`,
        formDataToUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Image uploaded successfully:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      setFormData(prev => ({
        ...prev,
        imageUrl: response.data
      }));
      setShowCropModal(false);
      setShowImageUpload(false); // Hide the drop zone after successful upload
    } catch (e) {
      console.error('Error in crop process:', {
        message: e.message,
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
        headers: e.response?.headers
      });
      
      if (e.response?.status === 403) {
        setError('You do not have permission to upload images. Please check your admin privileges.');
      } else {
        setError(`Failed to crop image: ${e.message}`);
      }
      setShowCropModal(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await adminAPI.uploadImage(formData);
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.imageUrl
      }));
      setShowImageUpload(false);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Error uploading image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  const handleEditImage = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImgSrc(`http://localhost:8080${formData.imageUrl}`);
      setShowCropModal(true);
    };
    img.onerror = () => {
      setError('Failed to load image. Please try again.');
    };
    img.src = `http://localhost:8080${formData.imageUrl}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format the data to match EventUpdateDTO
      const formattedData = {
        name: formData.name,
        description: formData.description,
        date: formData.date, // This will be parsed as LocalDate on the backend
        time: formData.time,
        location: formData.location,
        price: parseFloat(formData.price),
        category: formData.category,
        availableTickets: parseInt(formData.availableTickets, 10),
        imageUrl: formData.imageUrl || null // Only send if it exists
      };

      // Log the update request details
      console.log('Update Event Request:', {
        eventId: event.id,
        formattedData
      });

      const response = await adminAPI.updateEvent(event.id, formattedData);
      console.log('Update Event Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      onEventUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating event:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers
      });
      
      if (err.response?.status === 403) {
        setError('You do not have permission to update events. Please check your admin privileges.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else if (err.response?.data?.message) {
        // Use the specific error message from the backend if available
        setError(err.response.data.message);
      } else {
        setError('Failed to update event. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="modal-header">
          <h2>Edit Event</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="event-details-confirm">
              <div className="form-group">
                <label htmlFor="name">Event Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="availableTickets">Available Tickets</label>
                  <input
                    type="number"
                    id="availableTickets"
                    name="availableTickets"
                    value={formData.availableTickets}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
              </div>

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

              <div className="form-group image-management">
                <label>Event Image</label>
                {formData.imageUrl ? (
                  <div className="current-image">
                    <img 
                      src={`http://localhost:8080${formData.imageUrl}`} 
                      alt="Event" 
                      className="preview-image"
                    />
                    <div className="image-actions">
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                ) : !showImageUpload ? (
                  <button 
                    type="button" 
                    className="add-image-btn"
                    onClick={() => setShowImageUpload(true)}
                  >
                    <i className="fas fa-plus"></i> Add Image
                  </button>
                ) : null}

                {showImageUpload && (
                  <div 
                    className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="image-upload" className="drop-zone-label">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Drag and drop an image here or click to select</p>
                      <span className="file-types">Supported formats: JPG, PNG, GIF</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="confirm-button" disabled={loading}>
                {loading ? 'Updating...' : 'Submit Edit'}
              </button>
            </div>
          </form>
        </div>
      </div>

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
                  crossOrigin="anonymous"
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
                className="confirm-button"
                onClick={handleCropComplete}
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEventForm; 