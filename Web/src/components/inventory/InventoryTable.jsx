import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './inventory.css';

export const InventoryTable = ({ items = [], onReorderClick }) => {
  const columns = [
    {
      header: 'Ingredient',
      accessor: 'name',
      cell: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{row.name}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{row.category} • Supplier: {row.supplier}</span>
        </div>
      )
    },
    {
      header: 'Current Stock',
      accessor: 'currentStock',
      cell: (row) => (
        <span style={{ fontWeight: 700 }}>
          {row.currentStock} {row.unit}
        </span>
      )
    },
    {
      header: 'Required (Demand)',
      accessor: 'requiredStock',
      cell: (row) => (
        <span style={{ color: 'var(--text-muted)' }}>
          {row.requiredStock} {row.unit}
        </span>
      )
    },
    {
      header: 'Difference',
      accessor: 'difference',
      cell: (row) => {
        const isNegative = row.difference.startsWith('-');
        return (
          <span
            style={{
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              color: isNegative ? 'var(--terracotta)' : 'var(--emerald)'
            }}
          >
            {isNegative ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
            {row.difference}
          </span>
        );
      }
    },
    {
      header: 'Days Coverage',
      accessor: 'coverageDays',
      cell: (row) => (
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {row.coverageDays} days
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge status={row.status} />
    },
    {
      header: 'Action',
      accessor: 'actions',
      align: 'right',
      cell: (row) => (
        <Button
          variant={row.status === 'Low Stock' || row.status === 'Critical' ? 'primary' : 'outline'}
          size="sm"
          icon={ShoppingBag}
          onClick={() => onReorderClick && onReorderClick(row)}
        >
          {row.status === 'Low Stock' || row.status === 'Critical' ? 'Order' : 'Review'}
        </Button>
      )
    }
  ];

  return (
    <div className="inventory-table-wrapper">
      {/* Desktop Table View */}
      <Table columns={columns} data={items} keyField="id" className="desktop-only" />

      {/* Mobile Card List Fallback */}
      <div className="inventory-mobile-cards mobile-only">
        {items.map((row) => (
          <div key={row.id} className="inv-mobile-card">
            <div className="inv-card-header">
              <div>
                <strong>{row.name}</strong>
                <span className="inv-cat">{row.category}</span>
              </div>
              <Badge status={row.status} />
            </div>

            <div className="inv-card-grid">
              <div>
                <span className="lbl">Current Stock</span>
                <span className="val">{row.currentStock} {row.unit}</span>
              </div>
              <div>
                <span className="lbl">Required Demand</span>
                <span className="val">{row.requiredStock} {row.unit}</span>
              </div>
              <div>
                <span className="lbl">Difference</span>
                <span className="val" style={{ color: row.difference.startsWith('-') ? 'var(--terracotta)' : 'var(--emerald)' }}>
                  {row.difference}
                </span>
              </div>
              <div>
                <span className="lbl">Coverage</span>
                <span className="val">{row.coverageDays} days</span>
              </div>
            </div>

            <Button
              variant={row.status === 'Low Stock' || row.status === 'Critical' ? 'primary' : 'outline'}
              size="sm"
              fullWidth
              icon={ShoppingBag}
              onClick={() => onReorderClick && onReorderClick(row)}
            >
              {row.status === 'Low Stock' || row.status === 'Critical' ? 'Order Ingredient' : 'Review Stock'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryTable;
