import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Inventory Counts');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const items = await api.getInventory();
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Stock Count & Physical Reconciliation</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Log actual physical ingredient counts to update on-hand levels.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Ingredient Name</th>
                  <th>Category</th>
                  <th>On-Hand Stock</th>
                  <th>Safety Threshold</th>
                  <th>Status</th>
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
                      <button class="btn btn-secondary" style="font-size: 0.75rem;" onclick="window.countItem('${item.id}', '${item.name}', ${item.current_stock}, '${item.unit}')">Update Count</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      window.countItem = async (id, name, currentStock, unit) => {
        const val = prompt(`Enter new physical count for ${name} (${unit}):`, currentStock);
        if (val !== null && !isNaN(val) && val.trim() !== '') {
          const reason = prompt('Enter count reconciliation reason:', 'Physical shelf count') || 'Routine count';
          const user = auth.getUser() || { email: 'manager@justenough.ai' };
          await api.adjustInventory(id, Number(val), reason, user.email);
          alert(`Updated ${name} to ${val} ${unit}`);
          loadData();
        }
      };
    } catch (err) {
      content.innerHTML = `<div class="card" style="color: var(--danger);">Error: ${err.message}</div>`;
    }
  }
  loadData();
}
