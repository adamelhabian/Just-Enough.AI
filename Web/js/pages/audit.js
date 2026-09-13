import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Audit Trail');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const logs = await api.getAuditLogs();
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Immutable Audit Trail & Regulatory Log</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Chronological log of all inventory reconciliations and recommendation overrides.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Event ID</th><th>Timestamp</th><th>Actor Email</th><th>Action Type</th><th>Event Details</th></tr></thead>
              <tbody>
                ${logs.map(log => `
                  <tr>
                    <td><code>${log.id}</code></td>
                    <td>${log.timestamp}</td>
                    <td><strong>${log.user_email}</strong></td>
                    <td><span class="badge badge-info">${log.action}</span></td>
                    <td>${log.details}</td>
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
