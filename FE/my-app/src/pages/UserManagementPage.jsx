import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHome, FaUsers, FaSignOutAlt, FaChartBar, FaEdit } from 'react-icons/fa';
import { adminAPI } from '../services/api';
import axios from 'axios';
import { API_URL } from '../config';
import NewUserForm from '../components/NewUserForm';
import EditUserForm from '../components/EditUserForm';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    const isTokenExpired = tokenExpiry && new Date().getTime() > parseInt(tokenExpiry);
    
    if (userData && !isTokenExpired) {
      setUser(userData);
    } else {
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

  const handleImageLoad = (userId) => {
    setLoadedImages(prev => ({
      ...prev,
      [userId]: true
    }));
  };

  const handleImageError = (userId) => {
    setLoadedImages(prev => ({
      ...prev,
      [userId]: false
    }));
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, { active: newStatus });
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

  const handleDeleteClick = (userToDelete) => {
    setSelectedUser(userToDelete);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminAPI.deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error('Error deleting user:', err);
    }
  };

  const handleCreateUser = async (formData) => {
    try {

      
      await axios.post(`${API_URL}/api/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchUsers();
    } catch (err) {
      throw err;
    }
  };

  const handleEditClick = (user) => {
    setSelectedUserForEdit(user);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      const response = await adminAPI.updateUser(selectedUserForEdit.id, formData);
      
      // Check if the current user's role was changed from admin to user
      if (selectedUserForEdit.id === user.id && 
          user.role === 'ADMIN' && 
          formData.get('role') === 'USER') {
        // Clear user data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        navigate('/login');
        return;
      }

      fetchUsers();
      setShowEditForm(false);
      setSelectedUserForEdit(null);
    } catch (err) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    }
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
    <div className="user-management-page">
      <div className="user-header">
        <div className="user-header-content">
          <div className="header-left">
            <h1>User Management</h1>
            <p>Manage user accounts and permissions</p>
          </div>
          {user && (
            <div className="header-right">
              <div className="user-avatar">
                {user.imageUrl && user.imageUrl.trim() !== '' ? (
                  <img 
                    src={`${API_URL}/api/images/users/${user.imageUrl}`}
                    alt={user.fullName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="avatar-fallback">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="user-content">
        <div className="user-nav">
          <Link to="/" className="nav-btn">
            <FaHome />
            <span>Home</span>
          </Link>
          <Link to="/admin" className="nav-btn">
            <FaChartBar />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/users" className="nav-btn active">
            <FaUsers />
            <span>Users</span>
          </Link>
          <button onClick={handleLogout} className="nav-btn logout">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>

        <div className="user-main">
          <div className="search-filter-container">
            <div className="search-filter-header">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="new-user-btn" onClick={() => setShowNewUserForm(true)}>
                <i className="fas fa-user-plus"></i>
                New User
              </button>
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
                      {user.imageUrl && user.imageUrl.trim() !== '' ? (
                        <>
                          <img 
                            src={`${API_URL}/api/images/users/${user.imageUrl}`}
                            alt={user.fullName}
                            loading="lazy"
                            onLoad={() => handleImageLoad(user.id)}
                            onError={() => handleImageError(user.id)}
                            style={{ display: loadedImages[user.id] === false ? 'none' : 'block' }}
                          />
                          {loadedImages[user.id] === false && (
                            <div className="avatar-fallback">
                              {user.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="avatar-fallback">
                          {user.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <h3>{user.fullName}</h3>
                      <div className="user-attributes">
                        <div className="attribute">
                          <span className="attribute-label">Email:</span>
                          <span className="attribute-value">{user.email}</span>
                        </div>
                        <div className="attribute">
                          <span className="attribute-label">Phone:</span>
                          <span className="attribute-value">{user.phoneNumber || 'Not provided'}</span>
                        </div>
                        <div className="attribute">
                          <span className="attribute-label">Address:</span>
                          <span className="attribute-value">{user.address || 'Not provided'}</span>
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
                    <button 
                      className="edit-user-btn"
                      onClick={() => handleEditClick(user)}
                      title="Edit User"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="delete-user-btn"
                      onClick={() => handleDeleteClick(user)}
                      title="Delete User"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h2>Delete User</h2>
              <button className="close-button" onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete {selectedUser.fullName}?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={handleDeleteConfirm}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewUserForm && (
        <NewUserForm
          onClose={() => setShowNewUserForm(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {showEditForm && selectedUserForEdit && (
        <EditUserForm
          user={selectedUserForEdit}
          onClose={() => {
            setShowEditForm(false);
            setSelectedUserForEdit(null);
          }}
          onSave={handleEditSubmit}
          className="admin-edit-form"
        />
      )}
    </div>
  );
};

export default UserManagementPage;