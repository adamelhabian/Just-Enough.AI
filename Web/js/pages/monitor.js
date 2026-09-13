import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, renderErrorState, renderCachedDataBanner, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Monitor & Waste');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const brief = await api.getMorningBrief();
      const cachedBanner = brief._dataSource === 'CACHED_REAL_DATA' ? renderCachedDataBanner(brief._cachedAt) : '';
      const demoTag = brief._dataSource === 'DEMO_SYNTHETIC' ? ' <span class="badge" style="background:#f59e0b; color:#fff; font-size:0.7rem;">DEMO / SYNTHETIC</span>' : '';

      content.innerHTML = `
        ${cachedBanner}
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Real-Time Risk Monitoring & Depletion Tracking${demoTag}</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Identifies critical stockout thresholds, shelf-life expiry, and high-variance items.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Monitor ID</th>
                  <th>Monitored Item</th>
                  <th>Current Stock</th>
                  <th>Operational Risk Factor</th>
                  <th>Depletion Status</th>
                </tr>
              </thead>
              <tbody>
                ${brief.to_monitor.map(m => `
                  <tr>
                    <td><code>${m.id}</code></td>
                    <td><strong>${m.item_name}</strong></td>
                    <td><strong>${m.current_stock} ${m.unit}</strong></td>
                    <td><span style="color: var(--warning); font-weight: 500;">${m.risk_factor}</span></td>
                    <td><span class="badge badge-warning">WATCHLIST</span></td>
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
