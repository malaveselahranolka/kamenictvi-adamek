/**
 * Kamenictví Adámek
 * JavaScript pro navigaci, scroller vzorků, filtraci referencí, lightbox a mapu
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. Sentinel pro linku v headeru (.is-scrolled)
  // ========================================================================
  const topSentinel = document.getElementById('top-sentinel');
  const header = document.querySelector('.header');

  if (topSentinel && header && 'IntersectionObserver' in window) {
    const headerObserver = new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }, { threshold: 0 });
    headerObserver.observe(topSentinel);
  }

  // ========================================================================
  // 2. Mobilní menu
  // ========================================================================
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuBtn && mobileMenu) {
    const toggleMenu = (open) => {
      const willOpen = typeof open === 'boolean'
        ? open
        : menuBtn.getAttribute('aria-expanded') !== 'true';

      menuBtn.setAttribute('aria-expanded', String(willOpen));
      menuBtn.setAttribute('aria-label', willOpen ? 'Zavřít menu' : 'Menu');

      if (willOpen) {
        mobileMenu.removeAttribute('hidden');
      } else {
        mobileMenu.setAttribute('hidden', '');
      }
    };

    menuBtn.addEventListener('click', () => toggleMenu());

    // Esc zavře menu a vrátí fokus na tlačítko
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
        menuBtn.focus();
      }
    });

    // Klik na jakýkoli odkaz v panelu zavře menu
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Při >= 960px se panel nepoužívá
    const mediaQueryDesktop = window.matchMedia('(min-width: 960px)');
    const handleBreakpoint = (e) => {
      if (e.matches && menuBtn.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
      }
    };
    if (mediaQueryDesktop.addEventListener) {
      mediaQueryDesktop.addEventListener('change', handleBreakpoint);
    } else {
      mediaQueryDesktop.addListener(handleBreakpoint);
    }
  }

  // ========================================================================
  // 3. Vzorky kamene - horizontální scroller se šipkami (Index)
  // ========================================================================
  const setupScroller = (scroller, prev, next, itemSelector) => {
    if (!scroller || !prev || !next) return;
    const updateButtons = () => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      prev.disabled = scroller.scrollLeft <= 5;
      next.disabled = scroller.scrollLeft >= maxScroll - 5;
    };
    const step = () => {
      const item = scroller.querySelector(itemSelector);
      const gap = parseFloat(getComputedStyle(scroller).columnGap) || 16;
      return item ? (item.getBoundingClientRect().width + gap) * Math.max(1, Math.floor(scroller.clientWidth / 2 / (item.getBoundingClientRect().width + gap))) : scroller.clientWidth * 0.75;
    };
    const go = (dir) => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scroller.scrollBy({ left: step() * dir, behavior: reduce ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    scroller.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  };
  setupScroller(document.getElementById('stoneScroller'), document.getElementById('stonePrev'), document.getElementById('stoneNext'), '.stone-item');
  setupScroller(document.getElementById('workScroller'), document.getElementById('workPrev'), document.getElementById('workNext'), '.work');

  // Galerie realizací: tažení myší
  const works = document.getElementById('workScroller');
  if (works) {
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let moved = 0;
    works.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startLeft = works.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) works.classList.add('is-dragging');
      works.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      requestAnimationFrame(() => works.classList.remove('is-dragging'));
    });
    works.addEventListener('click', (e) => {
      if (moved > 4) e.preventDefault();
    }, true);
  }

  // ========================================================================
  // 4. Filtrační taby (Reference)
  // ========================================================================
  const tablist = document.querySelector('[role="tablist"]');
  const tabs = tablist ? Array.from(tablist.querySelectorAll('[role="tab"]')) : [];
  const galleryItems = Array.from(document.querySelectorAll('#galerie .gallery-item'));

  if (tabs.length > 0 && galleryItems.length > 0) {
    const filterGallery = (cat, updateHash = true) => {
      tabs.forEach((tab) => {
        const isActive = tab.dataset.filter === cat;
        tab.setAttribute('aria-selected', String(isActive));
        tab.classList.toggle('is-active', isActive);
      });

      let shown = 0;
      galleryItems.forEach((item) => {
        const itemCat = item.getAttribute('data-cat');
        item.classList.remove('is-entering');
        if (cat === 'all' || itemCat === cat) {
          item.removeAttribute('hidden');
          if (updateHash) {
            item.style.setProperty('--d', Math.min(shown, 12) * 40 + 'ms');
            void item.offsetWidth;
            item.classList.add('is-entering');
          }
          shown++;
        } else {
          item.setAttribute('hidden', '');
        }
      });

      if (updateHash) {
        if (cat === 'all') {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
          history.replaceState(null, '', '#' + cat);
        }
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.filter || 'all';
        filterGallery(cat, true);
      });

      // Klávesy doleva a doprava mezi taby
      tab.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        }

        if (targetIndex !== null) {
          e.preventDefault();
          tabs[targetIndex].focus();
          const targetCat = tabs[targetIndex].dataset.filter || 'all';
          filterGallery(targetCat, true);
        }
      });
    });

    // Načtení podle hash kotvy
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      const matchingTab = tabs.find(tab => tab.dataset.filter === initialHash);
      if (matchingTab) {
        filterGallery(initialHash, false);
      }
    }
  }

  // ========================================================================
  // 5. Lightbox (<dialog>)
  // ========================================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxCaption = document.getElementById('lightboxCaption');

  if (lightbox && lightboxImg) {
    let lastTriggerItem = null;
    let currentIndex = -1;

    const getVisibleGalleryItems = () => {
      return Array.from(document.querySelectorAll('#galerie .gallery-item')).filter((item) => {
        return !item.hidden && !item.closest('[hidden]');
      });
    };

    const updateLightbox = (items) => {
      if (currentIndex < 0 || currentIndex >= items.length) return;
      const currentItem = items[currentIndex];
      const fullSrc = currentItem.getAttribute('data-full');
      const caption = currentItem.getAttribute('data-caption') || '';

      lightboxImg.src = fullSrc;
      lightboxImg.alt = caption;
      if (lightboxCaption) {
        lightboxCaption.textContent = caption;
      }
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentIndex + 1} / ${items.length}`;
      }
    };

    const showPrev = () => {
      const items = getVisibleGalleryItems();
      if (items.length === 0) return;
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      updateLightbox(items);
    };

    const showNext = () => {
      const items = getVisibleGalleryItems();
      if (items.length === 0) return;
      currentIndex = (currentIndex + 1) % items.length;
      updateLightbox(items);
    };

    const closeLightbox = () => {
      lightbox.close();
    };

    // Otevření lightboxu po kliku na položku galerie
    document.addEventListener('click', (e) => {
      const item = e.target.closest('#galerie .gallery-item');
      if (item && !item.hidden && !item.closest('[hidden]')) {
        const items = getVisibleGalleryItems();
        const index = items.indexOf(item);
        if (index !== -1) {
          currentIndex = index;
          lastTriggerItem = item;
          updateLightbox(items);
          lightbox.showModal();
        }
      }
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', showPrev);
    }
    if (lightboxNext) {
      lightboxNext.addEventListener('click', showNext);
    }

    // Klávesy doleva / doprava v lightboxu
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNext();
      }
    });

    // Klik na pozadí dialogu zavře lightbox
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Po zavření vrátit fokus na spouštěcí prvek
    lightbox.addEventListener('close', () => {
      lightboxImg.src = '';
      if (lastTriggerItem) {
        lastTriggerItem.focus();
        lastTriggerItem = null;
      }
    });
  }

  // ========================================================================
  // 6. Mapa fasáda (Kontakt)
  // ========================================================================
  const mapFacade = document.getElementById('mapFacade');
  const loadMapBtn = document.getElementById('loadMapBtn');

  if (mapFacade && loadMapBtn) {
    loadMapBtn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2559.5!2d17.3331!3d50.2928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4712b1a0a0a0a0a0%3A0x0!2sSokolsk%C3%A1+595%2C+Mikulovice!5e0!3m2!1scs!2scz!4v1';
      iframe.loading = 'lazy';
      iframe.title = 'Mapa: Sokolská 595, Mikulovice';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.setAttribute('allowfullscreen', '');
      iframe.className = 'map-facade__iframe';

      mapFacade.innerHTML = '';
      mapFacade.appendChild(iframe);
    });
  }

  // ---------------------------------------------------------
  // Pohyb: odhalování při scrollu, lupa vzorků, počítadla
  // ---------------------------------------------------------
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const groups = [
      '.section-header', '.bento-grid > .tile', '.about__content > *', '.about__grid > .media',
      '.stones-header', '.stone-item', '.coverage__grid > div:first-child > *', '.contact-panel',
      '.price-panel', '.page-header > *', '.contact-row', '.map-facade',
      '.process__title', '.process__step', '.coverage__chips > li'
    ];
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    groups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const siblings = Array.from(el.parentElement.children).filter((c) => c.matches(selector));
        el.style.setProperty('--d', Math.min(siblings.indexOf(el), 6) * 80 + 'ms');
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    });

    // Mapa působnosti: linky se vykreslí postupně
    const mapPanel = document.querySelector('.coverage__map-panel');
    if (mapPanel) {
      mapPanel.querySelectorAll('.map-line').forEach((line, i) => line.style.setProperty('--d', i * 90 + 'ms'));
      mapPanel.querySelectorAll('.map-city').forEach((dot, i) => dot.style.setProperty('--d', i * 90 + 'ms'));
      revealObserver.observe(mapPanel);
    }

    // Počítadla 30+ a 80+
    const counters = document.querySelectorAll('.about__stat-val');
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        const el = entry.target;
        const match = el.textContent.trim().match(/^(\d+)(.*)$/);
        if (!match) return;
        const target = parseInt(match[1], 10);
        const suffix = match[2];
        const start = performance.now();
        const duration = 1400;
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => {
      el.style.fontVariantNumeric = 'tabular-nums';
      countObserver.observe(el);
    });
  }

  // Lupa: přiblížení vzorku podle pozice kurzoru
  document.querySelectorAll('.stone-item__media').forEach((media) => {
    media.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = media.getBoundingClientRect();
      media.style.setProperty('--lx', ((e.clientX - r.left) / r.width) * 100 + '%');
      media.style.setProperty('--ly', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  // ---------------------------------------------------------
  // Hero: střídání fotografií realizací
  // ---------------------------------------------------------
  const hero = document.querySelector('.hero');
  const slides = hero ? Array.from(hero.querySelectorAll('.hero__slide')) : [];
  const dots = hero ? Array.from(hero.querySelectorAll('.hero__dot')) : [];
  if (slides.length > 1) {
    const DUR = 6000;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 639px)');
    mobile.addEventListener('change', () => { show(0); schedule(); });
    hero.style.setProperty('--slide-dur', DUR / 1000 + 's');
    let index = 0;
    let timer = 0;
    let visible = true;
    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === index));
      dots.forEach((d, k) => {
        d.classList.toggle('is-active', k === index);
        if (k === index) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    };
    const schedule = () => {
      clearTimeout(timer);
      if (reduce || !visible || document.hidden || mobile.matches) return;
      timer = setTimeout(() => {
        show(index + 1);
        schedule();
      }, DUR);
    };
    dots.forEach((d, k) =>
      d.addEventListener('click', () => {
        show(k);
        schedule();
      }),
    );
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        hero.classList.toggle('is-paused', !visible);
        schedule();
      }).observe(hero);
    }
    schedule();
  }

});
