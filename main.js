/* ============================================================
   BAD NEIGHBOUR — main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     HERO VIDEO — skip first 1s on laptop/desktop
  ---------------------------------------------------------- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && window.matchMedia('(min-width: 769px)').matches) {
    const SKIP = 3;
    heroVideo.addEventListener('loadedmetadata', () => {
      heroVideo.currentTime = SKIP;
    });
    heroVideo.addEventListener('timeupdate', () => {
      if (heroVideo.currentTime < SKIP) heroVideo.currentTime = SKIP;
    });
  }

  /* ----------------------------------------------------------
     MOBILE NAV
  ---------------------------------------------------------- */
  const burger  = document.querySelector('.nav-burger');
  const overlay = document.querySelector('.nav-overlay');

  if (burger && overlay) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      overlay.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on any overlay link
    overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----------------------------------------------------------
     DRAG-TO-SCROLL PHOTO STRIP
  ---------------------------------------------------------- */
  const track = document.querySelector('.photo-strip-track');

  if (track) {
    let isDown   = false;
    let startX   = 0;
    let scrollLeft = 0;

    track.addEventListener('mousedown', e => {
      isDown = true;
      track.classList.add('is-dragging');
      startX     = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    document.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('is-dragging');
    });

    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.4;
      track.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    let touchStartX = 0;
    let touchScrollLeft = 0;

    track.addEventListener('touchstart', e => {
      touchStartX    = e.touches[0].pageX;
      touchScrollLeft = track.scrollLeft;
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      const diff = touchStartX - e.touches[0].pageX;
      track.scrollLeft = touchScrollLeft + diff;
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     INTERSECTION OBSERVER — FADE-UP
  ---------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-up');

  if (fadeEls.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    fadeEls.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     NAV ACTIVE STATE (menu.html)
  ---------------------------------------------------------- */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .nav-overlay a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (path === '/menu' && href === '/menu') {
      link.classList.add('active');
    } else if (path === '/about' && href === '/about') {
      link.classList.add('active');
    } else if (path === '/careers' && href === '/careers') {
      link.classList.add('active');
    } else if ((path === '/' || path === '') && href === '/') {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     LIGHTBOX
  ---------------------------------------------------------- */
  const lightbox     = document.getElementById('lightbox');
  const lbImg        = document.getElementById('lightbox-img');
  const lbClose      = document.getElementById('lightbox-close');
  const lbPrev       = document.getElementById('lightbox-prev');
  const lbNext       = document.getElementById('lightbox-next');
  const lbCounter    = document.getElementById('lightbox-counter');
  const stripPhotos  = Array.from(document.querySelectorAll('.strip-photo'));

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const img = stripPhotos[currentIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCounter.textContent = `${currentIndex + 1} / ${stripPhotos.length}`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + stripPhotos.length) % stripPhotos.length;
    openLightbox(currentIndex);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % stripPhotos.length;
    openLightbox(currentIndex);
  }

  // Prevent drag triggering click — only open if mouse barely moved
  if (stripPhotos.length) {
    let dragDist = 0;
    const track2 = document.getElementById('photo-strip-track');
    if (track2) {
      track2.addEventListener('mousedown', e => { dragDist = e.pageX; });
      track2.addEventListener('mouseup',   e => { dragDist = Math.abs(e.pageX - dragDist); });
    }

    stripPhotos.forEach((img, i) => {
      img.addEventListener('click', () => {
        if (dragDist > 10) return; // was a drag, not a click
        openLightbox(i);
      });
    });
  }

  if (lbClose)  lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)   lbPrev.addEventListener('click', showPrev);
  if (lbNext)   lbNext.addEventListener('click', showNext);

  if (lightbox) {
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', e => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  /* ----------------------------------------------------------
     CAROUSEL — force start after all images loaded, pause on hover
  ---------------------------------------------------------- */
  const carouselTracks = document.querySelectorAll('.photo-carousel-track');

  // Ensure animation is running once images have loaded and widths are known
  window.addEventListener('load', () => {
    carouselTracks.forEach(track => {
      track.style.animationPlayState = 'running';
    });
  });

  // Pause on hover
  carouselTracks.forEach(track => {
    track.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    track.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  });

  /* ----------------------------------------------------------
     INSTAGRAM FEED
  ---------------------------------------------------------- */
  const igScroll = document.getElementById('ig-feed-scroll');

  if (igScroll) {
    fetch('/api/instagram')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        if (!data.posts || !data.posts.length) return;

        data.posts.forEach(post => {
          const card = document.createElement('a');
          card.href = post.url;
          card.target = '_blank';
          card.rel = 'noopener';
          card.className = 'ig-card';

          if (post.video) {
            const video = document.createElement('video');
            video.src = post.video;
            video.poster = post.image;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.loading = 'lazy';
            card.addEventListener('mouseenter', () => video.play());
            card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
            card.appendChild(video);
          } else {
            const img = document.createElement('img');
            img.src = post.image;
            img.alt = post.caption.slice(0, 80) || 'Instagram post';
            img.loading = 'lazy';
            card.appendChild(img);
          }

          const overlay = document.createElement('div');
          overlay.className = 'ig-card-overlay';
          const caption = document.createElement('p');
          caption.textContent = post.caption.slice(0, 100) + (post.caption.length > 100 ? '...' : '');
          overlay.appendChild(caption);
          card.appendChild(overlay);

          igScroll.appendChild(card);
        });
      })
      .catch(() => {
        // Silently fail — section just stays empty
      });
  }

  /* ----------------------------------------------------------
     VIDEO — ensure autoplay on mobile (muted required)
  ---------------------------------------------------------- */
  document.querySelectorAll('video[autoplay]').forEach(v => {
    v.muted = true;
    v.play().catch(() => {/* autoplay blocked — fine */});
  });

});
