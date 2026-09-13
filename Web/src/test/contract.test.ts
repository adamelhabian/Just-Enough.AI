import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api, setDataMode, setAuthToken, getAuthToken } from '../api/client';

describe('JustEnough Web MVP Contract & Operational Lifecycle', () => {
  beforeEach(() => {
    setDataMode('DEMO');
    setAuthToken(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Authentication
  describe('Authentication Lifecycle', () => {
    it('authenticates manager successfully and issues token', async () => {
      const res = await api.login('manager@justenough.ai', 'password123');
      expect(res.access_token).toBeDefined();
      expect(res.role).toBe('manager');
      expect(res.tenant_id).toBe('tenant_demo_1');
      expect(getAuthToken()).toBe(res.access_token);
    });

    it('authenticates employee successfully with employee role', async () => {
      const res = await api.login('employee@justenough.ai', 'password123');
      expect(res.access_token).toBeDefined();
      expect(res.role).toBe('employee');
      expect(getAuthToken()).toBe(res.access_token);
    });

    it('logs out and revokes stored auth token', async () => {
      await api.login('manager@justenough.ai', 'password123');
      expect(getAuthToken()).toBeTruthy();
      await api.logout();
      expect(getAuthToken()).toBeNull();
    });
  });

  // 2. Operational Views & Contracts
  describe('Operational Views Contract', () => {
    it('delivers complete Morning Brief with 4 key categories and KPIs', async () => {
      const brief = await api.getMorningBrief();
      expect(brief.date).toBeDefined();
      expect(brief.branch_name).toContain('Branch');
      expect(brief.kpis.stock_health_pct).toBeGreaterThan(0);
      expect(brief.to_prepare.length).toBeGreaterThan(0);
      expect(brief.to_order.length).toBeGreaterThan(0);
      expect(brief.to_monitor.length).toBeGreaterThan(0);
      expect(brief.alerts.length).toBeGreaterThan(0);
    });

    it('fetches inventory items with category and status classification', async () => {
      const items = await api.getInventory();
      expect(items.length).toBeGreaterThanOrEqual(5);
      const critical = items.find(i => i.status === 'CRITICAL');
      expect(critical).toBeDefined();
      expect(critical?.safety_stock).toBeGreaterThan(0);
    });

    it('fetches active alerts with urgency and actionable recommendations', async () => {
      const alerts = await api.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      alerts.forEach(a => {
        expect(['CRITICAL', 'WARNING', 'INFO']).toContain(a.severity);
        expect(a.suggested_action.length).toBeGreaterThan(10);
      });
    });

    it('fetches prep tasks within morning brief with priority and recipes', async () => {
      const brief = await api.getMorningBrief();
      expect(brief.to_prepare.length).toBeGreaterThan(0);
      expect(brief.to_prepare[0].recipe_summary).toBeDefined();
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(brief.to_prepare[0].priority);
    });

    it('fetches audit logs with timestamp and user email', async () => {
      const logs = await api.getAuditLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].user_email).toContain('@');
    });
  });

  // 3. Mutation & Override Integrity
  describe('Mutation & Override Safety', () => {
    it('enforces mandatory override reason of at least 5 characters', async () => {
      await expect(
        api.overrideRecommendation('REC-2026-001', 200, 'bad', 'mgr@test.com')
      ).rejects.toThrow('Mandatory override reason must be at least 5 characters long.');
    });

    it('accepts valid recommendation override and persists adjusted quantity', async () => {
      await api.overrideRecommendation(
        'REC-2026-001',
        220,
        'Expected large catering booking for weekend dinner rush',
        'mgr@test.com'
      );
      
      const recs = await api.getRecommendations();
      const updated = recs.find(r => r.id === 'REC-2026-001');
      expect(updated?.status).toBe('OVERRIDDEN');
      expect(updated?.override_qty).toBe(220);
      expect(updated?.override_reason).toContain('catering booking');

      // Verify in audit log
      const logs = await api.getAuditLogs();
      const overrideLog = logs.find(l => l.target_id === 'REC-2026-001');
      expect(overrideLog).toBeDefined();
      expect(overrideLog?.action_type).toBe('RECOMMENDATION_OVERRIDE');
    });

    it('records physical inventory count and updates current stock', async () => {
      await api.recordInventoryCount('ING-02', 150, 'clerk@test.com');
      const items = await api.getInventory();
      const buns = items.find(i => i.id === 'ING-02');
      expect(buns?.current_stock).toBe(150);

      const logs = await api.getAuditLogs();
      const countLog = logs.find(l => l.target_id === 'ING-02' && l.action_type === 'INVENTORY_COUNT');
      expect(countLog).toBeDefined();
    });
  });

  // 4. LIVE Mode Network & Error Contracts (Zero Silent Fallback)
  describe('LIVE Mode Network & Error Contracts', () => {
    beforeEach(() => {
      setDataMode('LIVE');
    });

    it('handles 401 Unauthorized by clearing token and throwing UNAUTHORIZED', async () => {
      setAuthToken('expired_or_invalid_jwt');
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Could not validate credentials'
      }));

      await expect(api.getInventory()).rejects.toThrow('UNAUTHORIZED');
      expect(getAuthToken()).toBeNull();
    });

    it('handles 403 Forbidden without crashing or falling back to demo', async () => {
      setAuthToken('valid_jwt_insufficient_perms');
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'User does not have permission to perform this action'
      }));

      await expect(api.overrideRecommendation('REC-1', 100, 'Valid reason', 'emp@test.com'))
        .rejects.toThrow('API Error [403]');
    });

    it('handles 500 Internal Server Error transparently', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Database connection pool exhausted'
      }));

      await expect(api.checkHealth()).rejects.toThrow('API Error [500]');
    });

    it('handles total network / offline failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch (Network Offline)')));
      await expect(api.checkHealth()).rejects.toThrow('Failed to fetch (Network Offline)');
    });
  });

  // 5. End-to-End Operational Lifecycle Loops
  describe('Full Operational E2E Loops', () => {
    it('E2E Loop 1: Login -> Morning Brief -> Order Recommendation -> Override -> Audit Trail', async () => {
      setDataMode('DEMO');

      // Step 1: Login
      const auth = await api.login('manager@justenough.ai', 'admin123');
      expect(auth.access_token).toBeDefined();

      // Step 2: Morning Brief
      const brief = await api.getMorningBrief();
      expect(brief.to_order.length).toBeGreaterThan(0);
      const targetRec = brief.to_order[0];

      // Step 3: Inspect Recommendation Detail
      const recs = await api.getRecommendations();
      const rec = recs.find(r => r.id === targetRec.id);
      expect(rec).toBeDefined();

      // Step 4: Override Recommendation
      const overrideQty = targetRec.recommended_order_qty + 50;
      await api.overrideRecommendation(
        targetRec.id,
        overrideQty,
        'Anticipating unexpected surge due to local downtown football match',
        'manager@justenough.ai'
      );

      // Verify Recommendation State
      const updatedRecs = await api.getRecommendations();
      const updated = updatedRecs.find(r => r.id === targetRec.id);
      expect(updated?.override_qty).toBe(overrideQty);

      // Step 5: Verify Audit Log
      const audit = await api.getAuditLogs();
      const logged = audit.find(a => a.target_id === targetRec.id);
      expect(logged).toBeDefined();
      expect(logged?.user_email).toBe('manager@justenough.ai');
      expect(logged?.reason).toContain('football match');
    });

    it('E2E Loop 2: Login -> Inventory -> Cycle Count Mutation -> Persistence & Audit', async () => {
      setDataMode('DEMO');

      // Step 1: Login
      const auth = await api.login('clerk@justenough.ai', 'password');
      expect(auth.access_token).toBeDefined();

      // Step 2: Load Inventory
      const invBefore = await api.getInventory();
      const targetItem = invBefore[0];
      const newStock = targetItem.current_stock + 15;

      // Step 3: Record physical count mutation
      await api.recordInventoryCount(targetItem.id, newStock, 'clerk@justenough.ai');

      // Step 4: Verify Persistence
      const invAfter = await api.getInventory();
      const updatedItem = invAfter.find(i => i.id === targetItem.id);
      expect(updatedItem?.current_stock).toBe(newStock);

      // Step 5: Verify Audit Trail
      const audit = await api.getAuditLogs();
      const countAudit = audit.find(a => a.target_id === targetItem.id && a.action_type === 'INVENTORY_COUNT');
      expect(countAudit).toBeDefined();
      expect(countAudit?.new_value).toContain(String(newStock));
    });
  });
});
