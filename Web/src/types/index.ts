export type UserRole = 'manager' | 'employee' | 'admin';
export type DataMode = 'LIVE' | 'DEMO';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  tenant_id: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  tenant_id: string;
  user_id: string;
  full_name: string;
}

export interface OperationalAlert {
  id: string;
  branch_id: string;
  ingredient_id: string;
  ingredient_name: string;
  alert_type: 'SHORTAGE' | 'EXPIRY' | 'WASTE_SPIKE' | 'OVERSTOCK';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  suggested_action: string;
  created_at: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
}

export interface Recommendation {
  id: string;
  date: string;
  ingredient_id: string;
  ingredient_name: string;
  recommended_order_qty: number;
  unit: string;
  pack_size: number;
  safety_stock: number;
  predicted_demand: number;
  current_inventory: number;
  status: 'PENDING' | 'ACCEPTED' | 'OVERRIDDEN' | 'REJECTED';
  override_qty?: number | null;
  override_reason?: string | null;
  supplier_name?: string;
  confidence_score: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_factor: 'SHORTAGE' | 'WASTE' | 'NORMAL';
}

export interface PrepTask {
  id: string;
  product_name: string;
  batch_quantity: number;
  unit: string;
  completion_deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recipe_summary: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  safety_stock: number;
  reorder_point: number;
  cost_per_unit: number;
  last_counted: string;
  status: 'NORMAL' | 'LOW' | 'CRITICAL' | 'SURPLUS';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_email: string;
  user_role: string;
  action_type: 'RECOMMENDATION_OVERRIDE' | 'RECOMMENDATION_ACCEPT' | 'INVENTORY_COUNT' | 'STOCK_ADJUSTMENT' | 'ALERT_RESOLVED';
  target_id: string;
  previous_value: string;
  new_value: string;
  reason: string;
}

export interface MorningBriefSummary {
  date: string;
  branch_name: string;
  kpis: {
    shortage_risks: number;
    waste_risks: number;
    stock_health_pct: number;
    forecasted_covers: number;
  };
  to_prepare: PrepTask[];
  to_order: Recommendation[];
  to_monitor: InventoryItem[];
  alerts: OperationalAlert[];
}
