// public/js/supabase-client.js
const SUPABASE_URL      = 'https://ujkrxcqvnxkxfnpwaydy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqa3J4Y3F2bnhreGZucHdheWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjY5NTMsImV4cCI6MjA5MzUwMjk1M30.TFBezCSekTtgQ6AoKZ1VWJwf8RwHU2upAlu02N0Zs7o';
const IMGBB_API_KEY     = '9f52b7ff0436795cf34ae837c24f6c49';
const AUTH_TOKEN_KEY    = 'sb_access_token';

/* ─── Supabase REST Client ─────────────────────────────────────────── */
const supabase = {

  _token() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      if (exp && exp * 1000 < Date.now()) {
        localStorage.removeItem(AUTH_TOKEN_KEY); // stale — clear it
        return null;
      }
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }
    return token;
  },

  _headers() {
    const token = this._token();
    return {
      'apikey'       : SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type' : 'application/json',
      'Prefer'       : 'return=representation',
    };
  },

  /* ── SELECT ────────────────────────────────────────────────────── */
  async select(table, opts = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;

    if (opts.eq)    url += `&${opts.eq.col}=eq.${encodeURIComponent(opts.eq.val)}`;
    if (opts.order) url += `&order=${opts.order}`;         // e.g. 'created_at.desc'
    if (opts.limit) url += `&limit=${opts.limit}`;

    const res = await fetch(url, { method: 'GET', headers: this._headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  /* ── INSERT ────────────────────────────────────────────────────── */
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method : 'POST',
      headers: this._headers(),
      body   : JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  /* ── UPDATE ────────────────────────────────────────────────────── */
  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method : 'PATCH',
      headers: this._headers(),
      body   : JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  /* ── DELETE ────────────────────────────────────────────────────── */
  async delete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method : 'DELETE',
      headers: this._headers(),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },

  /* ── AUTH ──────────────────────────────────────────────────────── */
  auth: {
    _baseHeaders() {
      return { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
    },
    _authHeaders() {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      return { ...this._baseHeaders(), 'Authorization': `Bearer ${token}` };
    },

    async getSession() {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return { data: { session: null } };

      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: this._authHeaders(),
        });
        if (!res.ok) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          return { data: { session: null } };
        }
        const user = await res.json();
        return { data: { session: { user, access_token: token } } };
      } catch {
        return { data: { session: null } };
      }
    },

    async signInWithPassword({ email, password }) {
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method : 'POST',
          headers: this._baseHeaders(),
          body   : JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: null, error: { message: data.error_description || data.msg || 'Login failed' } };
        }
        localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
        return { data, error: null };
      } catch (err) {
        return { data: null, error: { message: err.message } };
      }
    },

    async signOut() {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
            method : 'POST',
            headers: this._authHeaders(),
          });
        } catch (e) {
          console.warn('Supabase logout request failed:', e);
        }
      }
      localStorage.removeItem(AUTH_TOKEN_KEY);
    },
  },
};

/* ─── ImgBB Upload ─────────────────────────────────────────────────── */
async function uploadToImgBB(file) {
  const form = new FormData();
  form.append('image', file);

  const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body  : form,
  });
  const data = await res.json();
  if (!data.success) throw new Error('ImgBB upload failed: ' + (data.error?.message || 'Unknown'));
  return data.data.url;
}

/* ─── Expose Globals ───────────────────────────────────────────────── */
window.supabase      = supabase;
window.uploadToImgBB = uploadToImgBB;
console.log('✅ Supabase client ready');
