import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AppTheme from './theme/AppTheme';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Auth from './components/auth/Auth';
import Complaint from './components/complaint/Complaint';
import TrackComplaint from './components/complaint/TrackComplaint';
import Dashboard from './components/dashboard/Dashboard';
import InvestigasiAnalisis from './components/investigasi/InvestigasiAnalisis';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AppTheme>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Complaint />} />
              <Route path="/lacak-pengaduan" element={<TrackComplaint />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/investigasi-analisis"
                element={
                  <ProtectedRoute>
                    <InvestigasiAnalisis />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </AppTheme>
  );
};

export default App;
