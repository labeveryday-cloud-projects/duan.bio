import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateLink from './pages/CreateLink';
import Stats from './pages/Stats';
import './index.css';

function LoginScreen() {
  const { login } = useAuth();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: 380 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>duan.bio</h1>
        <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '1.5rem' }}>
          Link shortener dashboard
        </p>
        <button onClick={login} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Sign In
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) return <LoginScreen />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateLink />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
