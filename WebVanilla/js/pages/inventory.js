import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, renderErrorState, renderCachedDataBanner, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Inventory Counts');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const invRes = await api.getInventory();
      const items = invRes.items || invRes;
      const cachedBanner = invRes._dataSource === 'CACHED_REAL_DATA' ? renderCachedDataBanner(invRes._cachedAt) : '';
      const demoTag = invRes._dataSource === 'DEMO_SYNTHETIC' ? ' <span class="badge" style="background:#f59e0b; color:#fff; font-size:0.7rem;">DEMO / SYNTHETIC</span>' : '';

      content.innerHTML = `
        ${cachedBanner}
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Physical Cycle Counting & Stock Reconciliation${demoTag}</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Real-time inventory levels, safety thresholds, and audited adjustments.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Ingredient / Item</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Safety Stock</th>
                  <th>Health Status</th>
                  <th>Last Counted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td><code>${item.id}</code></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.category}</td>
                    <td><strong>${item.current_stock} ${item.unit}</strong></td>
                    <td>${item.safety_stock} ${item.unit}</td>
                    <td><span class="badge ${item.status === 'CRITICAL' ? 'badge-danger' : (item.status === 'WARNING' ? 'badge-warning' : 'badge-success')}">${item.status}</span></td>
                    <td><small>${item.last_counted}</small></td>
                    <td>
                      <button class="btn btn-secondary count-btn" data-id="${item.id}" data-name="${item.name}" data-unit="${item.unit}" style="font-size: 0.75rem; padding: 4px 8px;">Reconcile</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const name = e.target.dataset.name;
          const unit = e.target.dataset.unit;
          const newCount = prompt(`Enter physical count for ${name} (${unit}):`);
          if (newCount !== null && !isNaN(newCount)) {
            const reason = prompt('Mandatory reason for adjustment (e.g., Weekly cycle count):', 'Physical cycle count');
            if (reason) {
              const user = auth.getUser();
              try {
                await api.adjustInventory(id, newCount, reason, user ? user.email : 'manager@justenough.ai');
                alert(`Successfully adjusted ${name} to ${newCount} ${unit}.`);
                loadData();
              } catch (err) {
                alert('Adjustment failed: ' + err.message);
              }
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
