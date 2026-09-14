import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Other Developer's Core Pages
import DashboardPage from './features/dashboard/presentation/DashboardPage';
import ForecastPage from './features/forecast/presentation/ForecastPage';
import ProductionPlanPage from './features/production/presentation/ProductionPlanPage';

function App() {
  return (
    <Routes>
      {/* Management & Business Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* Core Product Pages */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/forecast" element={<ForecastPage />} />
      <Route path="/production" element={<ProductionPlanPage />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
