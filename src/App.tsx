import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import { useAppStore } from './stores/useAppStore';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Settings = React.lazy(() => import('./pages/Settings'));
const FileLibrary = React.lazy(() => import('./pages/FileLibrary'));

const App: React.FC = () => {
  const { theme } = useAppStore();

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected/Main Routes */}
        <Route element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MainLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/files" element={<FileLibrary />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
