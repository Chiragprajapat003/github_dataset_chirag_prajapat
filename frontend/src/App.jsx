import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layouts/DashboardLayout';
import { Loader2 } from 'lucide-react';
import SEO from './components/common/SEO';

// Lazy loading pages for optimized performance
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const DataListing = lazy(() => import('./pages/dashboard/DataListing'));
const Analytics = lazy(() => import('./pages/dashboard/Analytics'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={
            <>
              <SEO title="Sign In" />
              <Login />
            </>
          } />
          <Route path="/register" element={
            <>
              <SEO title="Create Account" />
              <Register />
            </>
          } />

          {/* Protected Dashboard Layout and Sub-views */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <>
                <SEO title="Dataset Catalog" />
                <DataListing />
              </>
            } />
            <Route path="analytics" element={
              <>
                <SEO title="Data Aggregation Charts" />
                <Analytics />
              </>
            } />
            <Route path="profile" element={
              <>
                <SEO title="Security Settings" />
                <Profile />
              </>
            } />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>

      {/* Global Toast Alert Notifications */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Router>
  );
}

export default App;
