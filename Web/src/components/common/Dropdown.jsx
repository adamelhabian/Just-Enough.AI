import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './common.css';

export const Dropdown = ({ triggerLabel, items = [], onSelect, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`dropdown-container ${className}`} ref={ref} style={{ position: 'relative', inlineSize: 'fit-content' }}>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => setOpen(!open)}
        style={{ gap: '0.4rem' }}
      >
        <span>{triggerLabel}</span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.35rem',
            backgroundColor: '#FFF',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 100,
            minWidth: '160px',
            padding: '0.35rem 0'
          }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelect && onSelect(item);
                setOpen(false);
              }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                color: 'var(--text-main)',
                transition: '0.15s'
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--cream-light)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              {typeof item === 'object' ? item.label : item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
