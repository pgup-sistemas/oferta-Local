
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import MerchantSignup from './pages/MerchantSignup';
import PromoDetail from './pages/PromoDetail';
import MerchantDashboard from './pages/MerchantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QRScanner from './pages/QRScanner';
import NewPromo from './pages/NewPromo';
import Inventory from './pages/Inventory';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import CampaignManager from './pages/CampaignManager';
import CampaignView from './pages/CampaignView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/merchant-signup" element={<MerchantSignup />} />
        <Route path="/promo/:id" element={<PromoDetail />} />
        <Route path="/c/:id" element={<CampaignView />} />
        
        {/* User Routes */}
        <Route 
          path="/favorites" 
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route path="/scanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
        
        {/* Merchant Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole={UserRole.BUSINESS}>
              <MerchantDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute requiredRole={UserRole.BUSINESS}>
              <Inventory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/new-promo" 
          element={
            <ProtectedRoute requiredRole={UserRole.BUSINESS}>
              <NewPromo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/campaigns" 
          element={
            <ProtectedRoute requiredRole={UserRole.BUSINESS}>
              <CampaignManager />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/validate" 
          element={
            <ProtectedRoute requiredRole={UserRole.BUSINESS}>
              <QRScanner />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
