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
        flip.turnToPage(1);
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
  
