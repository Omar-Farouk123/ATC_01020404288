import React, { useEffect } from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';

const HomePage = () => {
  useEffect(() => {
    document.title = 'Home | Booking System';  // ← Your custom title
  }, []);

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <h1>Book Your Perfect Experience</h1>
        <p>Find and book the best services in your area</p>
        <Link to="/login" className="cta-button">
          Get Started
        </Link>
      </section>

      {/* Features Section */}
      <section className="section">
        <h2>Why Choose Us</h2>
        <div className="grid">
          <div className="card">
            <span>📅</span>
            <h3>Easy Booking</h3>
            <p>Simple and quick booking process</p>
          </div>
          <div className="card">
            <span>⭐</span>
            <h3>Top Rated</h3>
            <p>Trusted by thousands of customers</p>
          </div>
          <div className="card">
            <span>🔒</span>
            <h3>Secure Payments</h3>
            <p>Safe and secure payment processing</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section">
        <h2>How It Works</h2>
        <div className="grid">
          <div className="card">
            <div className="number">1</div>
            <h3>Search</h3>
            <p>Find the service you need</p>
          </div>
          <div className="card">
            <div className="number">2</div>
            <h3>Book</h3>
            <p>Choose your preferred time</p>
          </div>
          <div className="card">
            <div className="number">3</div>
            <h3>Enjoy</h3>
            <p>Get your service done</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="hero">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of satisfied customers today</p>
        <Link to="/login" className="cta-button">
          Book Now
        </Link>
      </section>
    </div>
  );
};

export default HomePage; 