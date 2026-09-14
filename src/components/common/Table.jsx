import React from 'react';
import './common.css';

export const Table = ({ columns = [], data = [], keyField = 'id', className = '' }) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="table-custom">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.accessor} style={{ textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[keyField]}>
                {columns.map((col) => (
                  <td key={col.key || col.accessor} style={{ textAlign: col.align || 'left' }}>
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
