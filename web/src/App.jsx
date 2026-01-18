import React from 'react'; // Don't forget React import
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// import Schedule from './pages/Schedule'; // See note below
import AcadsMap from './pages/AcadsMap';
import CampusMap from './pages/CampusMap';

// CORRECTION HERE: Check if 'speaker' data exists
const isAuthenticated = () => {
  const user = localStorage.getItem('speaker');
  return user !== null; // Returns true if user data exists
};

const ProtectedRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" replace />;

function App() {
  return (
    <Router>
      <Routes>
        {/* DEFAULT PAGE */}
        <Route path="/" element={<Home />} />

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        
        {/* Make maps public or protected based on your preference */}
        <Route path="/acads-map" element={<AcadsMap />} />
        <Route path="/campus-map" element={<CampusMap />} />

        {/* PROTECTED */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Note: The Dashboard I designed already includes the Schedule. 
            You might not need a separate /schedule route unless you want a dedicated page. */}
        {/* <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        /> */}

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;