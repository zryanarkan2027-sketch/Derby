// src/data/adminAuth.ts
// Supabase Auth (email + password) through the REST API, no extra packages needed.

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '');
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const STORE_KEY = 'derby_admin_session';

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
}

function save(s: Session) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function load(): Session | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

async function tokenRequest(grant: 'password' | 'refresh_token', body: object): Promise<Session> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Invalid email or password');
  const j = await res.json();
  const session: Session = {
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (j.expires_in ?? 3600),
  };
  save(session);
  return session;
}

export async function signIn(email: string, password: string): Promise<void> {
  await tokenRequest('password', { email: email.trim(), password });
}

export function signOut() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}

/** Returns a valid access token (refreshing if needed) or null if not signed in. */
export async function getAccessToken(): Promise<string | null> {
  const s = load();
  if (!s) return null;
  const now = Math.floor(Date.now() / 1000);
  if (s.expires_at - 60 > now) return s.access_token;
  try {
    const fresh = await tokenRequest('refresh_token', { refresh_token: s.refresh_token });
    return fresh.access_token;
  } catch {
    signOut();
    return null;
  }
}
