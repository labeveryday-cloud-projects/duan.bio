import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, QrCode, Pencil, Trash2, Check, Download, MousePointerClick } from 'lucide-react';

export default function LinkCard({ link, onEdit, onDelete }) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);
  const shortUrl = `duan.bio/${link.shortCode}`;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(`https://${shortUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${link.shortCode}-qr.png`;
    a.click();
  };

  return (
    <div className="glass" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{link.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <code style={{
              fontSize: '0.85rem',
              color: 'var(--accent)',
              background: 'rgba(15, 252, 190, 0.1)',
              padding: '0.2rem 0.5rem',
              borderRadius: 6,
            }}>
              {shortUrl}
            </code>
            <button onClick={copyUrl} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}>
              {copied ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
          <MousePointerClick size={16} />
          <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>
            {link.clicks}
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {link.targetUrl}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setShowQR(!showQR)} className="btn btn-ghost btn-sm">
          <QrCode size={14} />
          QR
        </button>
        <button onClick={() => onEdit(link)} className="btn btn-ghost btn-sm">
          <Pencil size={14} />
          Edit
        </button>
        <button onClick={() => onDelete(link.shortCode)} className="btn btn-danger btn-sm">
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      {showQR && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div ref={qrRef} style={{ background: '#fff', padding: 12, borderRadius: 12 }}>
            <QRCodeCanvas value={`https://${shortUrl}`} size={160} />
          </div>
          <button onClick={downloadQR} className="btn btn-ghost btn-sm">
            <Download size={14} />
            Download QR
          </button>
        </div>
      )}
    </div>
  );
}
