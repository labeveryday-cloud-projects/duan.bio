import { useState } from 'react';
import { X } from 'lucide-react';

export default function EditModal({ link, onSave, onClose }) {
  const [name, setName] = useState(link.name);
  const [targetUrl, setTargetUrl] = useState(link.targetUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return setError('Name is required');
    if (!targetUrl.startsWith('https://')) return setError('URL must start with https://');
    setSaving(true);
    setError('');
    try {
      await onSave(link.shortCode, { name: name.trim(), targetUrl });
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Edit Link</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.35rem', display: 'block' }}>Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.35rem', display: 'block' }}>Destination URL</label>
            <input className="input" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
