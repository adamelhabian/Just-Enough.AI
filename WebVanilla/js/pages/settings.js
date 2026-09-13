// settings.js - Environment & Mode Configuration (V6.2)
import { auth } from '../auth.js';
import { storage } from '../storage.js';
import { renderLayout, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Settings & Mode');
  bindCommonEvents();

  function loadSettings() {
    const content = document.getElementById('pageContent');
    const currentMode = storage.getMode();
    const user = auth.getUser();

    content.innerHTML = `
      <div class="card" style="max-width: 650px;">
        <h2 class="card-title">Data Environment & Operating Mode</h2>
        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label" for="modeSelect">Operating Mode</label>
          <select id="modeSelect" class="form-control">
            <option value="LIVE" ${currentMode === 'LIVE' ? 'selected' : ''}>Live Mode (Default Production — PostgreSQL & FastAPI)</option>
            <option value="DEMO" ${currentMode === 'DEMO' ? 'selected' : ''}>Demo Mode (Explicit Synthetic Data Only)</option>
          </select>
          <p class="form-text" style="margin-top: 8px; font-size: 0.8125rem; color: var(--gray-600);">
            <strong>Strict Truth Rule:</strong> In LIVE mode, if the API cannot be reached, the system will show <code>SERVICE UNAVAILABLE</code>, <code>OFFLINE</code>, or <code>CACHED REAL DATA</code>. It will NEVER automatically display fake/demo data.
          </p>
        </div>
        <button id="saveModeBtn" class="btn btn-primary">Save Environment Mode</button>
      </div>

      <div class="card" style="max-width: 650px; margin-top: 24px;">
        <h2 class="card-title">Tenant & Authentication Context</h2>
        <div style="margin-top: 12px; font-size: 0.875rem; line-height: 1.8;">
          <p><strong>Tenant:</strong> Downtown Flagship Restaurant (R01)</p>
          <p><strong>Active User:</strong> ${user ? user.name : 'Branch Manager'} (${user ? user.email : 'manager@justenough.ai'})</p>
          <p><strong>Authorized Role:</strong> ${user ? user.role : 'manager'}</p>
          <p><strong>Backend API Target:</strong> <code>https://justenough-api.onrender.com/api/v1</code></p>
        </div>
      </div>
    `;

    document.getElementById('saveModeBtn').addEventListener('click', () => {
      const selected = document.getElementById('modeSelect').value;
      storage.setMode(selected);
      alert(`Environment mode updated to: ${selected}. Reloading application...`);
      window.location.reload();
    });
  }
  loadSettings();
}
