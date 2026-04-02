import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MousePointerClick, Link2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

export default function Stats() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState('');
  const [chartData, setChartData] = useState([]);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const data = await apiRequest('/stats', {}, token);
      setStats(data);
      if (data.links?.length > 0) {
        loadLinkStats(data.links[0].shortCode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadLinkStats(shortCode) {
    setSelectedLink(shortCode);
    try {
      const data = await apiRequest(`/stats/${shortCode}`, {}, token);
      setChartData(data.dailyClicks || []);
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!stats) return <div className="page"><div className="empty-state glass"><p>Failed to load stats</p></div></div>;

  const topLink = stats.links?.reduce((best, l) => l.clicks > (best?.clicks || 0) ? l : best, null);
  const avgClicks = stats.totalLinks > 0 ? Math.round(stats.totalClicks / stats.totalLinks) : 0;

  // Sort links by clicks descending
  const sortedLinks = [...(stats.links || [])].sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stats</h1>
      </div>

      <div className="stats-row">
        <div className="glass stat-card">
          <div className="stat-value">{stats.totalClicks}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-value">{topLink?.name?.slice(0, 15) || '—'}</div>
          <div className="stat-label">Top Performer</div>
        </div>
        <div className="glass stat-card">
          <div className="stat-value">{avgClicks}</div>
          <div className="stat-label">Avg per Link</div>
        </div>
      </div>

      {stats.links?.length > 0 && (
        <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Clicks Over Time</h3>
            <select
              value={selectedLink}
              onChange={e => loadLinkStats(e.target.value)}
              className="input"
              style={{ width: 'auto', maxWidth: 200, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              {stats.links.map(l => (
                <option key={l.shortCode} value={l.shortCode}>{l.name}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              />
              <Bar dataKey="clicks" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Performance</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', opacity: 0.6, fontWeight: 500 }}>Link</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', opacity: 0.6, fontWeight: 500 }}>Clicks</th>
                <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', opacity: 0.6, fontWeight: 500 }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {sortedLinks.map(link => (
                <tr key={link.shortCode} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{link.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>duan.bio/{link.shortCode}</div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.6rem 0.75rem', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}>
                    {link.clicks}
                  </td>
                  <td style={{ textAlign: 'center', padding: '0.6rem 0.75rem' }}>
                    {link.clicks > avgClicks ? (
                      <ArrowUp size={16} color="var(--accent)" />
                    ) : link.clicks < avgClicks ? (
                      <ArrowDown size={16} color="var(--danger)" />
                    ) : (
                      <Minus size={16} style={{ opacity: 0.4 }} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
