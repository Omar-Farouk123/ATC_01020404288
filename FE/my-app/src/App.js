import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage'; // Import the LoginPage component
import LoadingBar from './components/LoadingBar';
import './components/LoadingBar.css';

function App() {
  return (
    <Router>
      <LoadingBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
