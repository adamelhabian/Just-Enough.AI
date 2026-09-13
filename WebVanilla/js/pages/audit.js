import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, renderErrorState, renderCachedDataBanner, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Audit Trail');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const auditRes = await api.getAuditLogs();
      const logs = auditRes.logs || auditRes;
      const cachedBanner = auditRes._dataSource === 'CACHED_REAL_DATA' ? renderCachedDataBanner(auditRes._cachedAt) : '';
      const demoTag = auditRes._dataSource === 'DEMO_SYNTHETIC' ? ' <span class="badge" style="background:#f59e0b; color:#fff; font-size:0.7rem;">DEMO / SYNTHETIC</span>' : '';

      content.innerHTML = `
        ${cachedBanner}
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Immutable Compliance Audit Trail${demoTag}</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Chronological record of manager overrides, stock adjustments, and system events.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Timestamp (UTC)</th>
                  <th>User / Actor</th>
                  <th>Action Category</th>
                  <th>Event Details</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr>
                    <td><code>${l.id}</code></td>
                    <td><small>${l.timestamp}</small></td>
                    <td><strong>${l.user_email}</strong></td>
                    <td><span class="badge ${l.action.includes('OVERRIDE') ? 'badge-warning' : 'badge-info'}">${l.action}</span></td>
                    <td>${l.details}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = renderErrorState(err);
    }
  }
  loadData();
}
