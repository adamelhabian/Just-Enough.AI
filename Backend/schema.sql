create extension if not exists pgcrypto;
-- Apply to every tenant-scoped table after migrations. Example:
alter table forecasts enable row level security;
drop policy if exists tenant_isolation_forecasts on forecasts;
create policy tenant_isolation_forecasts on forecasts using (tenant_id = current_setting('app.tenant_id', true));
alter table recommendations enable row level security;
drop policy if exists tenant_isolation_recommendations on recommendations;
create policy tenant_isolation_recommendations on recommendations using (tenant_id = current_setting('app.tenant_id', true));
alter table overrides enable row level security;
drop policy if exists tenant_isolation_overrides on overrides;
create policy tenant_isolation_overrides on overrides using (tenant_id = current_setting('app.tenant_id', true));
alter table inventory_snapshots enable row level security;
drop policy if exists tenant_isolation_inventory on inventory_snapshots;
create policy tenant_isolation_inventory on inventory_snapshots using (tenant_id = current_setting('app.tenant_id', true));
