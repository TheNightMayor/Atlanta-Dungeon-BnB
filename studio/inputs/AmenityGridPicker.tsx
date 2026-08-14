import React, { useEffect, useState } from 'react';
import { useClient, PatchEvent, set } from 'sanity';
import AMENITY_ICON_MAP from './amenityIconMap';
import IconGridPicker from './IconGridPicker';
import ICONS from './iconList';
import { FaPlus } from 'react-icons/fa';

type Props = {
  value?: string | null;
  onChange: (event: any) => void;
};

const AmenityGridPicker: React.FC<Props> = ({ value, onChange }) => {
  const client = useClient();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState<string | null>(null);
  const [remoteOptions, setRemoteOptions] = useState<Array<{ _id: string; title: string; icon?: string }>>([]);

  const handleSelect = (docId: string) => {
    const found = remoteOptions.find(r => r._id === docId);
    const val = found ? found.title : undefined;
    const icon = found ? found.icon : undefined;
    if (val && icon) {
      onChange(PatchEvent.from([set(val), set(icon, ['icon'])]));
    } else if (val) {
      onChange(PatchEvent.from([set(val)]));
    }
  };

  const saveNew = () => {
    if (!newTitle || !newIcon) return; // icon is required
    (async () => {
      try {
        const doc = await client.create({ _type: 'amenity', title: newTitle, icon: newIcon });
        setRemoteOptions(prev => [{ _id: doc._id, title: doc.title, icon: doc.icon ?? undefined }, ...prev]);
        onChange(PatchEvent.from([set(doc.title), set(doc.icon || '', ['icon'])]));
      } catch (err) {
        // ignore
      }
      setAdding(false);
      setNewTitle('');
      setNewIcon(null);
    })();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const docs: any[] = await client.fetch('*[_type == "amenity"]{_id, title, icon}');
        if (!mounted) return;
        setRemoteOptions((docs || []).map(d => ({ _id: d._id, title: d.title, icon: d.icon ?? undefined })));
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false };
  }, [client]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 8 }}>
        {remoteOptions.map(a => {
          const selected = value === a.title;
          const iconValue = a.icon || (AMENITY_ICON_MAP as Record<string, string>)[String(a.title).toLowerCase().replace(/\s+/g, '')];
          const found = ICONS.find((c: any) => c.value === iconValue);
          const AmenityIcon = found ? found.Icon : null;

          const baseStyle: React.CSSProperties = {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            aspectRatio: '1 / 1',
            padding: 6,
            borderRadius: 6,
            border: '1px solid #4b5563',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'transform 100ms ease, box-shadow 100ms ease',
            boxSizing: 'border-box' as const,
          };

          const labelColor = selected ? '#0ea5e9' : '#4b5563';

          const hoverStyle: React.CSSProperties = {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.04)'
          };

          const selectedStyle: React.CSSProperties = selected
            ? { boxShadow: '0 6px 14px rgba(14,165,233,0.18)', background: 'rgba(14,165,233,0.12)', border: '1px solid #0ea5e9' }
            : {};

          return (
            <button
              key={a._id}
              type="button"
              onClick={() => handleSelect(a._id)}
              aria-pressed={selected}
              aria-selected={selected}
              title={a.title}
              style={{ ...baseStyle, ...selectedStyle }}
            >
              {selected && (
                <div style={{ position: 'absolute', top: 6, right: 6, background: '#0ea5e9', color: '#fff', borderRadius: 9999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: selected ? '#0ea5e9' : '#4b5563' }}>
                  {AmenityIcon ? <AmenityIcon /> : <span />}
                </div>
                <div style={{ marginTop: 4, fontSize: 10, textAlign: 'center', color: labelColor, paddingLeft: 6, paddingRight: 6, overflow: 'hidden', wordWrap: 'break-word', whiteSpace: 'normal' }}>{a.title}</div>
              </div>
            </button>
          );
        })}
        {/* Add custom amenity tile */}
        <button
          type="button"
          onClick={() => setAdding(true)}
          title="Add custom amenity"
          aria-label="Add custom amenity"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            aspectRatio: '1 / 1',
            padding: 6,
            borderRadius: 6,
            border: '1px solid #f59e0b',
            background: 'rgba(245,158,11,0.06)',
            cursor: 'pointer',
            transition: 'transform 100ms ease, box-shadow 100ms ease',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#f59e0b', fontWeight: 600 }}>
              <FaPlus style={{ fontSize: 22, color: '#f59e0b' }} />
            </div>
            <div style={{ marginTop: 4, fontSize: 10, textAlign: 'center', color: '#f59e0b', paddingLeft: 6, paddingRight: 6 }}>Add</div>
          </div>
        </button>
      </div>

      <div className="mt-3">
        {/* Add tile sits visually with the grid; clicking opens the add form below */}
        {adding ? null : null}

        {adding && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Amenity title"
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
            />
            <div style={{ minWidth: 200 }}>
              <IconGridPicker value={newIcon || undefined} onChange={(ev: any) => {
                // IconGridPicker emits a PatchEvent.from(set(value)).
                // Extract the set value robustly.
                try {
                  if (ev && Array.isArray(ev.patches)) {
                    const setPatch = ev.patches.find((p: any) => p && p.type === 'set');
                    if (setPatch && typeof setPatch.value === 'string') {
                      setNewIcon(setPatch.value);
                      return;
                    }
                  }
                } catch (err) {
                  // ignore
                }
                if (typeof ev === 'string') setNewIcon(ev);
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button type="button" onClick={saveNew} className="text-sm bg-sky-600 text-white px-3 py-1 rounded">Save</button>
              <button type="button" onClick={() => { setAdding(false); setNewTitle(''); setNewIcon(null); }} className="text-sm text-red-600">Cancel</button>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default AmenityGridPicker;
