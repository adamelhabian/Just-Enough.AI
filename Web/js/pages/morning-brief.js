import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, renderErrorState, renderCachedDataBanner, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Morning Brief');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    content.innerHTML = '<p style="color: var(--gray-600);">Loading operational morning brief...</p>';
    try {
      const brief = await api.getMorningBrief();
      const cachedBanner = brief._dataSource === 'CACHED_REAL_DATA' ? renderCachedDataBanner(brief._cachedAt) : '';
      const demoTag = brief._dataSource === 'DEMO_SYNTHETIC' ? ' <span class="badge" style="background:#f59e0b; color:#fff; font-size:0.7rem;">DEMO / SYNTHETIC</span>' : '';

      content.innerHTML = `
        ${cachedBanner}
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Stock Health Index${demoTag}</div>
            <div class="kpi-value" style="color: var(--success);">${brief.kpis.stock_health_pct}%</div>
            <div class="kpi-desc">Based on safety buffer ratios</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Kitchen Prep Tasks${demoTag}</div>
            <div class="kpi-value">${brief.kpis.pending_prep_count}</div>
            <div class="kpi-desc">BOM conversion scheduled</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Recommended Orders${demoTag}</div>
            <div class="kpi-value">${brief.kpis.pending_orders_count}</div>
            <div class="kpi-desc">Purchase recommendations</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Active Alerts${demoTag}</div>
            <div class="kpi-value" style="color: var(--danger);">${brief.kpis.active_alerts_count}</div>
            <div class="kpi-desc">Actionable exceptions</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">🔪 1. What to Prepare Next${demoTag}</h2>
              <a href="prepare.html" class="btn btn-secondary" style="font-size: 0.75rem;">View Prep Board</a>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead><tr><th>Recipe Item</th><th>Target Qty</th><th>Priority</th></tr></thead>
                <tbody>
                  ${brief.to_prepare.map(p => `
                    <tr>
                      <td><strong>${p.item_name}</strong><br><small style="color: var(--gray-600);">${p.recipe_summary}</small></td>
                      <td><strong>${p.target_qty} ${p.unit}</strong></td>
                      <td><span class="badge ${p.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}">${p.priority}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2 class="card-title">📦 2. What to Order Next${demoTag}</h2>
              <a href="order.html" class="btn btn-secondary" style="font-size: 0.75rem;">View Orders</a>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead><tr><th>Ingredient</th><th>Order Qty</th><th>Supplier</th></tr></thead>
                <tbody>
                  ${brief.to_order.map(o => `
                    <tr>
                      <td><strong>${o.ingredient}</strong></td>
                      <td><strong>${o.recommended_qty} ${o.unit}</strong></td>
                      <td>${o.supplier} (${o.lead_time_days}d lead)</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">📊 3. What to Monitor Next${demoTag}</h2>
              <a href="monitor.html" class="btn btn-secondary" style="font-size: 0.75rem;">Monitor Details</a>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead><tr><th>Item</th><th>Current Stock</th><th>Risk Factor</th></tr></thead>
                <tbody>
                  ${brief.to_monitor.map(m => `
                    <tr>
                      <td><strong>${m.item_name}</strong></td>
                      <td>${m.current_stock} ${m.unit}</td>
                      <td><span style="color: var(--warning);">${m.risk_factor}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h2 class="card-title">🔔 4. Operational Alerts${demoTag}</h2>
              <a href="alerts.html" class="btn btn-secondary" style="font-size: 0.75rem;">Alert Center</a>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead><tr><th>Alert</th><th>Severity</th><th>Action Required</th></tr></thead>
                <tbody>
                  ${brief.alerts.map(a => `
                    <tr>
                      <td><strong>${a.title}</strong><br><small>${a.message}</small></td>
                      <td><span class="badge ${a.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${a.severity}</span></td>
                      <td><small style="font-weight: 600;">${a.suggested_action}</small></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = renderErrorState(err);
    }
  }
  loadData();
}
