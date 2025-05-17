import React, { useState } from 'react';
import { API_URL } from '../config';

const EditUserForm = ({ user, onClose, onSave, className }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
    role: user.role || 'USER',
    enabled: user.enabled !== undefined ? user.enabled : true,
    image: null
  });

  const [previewImage, setPreviewImage] = useState(user.imageUrl ? `${API_URL}/api/images/users/${user.imageUrl}` : null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('EditUserForm: handleSubmit called');
    try {
      // Build FormData for API
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('address', formData.address);
      data.append('role', formData.role);
      data.append('enabled', formData.enabled);
      if (formData.image) {
        data.append('image', formData.image);
      }
      console.log('EditUserForm: calling onSave', data);
      if (typeof onSave === 'function') {
        await onSave(data);
      } else {
        console.error('EditUserForm: onSave is not a function', onSave);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update user');
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`edit-user-form ${className || ''}`}>
        <div className="edit-user-form-header">
          <h2>Edit User Profile</h2>
        </div>
        <div className="edit-user-form-content">
          <form onSubmit={handleSubmit}>
            <div className="image-preview-container">
              <div className="image-preview">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={formData.fullName}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="avatar-fallback" style={{ display: previewImage ? 'none' : 'flex' }}>
                  {formData.fullName.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div className="image-upload">
                <label htmlFor="image-upload">
                  <i className="fas fa-camera"></i>
                  Change Photo
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="enabled">Status</label>
              <select
                id="enabled"
                value={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.value === 'true' })}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;