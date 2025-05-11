import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCog, FaUsers, FaChartBar, FaSignOutAlt, FaBars } from 'react-icons/fa';
import './AdminPage.css';

const AdminPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="header-buttons">
            <button 
              className="toggle-sidebar-btn"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              <FaBars />
            </button>
            {isSidebarExpanded && (
              <a href="/" className="home-btn">
                <FaHome />
              </a>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item">
            <i><FaHome /></i>
            {isSidebarExpanded && <span>Home</span>}
          </button>
          <button className="nav-item">
            <i><FaCog /></i>
            {isSidebarExpanded && <span>Settings</span>}
          </button>
          <button className="nav-item">
            <i><FaUsers /></i>
            {isSidebarExpanded && <span>Manage Users</span>}
          </button>
          <button className="nav-item">
            <i><FaChartBar /></i>
            {isSidebarExpanded && <span>Statistics</span>}
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <i><FaSignOutAlt /></i>
            {isSidebarExpanded && <span>Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isSidebarExpanded ? 'expanded' : ''}`}>
        <div className="content-header">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="dashboard-content">
          <p>Welcome to the admin dashboard. Use the sidebar to navigate through different sections.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 