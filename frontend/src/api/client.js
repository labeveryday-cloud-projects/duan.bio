const API_BASE = '/api';

// Mock data for local development
const MOCK_LINKS = [
  { shortCode: 'reinvent-2025', name: 'AWS re:Invent Talk', targetUrl: 'https://youtube.com/watch?v=abc', clicks: 142, createdAt: '2026-03-15T12:00:00Z' },
  { shortCode: 'ai-workshop', name: 'AI Workshop Registration', targetUrl: 'https://example.com/workshop', clicks: 87, createdAt: '2026-03-20T14:30:00Z' },
  { shortCode: 'newsletter', name: 'Newsletter Signup', targetUrl: 'https://duanlightfoot.substack.com/', clicks: 256, createdAt: '2026-02-01T09:00:00Z' },
];

const USE_MOCK = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export async function apiRequest(path, options = {}, token) {
  if (USE_MOCK) return mockRequest(path, options);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Mock implementations for local dev
let mockLinks = [...MOCK_LINKS];

function mockRequest(path, options) {
  const method = options.method || 'GET';

  if (path === '/links' && method === 'GET') {
    return Promise.resolve([...mockLinks]);
  }

  if (path === '/links' && method === 'POST') {
    const body = JSON.parse(options.body);
    const newLink = { ...body, clicks: 0, createdAt: new Date().toISOString() };
    mockLinks.unshift(newLink);
    return Promise.resolve(newLink);
  }

  if (path.startsWith('/links/') && method === 'PUT') {
    const code = path.split('/links/')[1];
    const body = JSON.parse(options.body);
    const idx = mockLinks.findIndex(l => l.shortCode === code);
    if (idx >= 0) {
      mockLinks[idx] = { ...mockLinks[idx], ...body };
      return Promise.resolve(mockLinks[idx]);
    }
    return Promise.reject(new Error('Not found'));
  }

  if (path.startsWith('/links/') && method === 'DELETE') {
    const code = path.split('/links/')[1];
    mockLinks = mockLinks.filter(l => l.shortCode !== code);
    return Promise.resolve({ deleted: true });
  }

  if (path === '/stats' && method === 'GET') {
    const totalClicks = mockLinks.reduce((s, l) => s + l.clicks, 0);
    return Promise.resolve({ totalClicks, totalLinks: mockLinks.length, links: mockLinks });
  }

  if (path.startsWith('/stats/') && method === 'GET') {
    const code = path.split('/stats/')[1];
    const link = mockLinks.find(l => l.shortCode === code);
    if (!link) return Promise.reject(new Error('Not found'));
    return Promise.resolve({
      ...link,
      dailyClicks: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 30),
      })),
    });
  }

  return Promise.reject(new Error('Unknown mock route'));
}
