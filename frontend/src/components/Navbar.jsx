import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, PlusCircle, LogOut, Home } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

export default function Navbar() {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/stats', label: 'Stats', icon: BarChart3 },
    { to: '/create', label: 'Create', icon: PlusCircle },
  ];

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.15)',
      padding: '0 1rem',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <a href="/" style={{
            color: 'var(--accent)',
            textDecoration: 'none',
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: '1.1rem',
            marginRight: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <Home size={18} />
            duan.bio
          </a>
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: pathname === to ? 'var(--accent)' : 'rgba(255,255,255,0.7)',
                background: pathname === to ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} />
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user && (
            <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'none' }}
              className="nav-email">
              {user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <LogOut size={14} />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .nav-label { display: none; }
          .nav-email { display: none !important; }
        }
        @media (min-width: 768px) {
          .nav-email { display: inline !important; }
        }
      `}</style>
    </nav>
  );
}
