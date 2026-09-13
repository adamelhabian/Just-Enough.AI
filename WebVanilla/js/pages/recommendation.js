import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, renderErrorState, renderCachedDataBanner, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Recommendation Detail');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const recRes = await api.getRecommendations();
      const recs = recRes.recommendations || recRes;
      const cachedBanner = recRes._dataSource === 'CACHED_REAL_DATA' ? renderCachedDataBanner(recRes._cachedAt) : '';
      const demoTag = recRes._dataSource === 'DEMO_SYNTHETIC' ? ' <span class="badge" style="background:#f59e0b; color:#fff; font-size:0.7rem;">DEMO / SYNTHETIC</span>' : '';

      content.innerHTML = `
        ${cachedBanner}
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">AI Recommendation Engine & Audited Override${demoTag}</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Explainable purchase orders driven by LightGBM quantile regression & safety buffers.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Recommendation ID</th>
                  <th>Ingredient SKU</th>
                  <th>Current Stock</th>
                  <th>AI Recommended</th>
                  <th>Model Confidence</th>
                  <th>Explainability & Rationale</th>
                  <th>Override Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${recs.map(r => `
                  <tr>
                    <td><code>${r.id}</code></td>
                    <td><strong>${r.item_name}</strong></td>
                    <td>${r.current_stock} ${r.unit}</td>
                    <td><strong style="color: var(--primary);">${r.override_qty !== null ? r.override_qty : r.recommended_qty} ${r.unit}</strong></td>
                    <td><span class="badge badge-info">${Math.round(r.confidence * 100)}%</span></td>
                    <td><small style="color: var(--gray-700);">${r.explanation}</small></td>
                    <td>
                      ${r.status === 'OVERRIDDEN'
                        ? `<span class="badge badge-warning">OVERRIDDEN (${r.override_qty} ${r.unit})</span><br><small style="color: var(--gray-600);">${r.override_reason}</small>`
                        : `<span class="badge badge-success">ACCEPTED</span>`}
                    </td>
                    <td>
                      <button class="btn btn-secondary override-btn" data-id="${r.id}" data-name="${r.item_name}" data-unit="${r.unit}" data-current="${r.recommended_qty}" style="font-size: 0.75rem; padding: 4px 8px;">Override</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      document.querySelectorAll('.override-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const name = e.target.dataset.name;
          const unit = e.target.dataset.unit;
          const current = e.target.dataset.current;
          const newQty = prompt(`Enter audited override quantity for ${name} (${unit}) [Current AI: ${current}]:`);
          if (newQty !== null && !isNaN(newQty)) {
            const reason = prompt('Mandatory business reason for override (>= 5 chars):');
            if (reason && reason.trim().length >= 5) {
              const user = auth.getUser();
              try {
                await api.overrideRecommendation(id, newQty, reason, user ? user.email : 'manager@justenough.ai');
                alert(`Override applied to ${id} with immutable audit log.`);
                loadData();
              } catch (err) {
                alert('Override failed: ' + err.message);
              }
            } else if (reason !== null) {
              alert('Validation Error: Override reason must be at least 5 characters.');
            }
          }
        });
      });
    } catch (err) {
      content.innerHTML = renderErrorState(err);
    }
  }
  loadData();
}
