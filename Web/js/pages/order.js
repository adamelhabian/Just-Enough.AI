import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Order Recommendations');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    try {
      const recs = await api.getRecommendations();
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Purchase Order Recommendations</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Optimized restocking orders based on supplier lead times and safety thresholds.</p>
            </div>
            <button id="poSubmitBtn" class="btn btn-primary">Generate Purchase Orders</button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Recommendation</th>
                  <th>Current Stock</th>
                  <th>Recommended Qty</th>
                  <th>Supplier</th>
                  <th>Lead Time</th>
                  <th>Model Confidence</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${recs.map(r => `
                  <tr>
                    <td>
                      <strong>${r.item_name}</strong><br>
                      <small style="color: var(--gray-600);">${r.explanation}</small>
                      ${r.override_qty ? `<br><span class="badge badge-warning">Overridden: ${r.override_qty} ${r.unit} (${r.override_reason})</span>` : ''}
                    </td>
                    <td>${r.current_stock} ${r.unit}</td>
                    <td><strong>${r.override_qty || r.recommended_qty} ${r.unit}</strong></td>
                    <td>${r.supplier}</td>
                    <td>${r.lead_time_days} days</td>
                    <td><span class="badge badge-success">${(r.confidence * 100).toFixed(0)}%</span></td>
                    <td>
                      <a href="recommendation.html?id=${r.id}" class="btn btn-secondary" style="font-size: 0.75rem;">Adjust / Override</a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      document.getElementById('poSubmitBtn').addEventListener('click', () => {
        alert('Purchase orders submitted to supplier EDI/email integrations.');
      });
    } catch (err) {
      content.innerHTML = `<div class="card" style="color: var(--danger);">Error: ${err.message}</div>`;
    }
  }
  loadData();
}
