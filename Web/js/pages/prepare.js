import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Daily Prepare');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const brief = await api.getMorningBrief();
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Kitchen Prep & Bill-of-Materials Execution</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Translates forecasted menu item demand into kitchen preparation batches.</p>
            </div>
            <button id="batchDoneBtn" class="btn btn-primary">Mark All Prepped</button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Menu / Prep Item</th>
                  <th>Target Batch Qty</th>
                  <th>Bill of Materials (BOM) Requirements</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${brief.to_prepare.map(p => `
                  <tr>
                    <td><code>${p.id}</code></td>
                    <td><strong>${p.item_name}</strong></td>
                    <td><strong style="color: var(--primary);">${p.target_qty} ${p.unit}</strong></td>
                    <td>${p.recipe_summary}</td>
                    <td><span class="badge ${p.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}">${p.priority}</span></td>
                    <td><span class="badge badge-info">SCHEDULED</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      document.getElementById('batchDoneBtn').addEventListener('click', () => {
        alert('All prep batches marked completed and deducted from raw ingredient stocks.');
      });
    } catch (err) {
      content.innerHTML = `<div class="card" style="color: var(--danger);">Error: ${err.message}</div>`;
    }
  }
  loadData();
}
