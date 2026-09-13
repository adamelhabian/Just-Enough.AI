import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { MorningBrief } from './pages/MorningBrief';
import { Prepare } from './pages/Prepare';
import { Order } from './pages/Order';
import { Monitor } from './pages/Monitor';
import { Alerts } from './pages/Alerts';
import { Inventory } from './pages/Inventory';
import { RecommendationDetail } from './pages/RecommendationDetail';
import { Audit } from './pages/Audit';
import { Settings } from './pages/Settings';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">Loading JustEnough...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/app/morning-brief" replace />} />
          <Route path="/app" element={<Navigate to="/app/morning-brief" replace />} />

          <Route
            path="/app/morning-brief"
            element={
              <ProtectedLayout>
                <MorningBrief />
              </ProtectedLayout>
            }
          />
          <Route
            path="/app/prepare"
            element={
              <ProtectedLayout>
                <Prepare />
              </ProtectedLayout>
            }
          />
          <Route
            path="/app/order"
            element={
              <ProtectedLayout>
                <Order />
              </ProtectedLayout>
            }
          />
          <Route
            path="/app/monitor"
            element={
              <ProtectedLayout>
                <Monitor />
              </ProtectedLayout>
            }
          />
          <Route
            path="/app/alerts"
            element={
              <ProtectedLayout>
                <Alerts />
              </ProtectedLayout>
            }
          />
          <Route
            path="/app/inventory"
            element={
              <ProtectedLayout>
                <Inventory />
              </ProtectedLayout>
            }
          />
          <Route
            path="/app/recommendations/:id"
            element={
              <ProtectedLayout>
                <RecommendationDetail />
              </ProtectedLayout>
            }
          />
          <Route
            path="/app/audit"
            element={
              <ProtectedLayout>
                <Audit />
              </ProtectedLayout>
            }
          />
          <Route
            path="/app/settings"
            element={
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/app/morning-brief" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
