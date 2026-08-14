import React from 'react';
import { PatchEvent, set } from 'sanity';
import ICONS, { ICONS as ICON_LIST } from './iconList';

type Props = {
  value?: string | null;
  onChange: (event: any) => void;
};

const IconGridPicker: React.FC<Props> = ({ value, onChange }) => {
  const handleSelect = (val: string) => {
    onChange(PatchEvent.from(set(val)));
  };

  

  return (
    <div>
      <div className="grid grid-cols-6 gap-2">
        {ICON_LIST.map(ic => {
          const Icon = ic.Icon;
          const selected = value === ic.value;
          const selectedStyle: React.CSSProperties = selected
            ? {
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6,182,212,0.08)',
                boxShadow: '0 0 0 4px rgba(6,182,212,0.12)'
              }
            : { borderColor: 'transparent' };

          const iconStyle: React.CSSProperties = selected
            ? { color: '#06b6d4', fontSize: '20px' }
            : { color: '#374151', fontSize: '20px' };

          return (
            <button
              key={ic.value}
              type="button"
              onClick={() => handleSelect(ic.value)}
              aria-pressed={selected}
              title={ic.label}
              style={{
                padding: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderStyle: 'solid',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                ...selectedStyle,
              }}
            >
              {selected && (
                <span style={{ position: 'absolute', top: 4, right: 4, background: '#06b6d4', color: '#fff', borderRadius: 9999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span>
              )}
              <Icon style={iconStyle} />
            </button>
          );
        })}
      </div>
      
    </div>
  );
};

export default IconGridPicker;
