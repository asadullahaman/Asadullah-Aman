/* ============================================
   ASADULLAH AMAN — PORTFOLIO JAVASCRIPT
   ============================================ */

/* ============================================
   SUPABASE CLIENT (shared)
   Used by index.html, frame.html, public/page/community.html
   and public/page/make-post.html. Wrapped in an IIFE so its
   constants don't leak into the global scope.
   ============================================ */
(function () {
  if (window.supabase && window.supabase.select) return; // already loaded

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
      if (opts.order) url += `&order=${encodeURIComponent(opts.order)}`; // e.g. 'created_at.desc'
      if (opts.limit) url += `&limit=${encodeURIComponent(opts.limit)}`;

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
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
        method : 'PATCH',
        headers: this._headers(),
        body   : JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },

    /* ── DELETE ────────────────────────────────────────────────────── */
    async delete(table, id) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
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
})();

/* ============================================
   PORTFOLIO DATA (loaded from Supabase)
   ============================================ */
const PORTFOLIO_TABLE = 'portfolio_items';

// Shown only if Supabase is unreachable or the table is empty.
const DEFAULT_PORTFOLIO_ITEMS = [
  {
    id: "1",
    category: "social",
    iframeSrc: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F3013285538861724%2F&show_text=true&width=560&t=0",
    title: "Viral Facebook Reel",
    desc: "Engaging short-form content edit for social media."
  },
  {
    id: "2",
    category: "commercial",
    iframeSrc: "https://www.youtube.com/embed/2dNI7ukSaus",
    title: "Brand Story Campaign",
    desc: "High-impact commercial."
  }
];

// Escape text before inserting into HTML (prevents script injection from DB rows).
function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Only allow http(s) iframe URLs (blocks javascript: and similar).
function safeIframeSrc(src) {
  try {
    const u = new URL(String(src || '').trim());
    return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : null;
  } catch {
    return null;
  }
}

// Map a Supabase row to the shape the UI uses. Accepts a few column-name variants.
function normalizePortfolioRow(row) {
  return {
    id: row.id,
    category: (row.category || 'all').toLowerCase(),
    iframeSrc: safeIframeSrc(row.iframe_src ?? row.iframeSrc ?? row.src),
    title: row.title || '',
    desc: row.description ?? row.desc ?? ''
  };
}

async function fetchPortfolioItems() {
  try {
    const rows = await window.supabase.select(PORTFOLIO_TABLE, { order: 'created_at.desc' });
    const items = (rows || []).map(normalizePortfolioRow).filter(i => i.iframeSrc);
    if (items.length) return items;
    console.warn(`Supabase table "${PORTFOLIO_TABLE}" is empty — showing default items.`);
  } catch (err) {
    console.error('Failed to load portfolio items from Supabase:', err);
  }
  return DEFAULT_PORTFOLIO_ITEMS;
}

function renderPortfolioItems(items) {
  const grid = document.getElementById("portfolio-grid");
  if (!grid) return;

  grid.innerHTML = ""; // Clear loading state / old items
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "portfolio-card";
    card.dataset.category = item.category;

    card.innerHTML = `
      <div class="video-container">
        <iframe src="${escapeHTML(item.iframeSrc)}" frameborder="0" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen="true"></iframe>
      </div>
      <div class="port-info">
        <h3 class="port-title">${escapeHTML(item.title)}</h3>
        <p class="port-desc">${escapeHTML(item.desc)}</p>
      </div>
    `;
    grid.appendChild(card);
  });

  // Re-apply whichever filter button is currently active.
  const activeBtn = document.querySelector('.filter-btn.active');
  if (activeBtn) applyPortfolioFilter(activeBtn.dataset.filter);
}

function applyPortfolioFilter(filter) {
  document.querySelectorAll('#portfolio-grid .portfolio-card').forEach(card => {
    const match = filter === 'all' || card.dataset.category === filter;
    card.style.display = match ? '' : 'none';
    setTimeout(() => { card.style.opacity = match ? '1' : '0'; }, 10);
  });
}

