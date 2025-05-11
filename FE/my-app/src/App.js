import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Events from './pages/Events';
import AdminPage from './pages/AdminPage';
import LoadingBar from './components/LoadingBar';
import './components/LoadingBar.css';
import './App.css';

function App() {
  return (
    <Router>
      <LoadingBar />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
