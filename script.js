/* ============================================
   ASADULLAH AMAN — PORTFOLIO JAVASCRIPT
   Navbar, mobile menu, filters, smooth scroll,
   skill bars, contact form, hero reel carousel,
   background blur, and the draggable clock.
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // 1. ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

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
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  if (filterBtns.length && portfolioCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        portfolioCards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.style.display = match ? '' : 'none';
          setTimeout(() => { card.style.opacity = match ? '1' : '0'; }, 10);
        });
      });
    });
  }

  // 4. ---- Smooth Scroll for Internal Anchors ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for fixed navbar
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

      // Simulate sending delay
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

  // 7. ---- Hero Reel Carousel ----
  initReelCarousel();

  // 8. ---- Draggable Glass Clock ----
  initDraggableClock();

  console.log('Portfolio SPA Ready — Asadullah Aman');
});

/* ============================================
   HERO REEL CAROUSEL
   A finite-depth "card deck" carousel: cards fan out
   left/right from the active center card, scaling and
   fading with distance. Supports autoplay, click-to-jump,
   swipe, and prev/next buttons. Pulls its cards straight
   from the Portfolio grid so there's one source of truth
   for every embedded reel on the page.
   ============================================ */
function initReelCarousel() {
  const stage = document.getElementById('reel-carousel');
  const deck = document.getElementById('reel-deck');
  const prevBtn = document.getElementById('reel-prev');
  const nextBtn = document.getElementById('reel-next');
  if (!stage || !deck) return;

  const source = Array.from(document.querySelectorAll('#portfolio-grid .portfolio-card'))
    .map(card => ({
      label: card.querySelector('.port-label')?.textContent.trim() || 'PORTFOLIO',
      src: card.querySelector('iframe')?.getAttribute('src') || ''
    }))
    .filter(item => item.src);

  const count = source.length;
  if (count < 2) return;

  const DEPTH = 1;      // neighbor cards visible on each side
  const STEP = 0.85;    // horizontal gap between cards, in card widths
  const CARD_W = 260;   // matches .reel-item width in style.css
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
    el.innerHTML =
      '<div class="port-label">' + item.label + '</div>' +
      '<iframe loading="lazy" src="' + item.src + '" scrolling="no" frameborder="0" ' +
      'allowfullscreen="true" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>';
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
    el.style.pointerEvents = d === 0 ? 'auto' : 'none';
    el.classList.toggle('is-active', d === 0);
  }

  function render() {
    nodes.forEach(el => {
      let d = ((el._slot - active) % total + total) % total;
      if (d > total / 2) d -= total;

      // A card recycling from one end to the other must not fly across.
      if (el._d !== undefined && Math.abs(d - el._d) > 1) {
        el.style.transition = 'none';
        place(el, d);
        void el.offsetWidth; // commit without animating
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
  function play() { stop(); timer = setInterval(tick, 2600); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') paused = true; });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') paused = false; });

  if (prevBtn) prevBtn.addEventListener('click', () => { go(-1); play(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { go(1); play(); });

  deck.addEventListener('click', (e) => {
    const el = e.target.closest('.reel-item');
    if (el && el._d) { go(el._d); play(); }
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

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else play();
  });

  // Initial paint, no animation on load.
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

/* ============================================
   DRAGGABLE GLASS CLOCK (PiP widget)
   ============================================ */
function initDraggableClock() {
  const clockWidget = document.getElementById('draggable-clock');
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  if (!clockWidget || !timeEl || !dateEl) return;

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // '0' becomes '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;

    timeEl.textContent = hours + ':' + minutes;

    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  setInterval(updateClock, 1000);
  updateClock();

  let isDragging = false;
  let initialX, initialY;

  function dragStart(e) {
    if (!e.target.closest('.glass-clock-widget')) return;
    isDragging = true;

    const rect = clockWidget.getBoundingClientRect();
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    initialX = clientX - rect.left;
    initialY = clientY - rect.top;

    // Override CSS bottom/right to allow free dragging via top/left
    clockWidget.style.bottom = 'auto';
    clockWidget.style.right = 'auto';
    clockWidget.style.width = rect.width + 'px'; // Lock width to prevent jumping
  }

  function dragEnd() { isDragging = false; }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault(); // Prevents highlight/scrolling while dragging

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    let newX = clientX - initialX;
    let newY = clientY - initialY;

    // Keep widget inside screen bounds
    const maxX = window.innerWidth - clockWidget.offsetWidth;
    const maxY = window.innerHeight - clockWidget.offsetHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    clockWidget.style.left = newX + 'px';
    clockWidget.style.top = newY + 'px';
  }

  clockWidget.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);

  clockWidget.addEventListener("touchstart", dragStart, { passive: false });
  document.addEventListener("touchmove", drag, { passive: false });
  document.addEventListener("touchend", dragEnd);
}