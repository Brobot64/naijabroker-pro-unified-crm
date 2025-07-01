import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { Toaster } from "@/components/ui/toaster"
import { GlobalErrorBoundary } from "@/components/common/GlobalErrorBoundary";

const queryClient = new QueryClient();

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
