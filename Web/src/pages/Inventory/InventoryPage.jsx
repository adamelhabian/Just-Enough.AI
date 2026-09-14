import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import KpiCard from '../../components/common/KpiCard';
import Search from '../../components/common/Search';
import Filter from '../../components/common/Filter';
import DatePicker from '../../components/common/DatePicker';
import InventoryTable from '../../components/inventory/InventoryTable';
import InventoryAlerts from '../../components/inventory/InventoryAlerts';
import InventoryUsageChart from '../../components/inventory/InventoryUsageChart';
import InventoryImpactFlow from '../../components/inventory/InventoryImpactFlow';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import { fetchInventoryItems, fetchInventoryKPIs, fetchInventoryAlerts } from '../../api/inventory';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';

export const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedDate, setSelectedDate] = useState('2026-09-14');

  // Modal State
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [reorderQty, setReorderQty] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [itemsData, kpiData, alertsData] = await Promise.all([
          fetchInventoryItems(),
          fetchInventoryKPIs(),
          fetchInventoryAlerts()
        ]);
        setItems(itemsData);
        setKpis(kpiData);
        setAlerts(alertsData);
      } catch (err) {
        console.error('Failed to load inventory data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All Categories' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All Statuses' || item.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const categories = ['All Categories', 'Poultry & Meat', 'Dairy', 'Produce', 'Dry Bakery', 'Beverage'];
  const statuses = ['All Statuses', 'Healthy', 'Low Stock', 'Overstock', 'Critical'];

  const handleOpenOrderModal = (item) => {
    setActiveModalItem(item);
    setReorderQty(item.requiredStock ? `${Math.ceil(item.requiredStock * 1.2)}` : '10');
    setOrderSuccess(false);
  };

  const handleConfirmOrder = () => {
    setOrderSuccess(true);
    setTimeout(() => {
      setActiveModalItem(null);
      setOrderSuccess(false);
    }, 1500);
  };

  return (
    <DashboardLayout
      title="Inventory Intelligence"
      subtitle="Know what you have, what you need, and what you might waste."
    >
      {loading ? (
        <LoadingState message="Connecting to AI Demand Engine..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* KPI Cards Grid */}
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.id}
                title={kpi.title}
                value={kpi.value}
                unit={kpi.unit}
                change={kpi.change}
                trend={kpi.trend}
                iconName={kpi.icon}
              />
            ))}
          </div>

          {/* AI Recommendation Alerts */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.85rem' }}>AI Intelligent Recommendations</h3>
            <InventoryAlerts alerts={alerts} onAlertAction={(alert) => handleOpenOrderModal({ name: alert.title, requiredStock: 15, unit: 'kg' })} />
          </div>

          {/* Controls Bar: Search, Filter, Date */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              backgroundColor: '#FFFFFF',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Search value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Filter label="" options={categories} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} />
              <Filter label="" options={statuses} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
              <DatePicker label="" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>

          {/* Inventory Table */}
          {filteredItems.length === 0 ? (
            <EmptyState
              title="No ingredients matched"
              description="Try clearing your search query or changing category/status filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setCategoryFilter('All Categories');
                setStatusFilter('All Statuses');
              }}
            />
          ) : (
            <InventoryTable items={filteredItems} onReorderClick={handleOpenOrderModal} />
          )}

          {/* Usage Chart Section */}
          <InventoryUsageChart />

          {/* Visual Impact Flow Section */}
          <InventoryImpactFlow />
        </div>
      )}

      {/* Order Review Modal */}
      <Modal
        isOpen={!!activeModalItem}
        onClose={() => setActiveModalItem(null)}
        title={orderSuccess ? 'Purchase Order Placed!' : `Order Supplier Review: ${activeModalItem?.name}`}
      >
        {orderSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle2 size={48} color="var(--emerald)" />
            <h4>Order Recommendation Recorded</h4>
            <p style={{ color: 'var(--text-muted)' }}>Order recommendation confirmed. Procurement recommendation prepared for purchasing review.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Adjust order quantity based on AI projected Saturday lunch rush demand (+18% surge).
            </p>

            <Input
              label={`Order Quantity (${activeModalItem?.unit || 'kg'})`}
              type="number"
              value={reorderQty}
              onChange={(e) => setReorderQty(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <span>Supplier: <strong>{activeModalItem?.supplier || 'Heritage Wholesale'}</strong></span>
              <span>Unit Price: <strong>{activeModalItem?.costPerUnit || '$8.50'}</strong></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="ghost" onClick={() => setActiveModalItem(null)}>Cancel</Button>
              <Button variant="primary" icon={ShoppingBag} onClick={handleConfirmOrder}>Confirm Order Recommendation</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default InventoryPage;
