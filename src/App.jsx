import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
      <nav className='nav-container'>
        <p className='heading'>SpendWise</p>
        <div className='nav-items'>
          <Link className='navLink' to="/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>
          <Link className='navLink' to="/journal">Journal</Link>
        </div>
      </nav>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
