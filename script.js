document.addEventListener('DOMContentLoaded', () => {
    const albumEl    = document.getElementById('album');
    const btnPrev    = document.querySelector('.nav-prev');
    const btnNext    = document.querySelector('.nav-next');
    const restartBtn = document.getElementById('restartBtn');
    const tapLeft    = document.querySelector('.tap-left');
    const tapRight   = document.querySelector('.tap-right');
  
    let flip = null;
    const mqMobile = window.matchMedia('(max-width: 768px)');
  
    function haveLib() {
      return typeof window.St !== 'undefined' && typeof window.St.PageFlip !== 'undefined';
    }
  
    function initFlip() {
      if (flip) return;
      if (!albumEl || !haveLib()) return;
  
      albumEl.hidden = false;
  
      const isMobile = mqMobile.matches;
  
      flip = new window.St.PageFlip(albumEl, {
        width: 440,
        height: 640,
        size: 'stretch',
        minWidth: 300,
        maxWidth: 1000,
        minHeight: 420,
        maxHeight: 1200,
        maxShadowOpacity: isMobile ? 0.2 : 0.3,
        showCover: true,
        flippingTime: isMobile ? 800 : 1050, // más lento
        usePortrait: true,
        startZIndex: 10,
        autoSize: true
      });
  
      // Cargar páginas
      flip.loadFromHTML(albumEl.querySelectorAll('.page'));
  
      const pagesTotal = albumEl.querySelectorAll('.page').length;
  
      function getIndexSafe() {
        try {
          if (typeof flip.getCurrentPageIndex === 'function') return flip.getCurrentPageIndex();
          if (flip?.state?.currentPageIndex != null) return flip.state.currentPageIndex;
        } catch(_) {}
        return 0;
      }
  
      function updateNav() {
        const i = getIndexSafe();
        const atStart = i <= 0;
        const atEnd   = i >= pagesTotal - 1;
  
        if (mqMobile.matches) {
          btnPrev?.setAttribute('hidden', '');
          btnNext?.setAttribute('hidden', '');
        } else {
          btnPrev?.toggleAttribute('hidden', atStart || atEnd);
          btnNext?.toggleAttribute('hidden', atEnd);
        }
        restartBtn?.toggleAttribute('hidden', !atEnd);

        const footer = document.getElementById('albumFooter');
        if (footer) {
          if (atStart || atEnd) {
            footer.classList.remove('visible');
            setTimeout(() => footer.hidden = true, 300); // espera que termine fade
          } else {
            footer.hidden = false;
            setTimeout(() => footer.classList.add('visible'), 50); // delay para animar
          }
        }
      }
  
      try { flip.on('flip', updateNav); } catch(_) {}
  
      // Botones flecha (desktop)
      btnPrev?.addEventListener('click', (e) => { e.stopPropagation(); flip.flipPrev(); updateNav(); });
      btnNext?.addEventListener('click', (e) => { e.stopPropagation(); flip.flipNext(); updateNav(); });
  
      // Zonas táctiles invisibles (mobile)
      tapLeft?.addEventListener('click',  (e) => { e.stopPropagation(); flip.flipPrev(); updateNav(); });
      tapRight?.addEventListener('click', (e) => { e.stopPropagation(); flip.flipNext(); updateNav(); });
  
      // Botón "Volver a ver"
      restartBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        flip.turnToPage(0);                 // ⬅️ antes 1, ahora 0 (portada)
        updateNav();
        setTimeout(() => albumEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    });
  
  
      // Resize/orientación
      let t;
      const safeUpdate = () => { try { flip.update(); updateNav(); } catch(_){} };
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(safeUpdate, 120); });
      mqMobile.addEventListener?.('change', safeUpdate);
  
      updateNav();
    }
  
    // Auto-iniciar
    initFlip();
  });
  
  function startHeartRain() {
    const container = document.getElementById('heartRain');
    let interval = setInterval(() => {
      const heart = document.createElement('span');
      heart.classList.add('heart');
      heart.textContent = '❤️';
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
      heart.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
      container.appendChild(heart);
  
      setTimeout(() => {
        heart.remove();
      }, 2000);
    }, 50);
  
    // Parar después de 2 segundos
    setTimeout(() => {
      clearInterval(interval);
      setTimeout(() => container.remove(), 2000); // quitar div
    }, 4000);
  }
  
  // Iniciar apenas carga
  document.addEventListener('DOMContentLoaded', startHeartRain);
