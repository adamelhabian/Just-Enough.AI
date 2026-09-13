import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Active Alerts');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const alerts = await api.getAlerts();
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Active Operational Alerts</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">System-generated exceptions requiring branch manager resolution.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Alert Title</th><th>Severity</th><th>Category</th><th>Message</th><th>Suggested Action</th><th>Resolution</th></tr></thead>
              <tbody>
                ${alerts.map(a => `
                  <tr>
                    <td><strong>${a.title}</strong></td>
                    <td><span class="badge ${a.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${a.severity}</span></td>
                    <td>${a.category}</td>
                    <td>${a.message}</td>
                    <td><small style="font-weight: 600;">${a.suggested_action}</small></td>
                    <td><button class="btn btn-secondary" style="font-size: 0.75rem;" onclick="alert('Alert resolved and archived.')">Resolve</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = `<div class="card" style="color: var(--danger);">Error: ${err.message}</div>`;
    }
  }
  loadData();
}
