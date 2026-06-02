// ============================================
// Kamenictví Adámek — Main JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile menu ---
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
    });

    // Close menu when clicking a link
    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
      });
    });
  }

  // --- Header scroll effect (only on homepage) ---
  const header = document.getElementById('header');
  if (header && !header.classList.contains('header--scrolled')) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    });
  }

  // --- Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox) {
    // Open lightbox on gallery image click
    document.querySelectorAll('.gallery__item img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close lightbox
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // --- Gallery "Show more" buttons ---
  document.querySelectorAll('.gallery__more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const target = document.getElementById(targetId);
      if (target) {
        target.classList.toggle('visible');
        btn.textContent = target.classList.contains('visible') ? 'Zobrazit méně' : 'Zobrazit více';
      }
    });
  });

  // --- Scroll animations ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature, .service-card, .stone, .gallery__item, .contact-item').forEach(el => {
    el.classList.add('animate-target');
    observer.observe(el);
  });

  // --- Section nav: sticky, synced to header height via CSS variable ---
  const sectionNav = document.getElementById('section-nav') || document.querySelector('.section-nav');
  if (sectionNav && header) {
    function syncHeaderHeight() {
      const h = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', h + 'px');
      document.documentElement.style.scrollPaddingTop = (h + sectionNav.offsetHeight + 10) + 'px';
    }

    syncHeaderHeight();
    // ResizeObserver fires on every frame the header changes size (incl. during CSS transitions)
    new ResizeObserver(syncHeaderHeight).observe(header);
  }

  // --- Scroll-spy for section nav ---
  const sectionNavLinks = document.querySelectorAll('.section-nav__link[data-section]');
  if (sectionNavLinks.length > 0) {
    const sections = [];
    sectionNavLinks.forEach(link => {
      const id = link.getAttribute('data-section');
      const section = document.getElementById(id);
      if (section) sections.push({ id, el: section, link });
    });

    function updateActiveNav() {
      const scrollY = window.scrollY + 160;
      let current = sections[0];

      for (const s of sections) {
        if (s.el.offsetTop <= scrollY) {
          current = s;
        }
      }

      sectionNavLinks.forEach(l => l.classList.remove('section-nav__link--active'));
      if (current) current.link.classList.add('section-nav__link--active');
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }
});
