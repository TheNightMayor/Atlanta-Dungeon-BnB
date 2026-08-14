import React, { useEffect, useState } from 'react';
import { useClient, PatchEvent, set } from 'sanity';
import AMENITY_ICON_MAP from './amenityIconMap';
import ICONS from './iconList';
import IconGridPicker from './IconGridPicker';
import { FaPlus, FaTrash } from 'react-icons/fa';

type OptionItem = { title: string; value: string; icon?: string; _id?: string };

const OfferedAmenitiesPicker: React.FC<any> = ({ value = [], onChange }: any) => {
  // value is an array of references like [{ _ref: 'amenityId' }, ...]
  const refs: any[] = Array.isArray(value) ? value : [];
  const selectedSet = new Set(refs.map(r => String(r && r._ref ? r._ref : r)));

  const client = useClient();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState<string | null>(null);
  const [remoteOptions, setRemoteOptions] = useState<Array<{ _id: string; title: string; icon?: string }>>([]);

  // Operate exclusively from central `amenity` documents in Sanity.

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const docs: any[] = await client.fetch('*[_type == "amenity"]{_id, title, icon}');
        if (!mounted) return;
        const enabled = (docs || []).map(d => ({ _id: d._id, title: d.title, icon: d.icon ?? undefined }));
        setRemoteOptions(enabled);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false };
  }, [client]);

  const removeOption = async (amenityIdOrTitle: string) => {
    // remove reference from this document
    const next = refs.filter(r => String(r && r._ref ? r._ref : r) !== amenityIdOrTitle);
    emit(next);

    // find remote doc by id or title
    try {
      const found = remoteOptions.find(r => r._id === amenityIdOrTitle || r.title === amenityIdOrTitle) || null;
      if (found && found._id) {
        // delete the amenity document (and its draft if present) and remove references from all hotelRoom docs
        try {
          await client.delete(found._id);
        } catch (err) {
          // ignore
        }
        try {
          await client.delete(`drafts.${found._id}`);
        } catch (err) {
          // ignore
        }
        // remove references from all hotelRoom docs
        try {
          const docs = await client.fetch('*[_type == "hotelRoom" && defined(offeredAmenities) && $id in offeredAmenities[]->_ref]{_id, offeredAmenities}', { id: found._id });
          if (Array.isArray(docs)) {
            for (const d of docs) {
              const before = Array.isArray(d.offeredAmenities) ? d.offeredAmenities : [];
              const after = before.filter((it: any) => String(it && (it._ref || it)) !== found._id);
              if (after.length !== before.length) {
                try { await client.patch(d._id).set({ offeredAmenities: after }).commit({ autoGenerateArrayKeys: true }); } catch (err) { }
                try { const draftId = d._id.startsWith('drafts.') ? d._id : `drafts.${d._id}`; await client.patch(draftId).set({ offeredAmenities: after }).commit({ autoGenerateArrayKeys: true }); } catch (err) { }
              }
            }
          }
        } catch (err) {
          // ignore
        }
        // refresh local options
        setRemoteOptions(prev => prev.filter(r => r._id !== found._id));
      }
    } catch (err) {
      // ignore
    }
  };

  const emit = (nextRefs: any[]) => {
    onChange(PatchEvent.from(set(nextRefs)));
  };

      const toggleAmenity = (amenityValue: string) => {
    const amenityKey = String(amenityValue);
    const existing = remoteOptions.find(r => r._id === amenityKey || r.title === amenityKey);
    if (existing && existing._id) {
      const id = existing._id;
      const exists = refs.some(r => String(r && r._ref ? r._ref : r) === id);
      if (exists) {
        const next = refs.filter(r => String(r && r._ref ? r._ref : r) !== id);
        emit(next);
      } else {
        const next = [...refs, { _ref: id }];
        emit(next);
      }
    } else {
      // create amenity doc then add reference
      (async () => {
        try {
          const key = amenityKey;
          const mapped = (AMENITY_ICON_MAP as Record<string, string>)[String(key).toLowerCase().replace(/\s+/g, '')];
          const doc = await client.create({ _type: 'amenity', title: key, icon: mapped || newIcon });
          const id = doc._id;
          setRemoteOptions(prev => [{ _id: id, title: doc.title, icon: doc.icon ?? undefined }, ...prev]);
          emit([...refs, { _ref: id }]);
        } catch (err) {
          // ignore
        }
      })();
    }
  };

    const saveNew = () => {
    if (!newTitle) return;
    (async () => {
      try {
        const doc = await client.create({ _type: 'amenity', title: newTitle, icon: newIcon });
        setRemoteOptions(prev => [{ _id: doc._id, title: doc.title, icon: doc.icon ?? undefined }, ...prev]);
        emit([...refs, { _ref: doc._id }]);
      } catch (err) {
        // ignore
      }
      // no transient custom options — the created doc is now authoritative
      setAdding(false);
      setNewTitle('');
      setNewIcon(null);
    })();
  };

  return (
    <div>
      <style>{`
        .odp-amenity-tile .odp-amenity-trash { opacity: 0; transition: opacity 120ms ease, color 120ms ease; color: rgba(239,68,68,0.85); }
        .odp-amenity-tile:hover .odp-amenity-trash { opacity: 1; color: rgba(239,68,68,0.6); }
        .odp-amenity-trash:hover { color: rgba(239,68,68,0.9); }
      `}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 8 }}>
        { remoteOptions.map(a => {
          const selected = selectedSet.has(a._id);
          const key = String(a.title).toLowerCase().replace(/\s+/g, '');
          // icon comes from doc.icon or mapping
          const iconValue = a.icon || (AMENITY_ICON_MAP as Record<string, string>)[key];
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

          const selectedStyle: React.CSSProperties = selected
            ? { boxShadow: '0 6px 14px rgba(14,165,233,0.18)', background: 'rgba(14,165,233,0.12)', border: '1px solid #0ea5e9' }
            : {};

          return (
            <div
              key={a._id}
              role="button"
              tabIndex={0}
              onClick={() => toggleAmenity(a._id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAmenity(a._id); } }}
              aria-pressed={selected}
              className="odp-amenity-tile"
              style={{ ...baseStyle, ...selectedStyle }}
            >
              {selected && (
                <div style={{ position: 'absolute', top: 6, right: 6, background: '#0ea5e9', color: '#fff', borderRadius: 9999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</div>
              )}
              <button type="button" onClick={(e) => { e.stopPropagation(); removeOption(a._id); }} className="odp-amenity-trash" style={{ position: 'absolute', top: 6, left: 6, background: 'transparent', border: 'none', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Remove option">
                <FaTrash style={{ width: 12, height: 12 }} />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: selected ? '#0ea5e9' : '#4b5563' }}>
                  {AmenityIcon ? <AmenityIcon /> : <span />}
                </div>
                <div style={{ marginTop: 4, fontSize: 10, textAlign: 'center', color: selected ? '#0ea5e9' : '#4b5563', paddingLeft: 6, paddingRight: 6, overflow: 'hidden', wordWrap: 'break-word', whiteSpace: 'normal' }}>{a.title}</div>
              </div>
            </div>
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
            <button type="button" onClick={() => { if (!newTitle) return; saveNew(); }} className="text-sm bg-sky-600 text-white px-3 py-1 rounded">Save</button>
            <button type="button" onClick={() => { setAdding(false); setNewTitle(''); setNewIcon(null); }} className="text-sm text-red-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferedAmenitiesPicker;
