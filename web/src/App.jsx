import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AcadsMap from './pages/AcadsMap';
import CampusMap from './pages/CampusMap';
import Admin from './pages/Admin';
import Schedule from './pages/Schedule';
import { Toaster } from 'react-hot-toast';

const isAuthenticated = () => {
  const user = localStorage.getItem('speaker');
  return user !== null;
};

const ProtectedRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" replace />;

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* DEFAULT PAGE */}
        <Route path="/" element={<Home />} />

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/acads-map" element={<AcadsMap />} />
        <Route path="/campus-map" element={<CampusMap />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/admin" element={<Admin />} />
        {/* PROTECTED */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;