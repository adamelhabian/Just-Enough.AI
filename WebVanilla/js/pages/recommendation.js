import { auth } from '../auth.js';
import { api } from '../api.js';
import { renderLayout, bindCommonEvents } from '../ui.js';

if (auth.requireAuth()) {
  document.getElementById('appRoot').innerHTML = renderLayout('Recommendation Detail');
  bindCommonEvents();

  async function loadData() {
    const content = document.getElementById('pageContent');
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('id') || 'REC-2026-001';

    try {
      const recs = await api.getRecommendations();
      const rec = recs.find(r => r.id === targetId) || recs[0];

      content.innerHTML = `
        <div class="card" style="max-width: 800px;">
          <div class="card-header">
            <div>
              <h2 class="card-title">Recommendation Explainability: ${rec.item_name}</h2>
              <p style="font-size: 0.875rem; color: var(--gray-600);">Model Reference: <code>${rec.id}</code></p>
            </div>
            <span class="badge badge-info">${rec.status}</span>
          </div>

          <div style="background: var(--gray-50); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
            <p><strong>Decision Intelligence Logic:</strong></p>
            <p style="margin-top: 4px; color: var(--gray-700);">${rec.explanation}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div><strong>Current Stock:</strong> ${rec.current_stock} ${rec.unit}</div>
            <div><strong>Recommended Order:</strong> ${rec.recommended_qty} ${rec.unit}</div>
            <div><strong>Supplier:</strong> ${rec.supplier}</div>
            <div><strong>Lead Time:</strong> ${rec.lead_time_days} business day(s)</div>
          </div>

          <hr style="border: 0; border-top: 1px solid var(--gray-200); margin: 20px 0;">

          <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px;">Audited Manager Override</h3>
          <form id="overrideForm">
            <div class="form-group">
              <label class="form-label" for="newQty">Adjusted Quantity (${rec.unit})</label>
              <input type="number" id="newQty" class="form-control" value="${rec.override_qty || rec.recommended_qty}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="reason">Mandatory Business Reason (min 5 chars)</label>
              <textarea id="reason" class="form-control" rows="3" placeholder="e.g. Expected large catering reservation for dinner rush..." required>${rec.override_reason || ''}</textarea>
              <small class="form-text">Every adjustment is immutably recorded in the corporate audit trail.</small>
            </div>
            <div style="display: flex; gap: 12px;">
              <button type="submit" class="btn btn-primary">Save & Audit Override</button>
              <a href="order.html" class="btn btn-secondary">Back to Orders</a>
            </div>
          </form>
        </div>
      `;

      document.getElementById('overrideForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const qty = document.getElementById('newQty').value;
        const reason = document.getElementById('reason').value;
        const user = auth.getUser() || { email: 'manager@justenough.ai' };

        try {
          await api.overrideRecommendation(rec.id, qty, reason, user.email);
          alert('Override successfully saved and logged to audit trail!');
          window.location.href = 'order.html';
        } catch (err) {
          alert('Validation Error: ' + err.message);
        }
      });
    } catch (err) {
      content.innerHTML = `<div class="card" style="color: var(--danger);">Error: ${err.message}</div>`;
    }
  }
  loadData();
}
