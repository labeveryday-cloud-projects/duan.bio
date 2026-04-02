import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Link2 } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../auth/AuthProvider';
import LinkCard from '../components/LinkCard';
import EditModal from '../components/EditModal';

export default function Dashboard() {
  const { token } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editLink, setEditLink] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadLinks(); }, []);

  async function loadLinks() {
    try {
      const data = await apiRequest('/links', {}, token);
      setLinks(data);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleEdit(shortCode, updates) {
    await apiRequest(`/links/${shortCode}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, token);
    showToast('Link updated');
    loadLinks();
  }

  async function handleDelete(shortCode) {
    if (!confirm('Delete this link?')) return;
    try {
      await apiRequest(`/links/${shortCode}`, { method: 'DELETE' }, token);
      showToast('Link deleted');
      loadLinks();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  const filtered = links.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Links</h1>
          <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>
            {links.length} links &middot; {totalClicks} total clicks
          </p>
        </div>
        <Link to="/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <PlusCircle size={16} />
          Create Link
        </Link>
      </div>

      {links.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input
            className="input"
            placeholder="Search links..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state glass" style={{ padding: '3rem 1rem' }}>
          <Link2 size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
          <h3>{links.length === 0 ? 'No links yet' : 'No results'}</h3>
          <p>{links.length === 0 ? 'Create your first short link to get started.' : 'Try a different search term.'}</p>
          {links.length === 0 && (
            <Link to="/create" className="btn btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>
              <PlusCircle size={16} /> Create Link
            </Link>
          )}
        </div>
      ) : (
        <div className="link-grid">
          {filtered.map(link => (
            <LinkCard
              key={link.shortCode}
              link={link}
              onEdit={setEditLink}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editLink && (
        <EditModal
          link={editLink}
          onSave={handleEdit}
          onClose={() => setEditLink(null)}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
