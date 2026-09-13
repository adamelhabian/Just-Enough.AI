import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Monitor & Waste');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const brief = await api.getMorningBrief();
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Perishable Inventory & Variance Monitoring</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Real-time tracking of consumption variance and spoilage hazards.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Monitor Item</th><th>Current Stock</th><th>Observed Risk Factor</th><th>Diagnostic Action</th></tr></thead>
              <tbody>
                ${brief.to_monitor.map(m => `
                  <tr>
                    <td><strong>${m.item_name}</strong></td>
                    <td>${m.current_stock} ${m.unit}</td>
                    <td><span class="badge badge-warning">${m.risk_factor}</span></td>
                    <td><button class="btn btn-secondary" style="font-size: 0.75rem;" onclick="alert('Logged diagnostic check for ${m.item_name}')">Verify Shelf Count</button></td>
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
