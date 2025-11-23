import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import PromoDetail from './pages/PromoDetail';
import MerchantDashboard from './pages/MerchantDashboard';
import QRScanner from './pages/QRScanner';
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
        <Route path="/promo/:id" element={<PromoDetail />} />
        
        {/* User Routes */}
        <Route path="/favorites" element={<ProtectedRoute><div className="p-4 text-center">Favoritos (Em breve)</div></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><div className="p-4 text-center">Perfil (Em breve)</div></ProtectedRoute>} />
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
          path="/new-promo" 
          element={
            <ProtectedRoute requiredRole={UserRole.BUSINESS}>
              <div className="p-4 text-center">Nova Promoção (Em breve)</div>
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