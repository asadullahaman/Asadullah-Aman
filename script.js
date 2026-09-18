document.addEventListener("DOMContentLoaded", () => {
  
  // 1. ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // 2. ---- Scroll Blur Logic (Moved from HTML) ----
  window.addEventListener('scroll', () => {
    const bg = document.getElementById('dynamic-bg');
    if (bg) {
      if (window.scrollY > window.innerHeight * 0.4) {
        bg.classList.add('scrolled-blur');
      } else {
        bg.classList.remove('scrolled-blur');
      }
    }
  }, { passive: true });

  // 3. ---- Mobile Menu Logic ----
  const toggleCheckbox = document.getElementById('checkbox2');
  const mobileNav = document.getElementById('mobile-nav');

  if (toggleCheckbox && mobileNav) {
    toggleCheckbox.addEventListener('change', (e) => {
      e.target.checked ? mobileNav.classList.add('open') : mobileNav.classList.remove('open');
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

  // 4. ---- Smooth Scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if(targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });

  // 5. ---- NEW: Interactive Card Carousel ----
  const deck = document.getElementById('carousel-deck');
  if (deck) {
    const items = [
      `<div class="port-label" style="position: absolute; top: 5px; left: 5px; z-index: 10; background:rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; font-size: 10px;">FB REEL</div><iframe loading="lazy" src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F3013285538861724%2F&show_text=false&width=560&t=0" style="border:none;overflow:hidden;width:100%;height:100%; border-radius: 8px;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`,
      `<div class="port-label" style="position: absolute; top: 5px; left: 5px; z-index: 10; background:rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; font-size: 10px;">COMMERCIAL</div><iframe loading="lazy" src="https://www.youtube.com/embed/2dNI7ukSaus" style="border:none;overflow:hidden;width:100%;height:100%; border-radius: 8px;" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
      `<div class="port-label" style="position: absolute; top: 5px; left: 5px; z-index: 10; background:rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; font-size: 10px;">FB REEL</div><iframe loading="lazy" src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F3013285538861724%2F&show_text=false&width=560&t=0" style="border:none;overflow:hidden;width:100%;height:100%; border-radius: 8px;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`,
      `<div class="port-label" style="position: absolute; top: 5px; left: 5px; z-index: 10; background:rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; font-size: 10px;">COMMERCIAL</div><iframe loading="lazy" src="https://www.youtube.com/embed/2dNI7ukSaus" style="border:none;overflow:hidden;width:100%;height:100%; border-radius: 8px;" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
    ];

    let count = items.length;
    let DEPTH = 2; 
    let M = count;
    while (M < DEPTH * 2 + 3) M += count;

    let STEP = 140; 
    let SCALE = [1, 0.75, 0.5];
    let ALPHA = [1, 0.6, 0.2];

    let nodes = [];
    let active = 0;

    for (let j = 0; j < M; j++) {
      let el = document.createElement('div');
      el.className = 'carousel-card';
      el.innerHTML = items[j % count];
      el._slot = j;
      deck.appendChild(el);
      nodes.push(el);
    }

    function place(el, d) {
      let a = Math.abs(d);
      let s = a <= DEPTH ? SCALE[a] : SCALE[DEPTH] * 0.8;
      let o = a <= DEPTH ? ALPHA[a] : 0;
      el.style.transform = `translate3d(${d * STEP}px, 0, 0) scale(${s})`;
      el.style.opacity = o;
      el.style.zIndex = 50 - a;
      el.style.visibility = o === 0 ? 'hidden' : 'visible';
      el.classList.toggle('is-active', d === 0);
    }

    function render() {
      for (let k = 0; k < nodes.length; k++) {
        let el = nodes[k];
        let d = ((el._slot - active) % M + M) % M;
        if (d > M / 2) d -= M;

        if (el._d !== undefined && Math.abs(d - el._d) > 1) {
          el.style.transition = 'none';
          place(el, d);
          void el.offsetWidth;
          el.style.transition = '';
        } else {
          place(el, d);
        }
        el._d = d;
      }
    }

    function go(delta) {
      active = ((active + delta) % M + M) % M;
      render();
    }

    let timer = null, paused = false;
    function tick() { if (!paused) go(1); }
    function play() { stop(); timer = setInterval(tick, 3000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function bump() { play(); } 

    document.getElementById('prev-btn').addEventListener('click', () => { go(-1); bump(); });
    document.getElementById('next-btn').addEventListener('click', () => { go(1); bump(); });

    deck.addEventListener('click', (e) => {
      let el = e.target.closest('.carousel-card');
      if (el && el._d !== 0) { go(el._d); bump(); }
    });

    const stage = document.getElementById('carousel-stage');
    stage.addEventListener('mouseenter', () => paused = true);
    stage.addEventListener('mouseleave', () => paused = false);

    for (let n = 0; n < nodes.length; n++) {
      let d0 = ((nodes[n]._slot - active) % M + M) % M;
      if (d0 > M / 2) d0 -= M;
      nodes[n].style.transition = 'none';
      place(nodes[n], d0);
      nodes[n]._d = d0;
    }
    setTimeout(() => {
      for (let m = 0; m < nodes.length; m++) nodes[m].style.transition = '';
    }, 50);

    play();
  }

  // 6. ---- Draggable Clock Widget ----
  const clockWidget = document.getElementById('draggable-clock');
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

  if (clockWidget && timeEl && dateEl) {
    function updateClock() {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      hours = hours % 12 || 12; 
      minutes = minutes < 10 ? '0' + minutes : minutes;
      timeEl.textContent = `${hours}:${minutes}`;
      dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    
    setInterval(updateClock, 1000);
    updateClock(); 

    let isDragging = false;
    let initialX, initialY;

    function dragStart(e) {
      if (e.target.closest('.glass-clock-widget')) {
        isDragging = true;
        const rect = clockWidget.getBoundingClientRect();
        const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
        initialX = clientX - rect.left;
        initialY = clientY - rect.top;
        clockWidget.style.bottom = 'auto';
        clockWidget.style.right = 'auto';
        clockWidget.style.width = rect.width + 'px'; 
      }
    }

    function dragEnd() { isDragging = false; }

    function drag(e) {
      if (isDragging) {
        e.preventDefault(); 
        const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

        let newX = Math.max(0, Math.min(clientX - initialX, window.innerWidth - clockWidget.offsetWidth));
        let newY = Math.max(0, Math.min(clientY - initialY, window.innerHeight - clockWidget.offsetHeight));

        clockWidget.style.left = `${newX}px`;
        clockWidget.style.top = `${newY}px`;
      }
    }

    clockWidget.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);
    clockWidget.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", dragEnd);
  }

});