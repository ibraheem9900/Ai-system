const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  auth: {
    signup: (email: string, password: string) =>
      fetch(`${BASE}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        .then((r) => handleResponse<{ token: string; user: { id: string; email: string } }>(r)),

    signin: (email: string, password: string) =>
      fetch(`${BASE}/auth/signin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        .then((r) => handleResponse<{ token: string; user: { id: string; email: string } }>(r)),

    me: () =>
      fetch(`${BASE}/auth/me`, { headers: authHeaders() })
        .then((r) => handleResponse<{ user: { id: string; email: string } }>(r)),
  },

  conversations: {
    list: () =>
      fetch(`${BASE}/conversations`, { headers: authHeaders() })
        .then((r) => handleResponse<any[]>(r)),

    create: (title: string) =>
      fetch(`${BASE}/conversations`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ title }) })
        .then((r) => handleResponse<any>(r)),

    touch: (id: string) =>
      fetch(`${BASE}/conversations/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ updated_at: new Date().toISOString() }) })
        .then((r) => handleResponse<any>(r)),
  },

  messages: {
    list: (conversationId: string) =>
      fetch(`${BASE}/conversations/${conversationId}/messages`, { headers: authHeaders() })
        .then((r) => handleResponse<any[]>(r)),

    create: (conversationId: string, role: string, content: string, sources?: any[]) =>
      fetch(`${BASE}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ role, content, sources }),
      }).then((r) => handleResponse<any>(r)),
  },

  aiSearch: (query: string) =>
    fetch(`${BASE}/ai-search`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ query }) })
      .then((r) => handleResponse<{ response: string; sources: any[] }>(r)),
};