document.addEventListener("DOMContentLoaded", () => {

  // Splash Screen Logic
  const splash = document.getElementById("splash-screen");
  const splashType = document.getElementById("splash-type");
  
  if (splash) {
    if (sessionStorage.getItem("splashShown")) {
      splash.style.display = "none";
    } else {
      document.body.style.overflow = "hidden";
      
      const textToType = "Practice Creativity with Asadullah";
      let charIndex = 0;
      
      setTimeout(() => {
        splashType.classList.add("typing-active");
        
        const typeInterval = setInterval(() => {
          if (charIndex < textToType.length) {
            splashType.textContent += textToType.charAt(charIndex);
            charIndex++;
          } else {
            clearInterval(typeInterval);
            
            setTimeout(() => {
              splash.style.opacity = "0";
              setTimeout(() => {
                splash.style.display = "none";
                document.body.style.overflow = "";
                sessionStorage.setItem("splashShown", "true");
              }, 1000);
            }, 1500);
          }
        }, 80);
      }, 3500);
    }
  }


  // 0. ---- Load Portfolio Items from Supabase ----
  // Iframe links + titles come from the `portfolio_items` table.
  // The hero carousel copies those iframes, so it is started only after rendering.
  const portfolioGrid = document.getElementById("portfolio-grid");
  if (portfolioGrid) {
    portfolioGrid.innerHTML = '<p class="port-loading" style="opacity:.6;text-align:center;grid-column:1/-1;">Loading portfolio…</p>';

    fetchPortfolioItems().then(items => {
      renderPortfolioItems(items);
      initReelCarousel(); // 7. Hero Reel Carousel (needs the rendered iframes)
    });
  }

  // 1. ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // 2. ---- Slide Toggle Mobile Menu ----
  const toggleCheckbox = document.getElementById('checkbox2');
  const mobileNav = document.getElementById('mobile-nav');

  if (toggleCheckbox && mobileNav) {
    toggleCheckbox.addEventListener('change', (e) => {
      mobileNav.classList.toggle('open', e.target.checked);
    });

    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target) && !toggleCheckbox.contains(e.target) && !e.target.closest('label[for="checkbox2"]')) {
        toggleCheckbox.checked = false;
        mobileNav.classList.remove('open');
      }
    });

    mobileNav.querySelectorAll('.glass-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggleCheckbox.checked = false;
        mobileNav.classList.remove('open');
      });
    });
  }

  // 3. ---- Portfolio Filter ----
  // Cards load asynchronously from Supabase, so they are looked up on each click.
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyPortfolioFilter(btn.dataset.filter);
    });
  });

  // 4. ---- Smooth Scroll for Internal Anchors ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // 5. ---- Skill Bar Animation ----
  const skillBars = document.querySelectorAll('.skill-bar');
  if (skillBars.length) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          bar.style.width = bar.style.getPropertyValue('--pct');
          barObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    skillBars.forEach(bar => {
      bar.style.width = '0';
      setTimeout(() => barObserver.observe(bar), 100);
    });
  }

  // 6. ---- Contact Form Simulation ----
  const form = document.getElementById('contact-form');
  const sendBtn = document.getElementById('btn-send');

  if (form && sendBtn) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fname').value.trim();
      const email = document.getElementById('femail').value.trim();
      const message = document.getElementById('fmessage').value.trim();

      if (!name || !email || !message) {
        sendBtn.textContent = 'Please fill required fields';
        sendBtn.style.background = '#e53935';
        setTimeout(() => {
          sendBtn.textContent = 'SEND MESSAGE';
          sendBtn.style.background = '';
        }, 2500);
        return;
      }

      sendBtn.textContent = 'SENDING...';
      sendBtn.disabled = true;

      setTimeout(() => {
        sendBtn.textContent = 'MESSAGE SENT! ✓';
        sendBtn.style.background = '#2e7d32';
        form.reset();

        setTimeout(() => {
          sendBtn.textContent = 'SEND MESSAGE';
          sendBtn.style.background = '';
          sendBtn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }

  // 7. ---- Hero Reel Carousel Initialization ----
  // Started in section 0, after portfolio items are loaded from Supabase.

  // 8. ---- macOS Dock-style Nav Magnification (desktop only) ----
  initNavDock();

});

/* ============================================
   NAV DOCK MAGNIFICATION
   The link under the cursor grows the most; neighbours grow
   less the farther they are and slide outward to make room —
   like the macOS Dock. Uses transforms only (no layout reflow).
   ============================================ */
function initNavDock() {
  const dock = document.querySelector('.nav-links');
  if (!dock) return;

  const canHover     = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduceMotion) return;

  const links     = Array.from(dock.querySelectorAll('.nav-link'));
  const MAX_SCALE = 0.65;  // hovered link grows up to 1.65×
  const SPREAD    = 75;    // px — how far the effect reaches to neighbours
  const EDGE_GAP  = 8;     // px — min space kept from logo / hamburger

  let mouseX = null;
  let frame  = null;

  // First visible sibling in a direction (skips the hidden checkbox).
  function visibleSibling(el, dir) {
    let s = el[dir];
    while (s && s.offsetWidth === 0) s = s[dir];
    return s;
  }

  function update() {
    frame = null;

    if (mouseX === null) {
      links.forEach(l => { l.style.setProperty('--dock-scale', '1'); l.style.setProperty('--dock-x', '0px'); });
      return;
    }

    // Untransformed layout (offsetLeft/Width ignore transforms).
    const dockRect = dock.getBoundingClientRect();
    const base = links.map(l => {
      const left = dockRect.left + (l.offsetLeft - dock.offsetLeft);
      const w = l.offsetWidth;
      return { left, right: left + w, center: left + w / 2, w };
    });

    // Scale + extra width for each link (bell curve around the cursor).
    const extra = base.map(b => {
      const d = mouseX - b.center;
      const s = 1 + MAX_SCALE * Math.exp(-(d * d) / (2 * SPREAD * SPREAD));
      b.scale = s;
      return (s - 1) * b.w;
    });

    // Overlap length of [a1,a2] with [b1,b2].
    const overlap = (a1, a2, b1, b2) => Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));

    // Each link's centre moves by the growth of everything between it and the cursor.
    const shift = base.map(b => {
      const lo = Math.min(mouseX, b.center), hi = Math.max(mouseX, b.center);
      let sum = 0;
      base.forEach((o, j) => { sum += extra[j] * overlap(o.left, o.right, lo, hi) / o.w; });
      return b.center >= mouseX ? sum : -sum;
    });

    // Keep the group from colliding with the logo (left) or hamburger (right).
    const last = base.length - 1;
    const overflowR = (base[last].right + shift[last] + extra[last] / 2) - dockRect.right;
    const overflowL = dockRect.left - (base[0].left + shift[0] - extra[0] / 2);
    const next = visibleSibling(dock, 'nextElementSibling');
    const prev = visibleSibling(dock, 'previousElementSibling');
    const roomR = next ? next.getBoundingClientRect().left - dockRect.right - EDGE_GAP : Infinity;
    const roomL = prev ? dockRect.left - prev.getBoundingClientRect().right - EDGE_GAP : Infinity;
    let nudge = 0;
    if (overflowR > roomR) nudge -= overflowR - roomR;
    if (overflowL > roomL) nudge += overflowL - roomL;

    links.forEach((l, i) => {
      l.style.setProperty('--dock-scale', base[i].scale.toFixed(3));
      l.style.setProperty('--dock-x', (shift[i] + nudge).toFixed(1) + 'px');
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  dock.addEventListener('mousemove', (e) => { mouseX = e.clientX; schedule(); });
  dock.addEventListener('mouseleave', () => { mouseX = null; schedule(); });
}

/* ============================================
   HERO REEL CAROUSEL - Dynamic Native Implementation
   Pulls iframes dynamically from `#portfolio-grid`
   ============================================ */
function initReelCarousel() {
  const stage = document.getElementById('reel-carousel');
  const deck = document.getElementById('reel-deck');
  const prevBtn = document.getElementById('reel-prev');
  const nextBtn = document.getElementById('reel-next');
  if (!stage || !deck) return;

  // Extract dynamically from Portfolio iframes
  const source = Array.from(document.querySelectorAll('#portfolio-grid .portfolio-card'))
    .map(card => {
      const iframe = card.querySelector('iframe');
      return {
        label: card.querySelector('.port-label')?.textContent.trim() || 'PORTFOLIO',
        src: iframe ? iframe.getAttribute('src') : null
      };
    })
    .filter(item => item.src); // Only keep items that have a valid src

  const count = source.length;
  if (count === 0) {
    stage.style.display = 'none'; // Hide if no iframes found
    return;
  }
  
  if (count < 2) {
      // Just duplicate to have at least 2 for logic
      source.push(source[0]);
  }

  const DEPTH = 1;      // neighbor cards visible on each side
  const STEP = 0.85;    // horizontal gap multiplier
  let CARD_W = window.innerWidth > 900 ? 384 : (window.innerWidth > 700 ? 320 : (window.innerWidth > 400 ? 288 : 240));
  const SCALE = [1, 0.72];
  const ALPHA = [1, 0.55];

  // Enough duplicated nodes that wrap-around recycling happens off-screen.
  let total = count;
  while (total < DEPTH * 2 + 3) total += count;

  const nodes = [];
  let active = 0;

  const frag = document.createDocumentFragment();
  for (let i = 0; i < total; i++) {
    const item = source[i % count];
    const el = document.createElement('div');
    el.className = 'reel-item';
    el.innerHTML = `
      <iframe src="${item.src}" frameborder="0" allowfullscreen style="width:100%; height:100%; border-radius:12px; pointer-events:none;"></iframe>
      <div class="glass-overlay" style="position:absolute; inset:0; z-index:5;"></div>
    `;
el._slot = i;
frag.appendChild(el);
nodes.push(el);
}
deck.appendChild(frag);

function place(el, d) {
const a = Math.abs(d);
const s = a <= DEPTH ? SCALE[a] : SCALE[DEPTH] * 0.8;
const o = a <= DEPTH ? ALPHA[a] : 0;
el.style.transform = 'translate3d(' + (d * STEP * CARD_W).toFixed(1) + 'px, 0, 0) scale(' + s + ')';
el.style.opacity = o;
el.style.zIndex = String(50 - a);
el.style.visibility = o === 0 ? 'hidden' : 'visible';
el.classList.toggle('is-active', d === 0);
}

function render() {
nodes.forEach(el => {
let d = ((el._slot - active) % total + total) % total;
  if (d > total / 2) d -= total;
  if (el._d !== undefined && Math.abs(d - el._d) > 1) {
    el.style.transition = 'none';
    place(el, d);
    void el.offsetWidth;
    el.style.transition = '';
  } else {
    place(el, d);
  }
  el._d = d;
});
}

function go(delta) {
active = ((active + delta) % total + total) % total;
render();
}

let timer = null;
let paused = false;

function tick() { if (!paused && !document.hidden) go(1); }
function play() { stop(); timer = setInterval(tick, 3000); }
function stop() { if (timer) { clearInterval(timer); timer = null; } }

stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') paused = true; });
stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') paused = false; });

if (prevBtn) prevBtn.addEventListener('click', () => { go(-1); play(); });
if (nextBtn) nextBtn.addEventListener('click', () => { go(1); play(); });

deck.addEventListener('click', (e) => {
const el = e.target.closest('.reel-item');
if (el && el._d && el._d !== 0) { go(el._d); play(); }
});

let startX = 0, swiping = false;
stage.addEventListener('touchstart', (e) => {
startX = e.changedTouches[0].clientX;
swiping = true;
paused = true;
}, { passive: true });
stage.addEventListener('touchend', (e) => {
if (!swiping) return;
swiping = false;
paused = false;
const dx = e.changedTouches[0].clientX - startX;
if (Math.abs(dx) > 30) { go(dx < 0 ? 1 : -1); play(); }
}, { passive: true });

window.addEventListener('resize', () => {
CARD_W = window.innerWidth > 900 ? 384 : (window.innerWidth > 700 ? 320 : (window.innerWidth > 400 ? 288 : 240));
render();
});

document.addEventListener('visibilitychange', () => {
if (document.hidden) stop(); else play();
});

// Initial setup without animation
nodes.forEach(el => {
let d0 = ((el._slot - active) % total + total) % total;
if (d0 > total / 2) d0 -= total;
el.style.transition = 'none';
place(el, d0);
el._d = d0;
});
void deck.offsetWidth;
nodes.forEach(el => { el.style.transition = ''; });

play();
}

