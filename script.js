/* ============================================
   ASADULLAH AMAN — PORTFOLIO JAVASCRIPT
   ============================================ */

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id], main > section');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.4, rootMargin: '-60px 0px -40% 0px' });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ---- Smooth scroll for all anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });

      // Close mobile nav if open
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
});

// ---- Hamburger / mobile nav ----
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// ---- Portfolio filter ----
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    portfolioCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.display = match ? '' : 'none';
      card.style.opacity = match ? '1' : '0';
    });
  });
});

// ---- Scroll reveal (IntersectionObserver) ----
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.skill-card, .portfolio-card, .service-card, .stat-card, .about-content, .about-image-wrap, .contact-item, .hero-text, .hero-visual'
).forEach(el => {
  el.classList.add('fade-up');
  fadeObserver.observe(el);
});

// ---- Skill bar animation ----
const skillBars = document.querySelectorAll('.skill-bar');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      bar.style.width = bar.style.getPropertyValue('--pct') || bar.style['--pct'];
      barObserver.unobserve(bar);
    }
  });
}, { threshold: 0.3 });

skillBars.forEach(bar => {
  const pct = getComputedStyle(bar).getPropertyValue('--pct').trim();
  bar.style.width = '0';
  setTimeout(() => barObserver.observe(bar), 100);
});

// ---- Contact form ----
const form = document.getElementById('contact-form');
const sendBtn = document.getElementById('btn-send');

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

// ---- Cursor glow effect on hero ----
const hero = document.querySelector('.hero');
if (hero) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--mx', x + '%');
    hero.style.setProperty('--my', y + '%');
  });
}

console.log('Portfolio ready — Asadullah Aman');
