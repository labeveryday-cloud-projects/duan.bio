import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Download, Check, Copy } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

export default function CreateLink() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const qrRef = useRef(null);

  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Name is required');
    if (!shortCode || !/^[a-zA-Z0-9-]+$/.test(shortCode)) return setError('Short code: alphanumeric and hyphens only');
    if (!targetUrl.startsWith('https://')) return setError('URL must start with https://');

    setSaving(true);
    try {
      const result = await apiRequest('/links', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), shortCode, targetUrl }),
      }, token);
      setCreated(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${created.shortCode}-qr.png`;
    a.click();
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(`https://duan.bio/${created.shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (created) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass" style={{ padding: '2rem', maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: 'rgba(15,252,190,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <Check size={24} color="var(--accent)" />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Link Created!</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.25rem' }}>{created.name}</p>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            marginBottom: '1.5rem',
          }}>
            <code style={{
              fontSize: '1rem', color: 'var(--accent)', background: 'rgba(15,252,190,0.1)',
              padding: '0.4rem 0.75rem', borderRadius: 8,
            }}>
              duan.bio/{created.shortCode}
            </code>
            <button onClick={copyUrl} className="btn btn-ghost btn-sm" style={{ padding: '0.35rem' }}>
              {copied ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
            </button>
          </div>

          <div ref={qrRef} style={{ background: '#fff', padding: 16, borderRadius: 12, display: 'inline-block', marginBottom: '1rem' }}>
            <QRCodeCanvas value={`https://duan.bio/${created.shortCode}`} size={200} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={downloadQR} className="btn btn-primary">
              <Download size={16} /> Download QR
            </button>
            <button onClick={() => navigate('/')} className="btn btn-ghost">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="glass" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.25rem' }}>Create Short Link</h2>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.35rem', display: 'block' }}>Link Name</label>
              <input className="input" placeholder="e.g. AWS re:Invent Talk" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.35rem', display: 'block' }}>Short Code</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <span style={{
                  padding: '0.75rem 0.75rem', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)', borderRight: 'none',
                  borderRadius: '10px 0 0 10px', fontSize: '0.95rem', opacity: 0.5,
                }}>duan.bio/</span>
                <input
                  className="input"
                  style={{ borderRadius: '0 10px 10px 0' }}
                  placeholder="my-link"
                  value={shortCode}
                  onChange={e => setShortCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.35rem', display: 'block' }}>Destination URL</label>
              <input className="input" placeholder="https://example.com/my-page" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} />
            </div>

            {shortCode && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.75rem' }}>QR Preview</p>
                <div style={{ background: '#fff', padding: 12, borderRadius: 12, display: 'inline-block' }}>
                  <QRCodeCanvas value={`https://duan.bio/${shortCode}`} size={120} />
                </div>
              </div>
            )}

            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
              {saving ? 'Creating...' : 'Create Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
