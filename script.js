document.addEventListener('DOMContentLoaded', () => {
    const enterBtn   = document.getElementById('enterBtn');
    const albumEl    = document.getElementById('album');
    const btnPrev    = document.querySelector('.nav-prev');
    const btnNext    = document.querySelector('.nav-next');
    const restartBtn = document.getElementById('restartBtn');
  
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
        showCover: true,                 // portada sola
        flippingTime: isMobile ? 800 : 1050, // más lento
        usePortrait: true,               // 1 página en vertical
        startZIndex: 10,
        autoSize: true
      });
  
      // Cargar páginas
      flip.loadFromHTML(albumEl.querySelectorAll('.page'));
  
      // ---- Navegación según página actual ----
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
          // En móvil: flechas siempre ocultas; solo tap en costados
          btnPrev?.setAttribute('hidden', '');
          btnNext?.setAttribute('hidden', '');
        } else {
          // En desktop: ocultar flechas en inicio/fin
          btnPrev?.toggleAttribute('hidden', atStart || atEnd);
          btnNext?.toggleAttribute('hidden', atEnd);
        }
  
        // Botón "Volver a ver el álbum" solo al final
        restartBtn?.toggleAttribute('hidden', !atEnd);
      }
  
      // Evento de cambio de página (si está disponible)
      try { flip.on('flip', updateNav); } catch(_) {}
  
      // Flechas internas (desktop)
      btnPrev?.addEventListener('click', (e) => { e.stopPropagation(); flip.flipPrev(); updateNav(); });
      btnNext?.addEventListener('click', (e) => { e.stopPropagation(); flip.flipNext(); updateNav(); });
  
      // Tap/click en los lados del álbum
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
        // Ir a la primera página después de la portada
        flip.turnToPage(1);
        updateNav();
        setTimeout(() => albumEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      });
  
      // Mantener estable en resize/orientación
      let t;
      const safeUpdate = () => { try { flip.update(); updateNav(); } catch(_){} };
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(safeUpdate, 120); });
      mqMobile.addEventListener?.('change', safeUpdate);
  
      // Estado inicial
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
  
