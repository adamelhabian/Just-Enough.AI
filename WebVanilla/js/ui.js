// ui.js - Shared UI Layout, Navigation & Status Banners (V6.2 Truth Lock)
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
          ${mode === 'DEMO'
            ? `<span class="badge" style="background: #f59e0b; color: #ffffff; font-weight: 700; padding: 6px 12px; border-radius: 6px; font-size: 0.8125rem; letter-spacing: 0.5px;">DEMO / SYNTHETIC</span>`
            : `<span class="badge badge-success" style="background: #10b981; color: #ffffff; font-weight: 700; padding: 6px 12px; border-radius: 6px; font-size: 0.8125rem;">LIVE DATA</span>`
          }
          <span style="font-size: 0.8125rem; color: var(--gray-600);">Branch: Downtown Flagship (R01)</span>
        </div>
      </header>
      <div class="content-area">
        ${mode === 'DEMO' ? `
        <div class="banner banner-demo" style="background: #fffbeb; border: 2px solid #f59e0b; color: #92400e; padding: 12px 18px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>⚠️ DEMO / SYNTHETIC DATA ACTIVE</strong>: Displaying synthetic restaurant scenario. Canonical production behavior defaults to LIVE. Switch to LIVE in Settings to connect to production backend.
          </div>
          <a href="settings.html" class="btn btn-secondary" style="font-size: 0.75rem; padding: 4px 10px; margin-left: 12px;">Switch to LIVE</a>
        </div>` : `
        <div class="banner banner-live" style="background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 10px 16px; border-radius: 8px; margin-bottom: 20px;">
          <span>✅ <strong>LIVE PRODUCTION MODE</strong>: PostgreSQL multi-tenant isolation & FastAPI backend active. Failed requests will never silently fall back to synthetic data.</span>
        </div>`}
        <div id="pageContent"></div>
      </div>
    </main>
  </div>
  `;
}

export function renderErrorState(err) {
  const isOffline = err.name === 'OfflineError' || (err.message && err.message.includes('OFFLINE'));
  const isUnavailable = err.name === 'ServiceUnavailableError' || (err.message && err.message.includes('SERVICE UNAVAILABLE'));
  const title = isOffline ? 'OFFLINE' : (isUnavailable ? 'SERVICE UNAVAILABLE' : 'COMMUNICATION ERROR');
  const icon = isOffline ? '📡' : '🔴';

  return `
    <div class="card" style="border-left: 5px solid var(--danger); padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; align-items: flex-start; gap: 16px;">
        <span style="font-size: 2.25rem;">${icon}</span>
        <div>
          <h2 style="color: var(--danger); font-size: 1.25rem; margin-bottom: 8px; font-weight: 700;">
            ${title}
          </h2>
          <p style="color: var(--gray-700); font-size: 0.9375rem; margin-bottom: 12px; line-height: 1.5;">
            ${err.message}
          </p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 0.8125rem; color: #991b1b;">
            <strong>Zero-Fabrication Enforcement:</strong> Per governing directive V6.2, JustEnough.AI will <strong>NEVER</strong> automatically display synthetic or mock data when a live API request fails.
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <button onclick="window.location.reload()" class="btn btn-primary" style="font-size: 0.8125rem; padding: 8px 16px;">Retry Live Connection</button>
            <a href="settings.html" class="btn btn-secondary" style="font-size: 0.8125rem; padding: 8px 16px;">Explicitly Select DEMO Mode</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderCachedDataBanner(cachedAt) {
  return `
    <div class="banner banner-cached" style="background: #eff6ff; border: 1px solid #3b82f6; color: #1e40af; padding: 12px 18px; border-radius: 8px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 1.25rem;">ℹ️</span>
      <div>
        <strong>CACHED REAL DATA</strong>: Showing real operational data cached on <code>${cachedAt}</code>. Live API is currently unreachable.
      </div>
    </div>
  `;
}

export function bindCommonEvents() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => auth.logout());
  }
}
