import React, { useState } from 'react';
import { Menu, Bell, Search as SearchIcon, Calendar, Sparkles } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/common/Badge';
import './layouts.css';

export const DashboardLayout = ({ children, title, subtitle }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="dashboard-main">
        {/* Top Dashboard Header */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="topbar-mobile-btn mobile-only"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Sidebar Menu"
            >
              <Menu size={22} />
            </button>
            <div className="topbar-title-box">
              {title && <h1 className="topbar-page-title">{title}</h1>}
              {subtitle && <p className="topbar-page-subtitle">{subtitle}</p>}
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-pill desktop-only">
              <Calendar size={15} color="var(--terracotta)" />
              <span>Today: Sept 14, 2026</span>
            </div>

            <div className="topbar-pill desktop-only">
              <Sparkles size={15} color="var(--emerald)" />
              <span>AI Model: Active (94.8% Accuracy)</span>
            </div>

            <button className="icon-badge-btn" aria-label="Notifications">
              <Bell size={19} />
              <span className="dot-badge"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content page-transition">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
