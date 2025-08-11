document.addEventListener('DOMContentLoaded', () => {
    const enterBtn   = document.getElementById('enterBtn');
    const albumEl    = document.getElementById('album');
    const btnPrev    = document.querySelector('.nav-prev');
    const btnNext    = document.querySelector('.nav-next');
    const restartBtn = document.getElementById('restartBtn');
  
    let flip = null;
  
    function haveLib() {
      return typeof window.St !== 'undefined' && typeof window.St.PageFlip !== 'undefined';
    }
  
    function initFlip() {
      if (flip) return;
      if (!albumEl || !haveLib()) return;
  
      albumEl.hidden = false;
  
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
      flip = new window.St.PageFlip(albumEl, {
        width: 440,
        height: 640,
        size: 'stretch',
        minWidth: 300,
        maxWidth: 1000,
        minHeight: 420,
        maxHeight: 1200,
        maxShadowOpacity: isMobile ? 0.2 : 0.3,
        showCover: true,   // portada sola
        flippingTime: isMobile ? 550 : 700,
        usePortrait: true, // en vertical, 1 página
        startZIndex: 10,
        autoSize: true
      });
  
      // cargar páginas
      flip.loadFromHTML(albumEl.querySelectorAll('.page'));
  
      // ———— control de navegación segun página actual ————
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
      
        btnPrev?.toggleAttribute('hidden', atStart || atEnd); // Oculta en inicio y fin
        btnNext?.toggleAttribute('hidden', atEnd);
        restartBtn?.toggleAttribute('hidden', !atEnd);
      }
      
      // escuchar flips (si el evento existe)
      try {
        flip.on('flip', () => updateNav());
      } catch(_) {
        // fallback: actualizar cada vez que usamos nuestros controles
      }
  
      // Flechas internas
      btnPrev?.addEventListener('click', (e) => { e.stopPropagation(); flip.flipPrev(); updateNav(); });
      btnNext?.addEventListener('click', (e) => { e.stopPropagation(); flip.flipNext(); updateNav(); });
  
      // Tap en lados del álbum
      albumEl.addEventListener('click', (e) => {
        if (e.target.closest('.nav-btn') || e.target.closest('#restartBtn')) return;
        const rect = albumEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) flip.flipPrev(); else flip.flipNext();
        updateNav();
      });
  
      // Botón "Volver a ver el álbum"
      restartBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        // página 1 = primera después de la portada
        flip.turnToPage(1);
        updateNav();
        setTimeout(() => albumEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      });
  
      // mantener estable en resize/orientación
      let t;
      const safeUpdate = () => { try { flip.update(); updateNav(); } catch(_){} };
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(safeUpdate, 120); });
      window.matchMedia('(max-width: 768px)').addEventListener?.('change', safeUpdate);
  
      // estado inicial (portada: sin prev, con next, sin restart)
      updateNav();
    }
  
    // Botón “Abrir álbum”
    enterBtn?.addEventListener('click', () => {
      initFlip();
      setTimeout(() => albumEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    });
  
    // Auto-iniciar también (por si no tocan el botón)
    initFlip();
  });
  