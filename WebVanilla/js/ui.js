// ui.js - Shared UI Layout, Navigation & Banner Helpers
import { auth } from './auth.js';
import { storage } from './storage.js';

export function renderLayout(activePageTitle) {
  const user = auth.getUser() || { name: 'Branch Manager', role: 'manager' };
  const mode = storage.getMode();

  return `
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          JustEnough.AI
        </div>
        <div class="sidebar-subtitle">Restaurant Inventory Intelligence</div>
      </div>
      <nav class="sidebar-nav">
        <a href="morning-brief.html" class="nav-item ${activePageTitle === 'Morning Brief' ? 'active' : ''}">
          <span>☀️</span> Morning Brief
        </a>
        <a href="prepare.html" class="nav-item ${activePageTitle === 'Daily Prepare' ? 'active' : ''}">
          <span>🔪</span> Daily Prepare
        </a>
        <a href="order.html" class="nav-item ${activePageTitle === 'Order Recommendations' ? 'active' : ''}">
          <span>📦</span> Order Recommendations
        </a>
        <a href="monitor.html" class="nav-item ${activePageTitle === 'Monitor & Waste' ? 'active' : ''}">
          <span>📊</span> Monitor & Waste
        </a>
        <a href="alerts.html" class="nav-item ${activePageTitle === 'Active Alerts' ? 'active' : ''}">
          <span>🔔</span> Active Alerts
        </a>
        <a href="inventory.html" class="nav-item ${activePageTitle === 'Inventory Counts' ? 'active' : ''}">
          <span>📋</span> Inventory Counts
        </a>
        <a href="recommendation.html" class="nav-item ${activePageTitle === 'Recommendation Detail' ? 'active' : ''}">
          <span>💡</span> Recommendation Intel
        </a>
        <a href="audit.html" class="nav-item ${activePageTitle === 'Audit Trail' ? 'active' : ''}">
          <span>📜</span> Audit Trail
        </a>
        <a href="settings.html" class="nav-item ${activePageTitle === 'Settings' ? 'active' : ''}">
          <span>⚙️</span> Settings & Mode
        </a>
      </nav>
      <div class="sidebar-footer">
        <div><strong>${user.name}</strong></div>
        <div style="font-size: 0.75rem; text-transform: uppercase;">Role: ${user.role}</div>
        <button id="logoutBtn" class="btn btn-secondary" style="width: 100%; margin-top: 6px; padding: 6px 12px; font-size: 0.75rem;">Sign Out</button>
      </div>
    </aside>
    <main class="main-content">
      <header class="topbar">
        <h1 class="page-title">${activePageTitle}</h1>
        <div class="topbar-actions">
          <span class="badge ${mode === 'LIVE' ? 'badge-success' : 'badge-warning'}">MODE: ${mode}</span>
          <span style="font-size: 0.8125rem; color: var(--gray-600);">Branch: Downtown Flagship</span>
        </div>
      </header>
      <div class="content-area">
        ${mode === 'DEMO' ? `
        <div class="banner banner-demo">
          <span>⚠️ <strong>DEMO / SYNTHETIC DATA MODE ACTIVE</strong>: Showing realistic offline restaurant scenario. Switch to LIVE in Settings if backend is online.</span>
          <a href="settings.html" style="font-weight: 600; text-decoration: underline;">Configure</a>
        </div>` : `
        <div class="banner banner-live">
          <span>✅ <strong>LIVE BACKEND CONNECTED</strong>: PostgreSQL tenant isolation & real-time telemetry active.</span>
        </div>`}
        <div id="pageContent"></div>
      </div>
    </main>
  </div>
  `;
}

export function bindCommonEvents() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => auth.logout());
  }
}
