import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBars, FaHome, FaCog, FaUsers, FaChartBar, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { adminAPI } from '../services/api';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage and check token expiration
    const userData = JSON.parse(localStorage.getItem('user'));
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    const isTokenExpired = tokenExpiry && new Date().getTime() > parseInt(tokenExpiry);
    
    if (userData && !isTokenExpired) {
      setUser(userData);
    } else {
      // Clear expired session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      navigate('/login');
    }
    
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      setLoading(false);
      console.error('Error fetching users:', err);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, { active: newStatus });
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, enabled: newStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status. Please try again.');
      console.error('Error updating user status:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    navigate('/login');
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-bar"></div>
      </div>
    );
  }

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
          </div>
        </div>
        
        <div className="sidebar-user-section">
          <div className="sidebar-user-info">
            {!isSidebarExpanded && (
              <div className="sidebar-user-avatar">
                <FaUser />
              </div>
            )}
            {isSidebarExpanded && (
              <div className="sidebar-user-details">
                <h3>{user?.fullName || 'Guest'}</h3>
                <p>{user?.email || 'Not logged in'}</p>
              </div>
            )}
          </div>
          
          <nav className="sidebar-nav">
            <Link to="/admin" className="nav-item">
              <FaHome />
              {isSidebarExpanded && <span>Home</span>}
            </Link>
            <button className="nav-item">
              <FaCog />
              {isSidebarExpanded && <span>Settings</span>}
            </button>
            <button className="nav-item">
              <FaChartBar />
              {isSidebarExpanded && <span>Statistics</span>}
            </button>
            <button onClick={handleLogout} className="nav-item logout">
              <FaSignOutAlt />
              {isSidebarExpanded && <span>Logout</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${!isSidebarExpanded ? 'expanded' : ''}`}>
        <div className="content-header">
          <h1>User Management</h1>
          <p className="dashboard-subtitle">Manage user accounts and permissions</p>
        </div>

        <div className="search-filter-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="users-list">
          {filteredUsers.length === 0 ? (
            <div className="no-users">No users found</div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h3>{user.fullName}</h3>
                    <p className="user-email">{user.email}</p>
                    <div className="user-attributes">
                      <div className="attribute">
                        <span className="attribute-label">Phone:</span>
                        <span className="attribute-value">{user.phoneNumber || 'Not provided'}</span>
                      </div>
                      <div className="attribute">
                        <span className="attribute-label">Address:</span>
                        <span className="attribute-value">{user.address || 'Not provided'}</span>
                      </div>
                      <div className="attribute">
                        <span className="attribute-label">Created:</span>
                        <span className="attribute-value">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`user-role ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="user-actions">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.enabled}
                      onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="status-text">
                    {user.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage; 