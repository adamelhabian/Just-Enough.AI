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
      <div class="card" style="max-width: 600px;">
        <h2 class="card-title">Environment & Mode Configuration</h2>
        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label" for="modeSelect">Data Environment</label>
          <select id="modeSelect" class="form-control">
            <option value="DEMO" ${currentMode === 'DEMO' ? 'selected' : ''}>Demo Mode (Synthetic Data, Standalone Verification)</option>
            <option value="LIVE" ${currentMode === 'LIVE' ? 'selected' : ''}>Live Mode (PostgreSQL & FastAPI Backend)</option>
          </select>
          <small class="form-text">Demo mode operates entirely client-side for offline resilience and demonstration.</small>
        </div>
        <button id="saveModeBtn" class="btn btn-primary">Update Environment</button>
      </div>

      <div class="card" style="max-width: 600px;">
        <h2 class="card-title">Tenant & User Details</h2>
        <div style="margin-top: 12px; font-size: 0.875rem;">
          <p><strong>Tenant:</strong> Downtown Flagship Restaurant (R01)</p>
          <p><strong>User:</strong> ${user ? user.name : 'Branch Manager'} (${user ? user.email : 'manager@justenough.ai'})</p>
          <p><strong>Role:</strong> ${user ? user.role : 'manager'}</p>
        </div>
      </div>
    `;

    document.getElementById('saveModeBtn').addEventListener('click', () => {
      const selected = document.getElementById('modeSelect').value;
      storage.setMode(selected);
      alert(`Environment mode updated to: ${selected}`);
      window.location.reload();
    });
  }
  loadSettings();
}
