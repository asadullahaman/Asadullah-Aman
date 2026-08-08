/* ============================================
   ASADULLAH AMAN — PORTFOLIO JAVASCRIPT
   Combined functionality for SPA setup, custom toggle menu, and interactions.
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // 1. ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // 2. ---- New Slide Toggle Mobile Menu Logic ----
  const toggleCheckbox = document.getElementById('checkbox2');
  const mobileNav = document.getElementById('mobile-nav');

  if (toggleCheckbox && mobileNav) {
    // Open/Close dropdown based on checkbox state
    toggleCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        mobileNav.classList.add('open');
      } else {
        mobileNav.classList.remove('open');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target) && !toggleCheckbox.contains(e.target) && !e.target.closest('label[for="checkbox2"]')) {
        toggleCheckbox.checked = false;
        mobileNav.classList.remove('open');
      }
    });

    // Close menu when clicking a link inside the mobile menu
    const glassLinks = mobileNav.querySelectorAll('.glass-nav-link');
    glassLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleCheckbox.checked = false;
        mobileNav.classList.remove('open');
      });
    });
  }

  // 3. ---- Portfolio Filter Logic ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  if (filterBtns.length > 0 && portfolioCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Change active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter elements
        const filter = btn.dataset.filter;
        portfolioCards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.style.display = match ? '' : 'none';
          setTimeout(() => {
            card.style.opacity = match ? '1' : '0';
          }, 10);
        });
      });
    });
  }

  // 4. ---- Smooth Scroll for Internal Anchors (SPA) ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if(targetId === "#") return;
      
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
  if (skillBars.length > 0) {
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

  console.log('Portfolio SPA Ready & Optimized — Asadullah Aman');
});
// 7. ---- Dynamic Auto-Updating Slider ----
  const slider = document.querySelector('.slider');
  const sliderList = document.querySelector('.slider .list');
  const portfolioIframes = document.querySelectorAll('.portfolio-card iframe');
  const portfolioLabels = document.querySelectorAll('.portfolio-card .port-label');

  // Check if all elements exist to prevent errors
  if (slider && sliderList && portfolioIframes.length > 0) {
    sliderList.innerHTML = ''; // Clear the old hardcoded slider items
    
    // Duplicate the total count by 2 so the infinite scrolling loop never runs out of items
    let totalItems = portfolioIframes.length * 2; 
    slider.style.setProperty('--quantity', totalItems);

    let position = 1;
    
    // We loop twice to create the duplicated clones for the infinite scrolling effect
    for (let i = 0; i < 2; i++) {
      portfolioIframes.forEach((iframe, index) => {
        // Grab the matching label (e.g., "FB REEL" or "COMMERCIAL")
        let labelText = portfolioLabels[index] ? portfolioLabels[index].innerText : 'PORTFOLIO';
        
        let newItem = document.createElement('div');
        newItem.className = 'item';
        newItem.style.setProperty('--position', position);
        
        // Build the new slider card perfectly mimicking your HTML structure
        newItem.innerHTML = `
          <div class="card">
            <div class="port-label" style="position: absolute; top: 5px; left: 5px; z-index: 10;">${labelText}</div>
            <iframe loading="lazy" src="${iframe.src}" style="border:none;overflow:hidden;width:100%;height:100%; border-radius: 8px;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
          </div>
        `;
        
        sliderList.appendChild(newItem);
        position++;
      });
    }
  }
