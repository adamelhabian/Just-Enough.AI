import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, renderErrorState, renderCachedDataBanner, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Active Alerts');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const alertRes = await api.getAlerts();
      const alerts = alertRes.alerts || alertRes;
      const cachedBanner = alertRes._dataSource === 'CACHED_REAL_DATA' ? renderCachedDataBanner(alertRes._cachedAt) : '';
      const demoTag = alertRes._dataSource === 'DEMO_SYNTHETIC' ? ' <span class="badge" style="background:#f59e0b; color:#fff; font-size:0.7rem;">DEMO / SYNTHETIC</span>' : '';

      content.innerHTML = `
        ${cachedBanner}
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Operational Alert Management${demoTag}</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Exceptions requiring immediate management attention.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Alert ID</th>
                  <th>Title & Description</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Recommended Mitigation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${alerts.map(a => `
                  <tr>
                    <td><code>${a.id}</code></td>
                    <td><strong>${a.title}</strong><br><small style="color: var(--gray-600);">${a.message}</small></td>
                    <td><span class="badge badge-info">${a.category}</span></td>
                    <td><span class="badge ${a.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${a.severity}</span></td>
                    <td><strong style="color: var(--gray-800);">${a.suggested_action}</strong></td>
                    <td>
                      <button class="btn btn-secondary dismiss-btn" data-id="${a.id}" style="font-size: 0.75rem; padding: 4px 8px;">Dismiss</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      document.querySelectorAll('.dismiss-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          alert(`Alert ${id} acknowledged and archived.`);
          e.target.closest('tr').style.opacity = '0.4';
          e.target.disabled = true;
        });
      });
    } catch (err) {
      content.innerHTML = renderErrorState(err);
    }
  }
  loadData();
}
