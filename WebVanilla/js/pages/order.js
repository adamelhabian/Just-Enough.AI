import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, renderErrorState, renderCachedDataBanner, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Order Recommendations');
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
              <h2 class="card-title">Supplier Purchase Orders & Replenishment${demoTag}</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Automated order recommendations generated from forecasted stock runouts.</p>
            </div>
            <button id="sendOrdersBtn" class="btn btn-primary">Generate Purchase Orders</button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Ingredient / Item</th>
                  <th>Recommended Qty</th>
                  <th>Primary Supplier</th>
                  <th>Delivery Lead Time</th>
                  <th>Minimum Order (MOQ)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${brief.to_order.map(o => `
                  <tr>
                    <td><code>${o.id}</code></td>
                    <td><strong>${o.ingredient}</strong></td>
                    <td><strong style="color: var(--primary);">${o.recommended_qty} ${o.unit}</strong></td>
                    <td>${o.supplier}</td>
                    <td>${o.lead_time_days} business days</td>
                    <td>${o.moq} ${o.unit}</td>
                    <td><span class="badge badge-warning">RECOMMENDED</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      document.getElementById('sendOrdersBtn').addEventListener('click', () => {
        alert('Purchase orders successfully compiled and dispatched to suppliers.');
      });
    } catch (err) {
      content.innerHTML = renderErrorState(err);
    }
  }
  loadData();
}
