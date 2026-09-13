import { describe, it, expect, beforeEach } from 'vitest';
import { api, setDataMode } from '../api/client';

describe('JustEnough Web Client Engine', () => {
  beforeEach(() => {
    setDataMode('DEMO');
  });

  it('loads health status correctly in DEMO mode', async () => {
    const health = await api.checkHealth();
    expect(health.status).toBe('ok');
    expect(health.version).toContain('demo');
  });

  it('provides Morning Brief with all 4 operational categories', async () => {
    const brief = await api.getMorningBrief();
    expect(brief.to_prepare.length).toBeGreaterThan(0);
    expect(brief.to_order.length).toBeGreaterThan(0);
    expect(brief.to_monitor.length).toBeGreaterThan(0);
    expect(brief.alerts.length).toBeGreaterThan(0);
  });

  it('enforces mandatory override reason for recommendation adjustments', async () => {
    await expect(
      api.overrideRecommendation('REC-2026-001', 200, '', 'manager@justenough.ai')
    ).rejects.toThrow('Mandatory override reason must be at least 5 characters long.');
  });

  it('records physical inventory count accurately in store', async () => {
    await api.recordInventoryCount('ING-01', 40, 'inventory@justenough.ai');
    const items = await api.getInventory();
    const item = items.find(i => i.id === 'ING-01');
    expect(item?.current_stock).toBe(40);
  });
});
