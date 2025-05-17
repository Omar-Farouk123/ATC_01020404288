import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './LoginPage.css';
import { authAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    address: '',
    phoneNumber: '',
    imageUrl: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prevState => ({
      ...prevState,
      phoneNumber: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Hardcoded admin login
    if (isLogin && formData.email === 'admin@gmail.com' && formData.password === 'admin') {
      setSuccess('Admin login successful! Redirecting to user creation...');
      setTimeout(() => {
        navigate('/new-user'); // Route to user creation form
      }, 1000);
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Handle login
        const response = await authAPI.login(formData.email, formData.password);
        const { token, role, id, email, fullName, imageUrl } = response.data;
        
        console.log('Login response:', {
          token: token ? 'Present' : 'Missing',
          role,
          id,
          email,
          imageUrl: imageUrl ? 'Present' : 'Missing'
        });
        
        // Set session expiration time (24 hours from now)
        const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        
        // Store user data and token in localStorage with expiry
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id,
          email,
          fullName,
          role: role?.toUpperCase(), // Ensure role is always uppercase
          imageUrl // Include the imageUrl in stored user data
        }));
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        
        setSuccess('Login successful!');
        console.log('Login successful:', response.data);
        
        // Wait for 1 second before navigating
        setTimeout(() => {
          // Navigate based on user role
          if (role?.toUpperCase() === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/events');
          }
        }, 1000);
      } else {
        // Handle registration
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match!');
          setIsLoading(false);
          return;
        }

        // Create FormData for image upload
        const formDataToSend = new FormData();
        formDataToSend.append('fullName', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('phoneNumber', formData.phoneNumber);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('role', 'USER'); // Always set role as USER for registration
        if (selectedImage) {
          formDataToSend.append('image', selectedImage);
        }

        const response = await authAPI.register(formDataToSend);
        
        if (response.data) {
          const { token, role, id, email, fullName, imageUrl } = response.data;
          
          // Set session expiration time (24 hours from now)
          const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
          
          // Store user data and token in localStorage with expiry
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify({
            id,
            email,
            fullName,
            role,
            imageUrl
          }));
          localStorage.setItem('tokenExpiry', expiryTime.toString());
          
          setSuccess('Registration successful! Please wait for admin approval.');
          console.log('Registration successful:', response.data);
          
          // Clear form data
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            address: '',
            phoneNumber: '',
            imageUrl: ''
          });
          setSelectedImage(null);
          setImagePreview(null);
          
          // Switch to login view after successful registration
          setIsLogin(true);
        }
      }
    } catch (err) {
      if (err.response?.data?.error === 'Account is not activated yet. Please wait for admin approval.') {
        setError('Your account is not activated yet. Please wait for admin approval.');
      } else {
        setError(err.response?.data?.error || 'An error occurred. Please try again.');
      }
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="header-bar">
        <div className="header-title">
          <h1>Login</h1>
          <span className="exclamation-mark">!</span>
        </div>
        <div className="header-buttons">
          <Link to="/" className="nav-button home-button">
            <i className="fas fa-home"></i> Home
          </Link>
          <Link to="/events" className="nav-button events-button">
            <i className="fas fa-calendar-alt"></i> Events
          </Link>
        </div>
      </div>
      <div className="login-box">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <PhoneInput
                  country={'us'}
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  inputProps={{
                    name: 'phoneNumber',
                    required: false,
                    placeholder: 'Enter your phone number'
                  }}
                  containerClass="phone-input-container"
                  inputClass="phone-input"
                  buttonClass="phone-input-button"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="image">Profile Picture</label>
                <div 
                  className={`image-upload-container ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-upload-input"
                  />
                  <div className="upload-placeholder">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Drag and drop your profile picture here, or click to browse</p>
                    <span>Supports: JPG, PNG, GIF</span>
                  </div>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i> Loading...
              </span>
            ) : (
              isLogin ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <div className="switch-form">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="switch-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;