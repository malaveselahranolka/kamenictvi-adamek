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

  // --- Header scroll effect ---
  const header = document.getElementById('header');
  const hero = document.getElementById('hero');
  if (header && !header.classList.contains('header--scrolled')) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 50;
      header.classList.toggle('header--scrolled', scrolled);

      // Show section-nav when hero has scrolled out of view
      if (hero) {
        const heroPast = hero.getBoundingClientRect().bottom <= header.offsetHeight;
        header.classList.toggle('header--with-nav', heroPast);
      }
    }, { passive: true });
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

  // --- Scroll-padding: aktualizovat při každé změně výšky headeru ---
  if (header) {
    function updateScrollPadding() {
      document.documentElement.style.scrollPaddingTop = header.offsetHeight + 10 + 'px';
    }
    updateScrollPadding();
    window.addEventListener('scroll', updateScrollPadding, { passive: true });
    // ResizeObserver zachytí rozbalení/sbalení section-navu (0.35s animace)
    if (window.ResizeObserver) new ResizeObserver(updateScrollPadding).observe(header);
  }

  // --- Section nav links: přesný scroll s odečtením výšky headeru ---
  document.querySelectorAll('.section-nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target || !header) return;
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

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
