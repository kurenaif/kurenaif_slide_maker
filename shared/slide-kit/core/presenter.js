"use strict";
(() => {
  const kit = window.SlideKit ||= {};
  kit.createLessonPresenter = function ({ slides }) {
    if (!Array.isArray(slides) || slides.length === 0) throw new TypeError('At least one slide is required.');
    const $ = selector => document.querySelector(selector);
    let page = 0, motion = null;

    function fitPresentation() {
      const present = innerWidth > 850 && $('#speaker-notes').hidden;
      document.documentElement.classList.toggle('sk-presentation', present);
      $('#lesson').style.zoom = present ? String(Math.min(innerWidth/1980, innerHeight/1020)) : '';
    }

    function updateURL() {
      const url = new URL(location.href);
      url.searchParams.set('step', String(page));
      url.searchParams.set('cue', String(motion?.snapshot.position || 0));
      try { history.replaceState(null, '', url); } catch { /* Some file:// viewers prohibit history writes. */ }
    }

    function syncControls() {
      if (!motion) return;
      const s = motion.snapshot;
      $('#counter').textContent = `${page+1} / ${slides.length} · ${s.position} / ${s.cueCount}`;
      $('#next').disabled = page === slides.length-1 && s.completed;
      $('#next').title = s.completed ? '次のページ（→ / Space）' : '次の動き（→ / Space）。動作中なら完了して停止';
      $('#previous').disabled = page === 0 && s.position === 0 && s.elapsed === 0 && !s.running;
      $('#play').textContent = s.running ? '停止' : '連続再生';
      $('#play').disabled = s.cueCount === 0;
      $('#play').setAttribute('aria-pressed', String(s.running));
      updateURL();
    }

    function showSlide(index, completedCues = 0) {
      motion?.destroy(); motion = null;
      page = Math.max(0, Math.min(slides.length-1, index));
      const slide = slides[page];
      document.body.dataset.step = String(page);
      $('#slide-title').textContent = slide.title;
      $('#note-body').textContent = slide.notes;
      $('#stage').replaceChildren();
      motion = slide.mount($('#stage'), syncControls);
      // Deep links are restored as completed states; opening a link never plays.
      const count = Math.max(0, Math.min(motion.snapshot.cueCount, completedCues));
      for (let i = 0; i < count; i++) {
        const before = motion.snapshot.position;
        motion.advance();
        if (motion.snapshot.position === before) motion.advance();
      }
      for (const [i, button] of [...$('#chapters').children].entries()) {
        if (i === page) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      }
      const scroll = $('#stage .diagram-scroll');
      if (scroll) scroll.scrollLeft = 0;
      typesetCurrentMath();
      fitPresentation(); syncControls();
    }

    function next() { if (!motion.advance() && page < slides.length-1) showSlide(page+1); }
    function previous() {
      if (!motion.back() && page > 0) { showSlide(page-1); motion.finish(); }
    }
    function toggleNotes() {
      motion.pause();
      $('#speaker-notes').hidden = !$('#speaker-notes').hidden;
      $('#notes-button').setAttribute('aria-expanded', String(!$('#speaker-notes').hidden));
      fitPresentation();
    }
    async function toggleFullscreen() {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch { $('#control-status').textContent = 'この表示環境では、ブラウザの全画面操作を使ってください。'; }
    }

    slides.forEach((slide, index) => {
      const button = document.createElement('button');
      const number = document.createElement('span'); number.className = 'chapter-number';
      number.textContent = String(index+1).padStart(2, '0');
      button.append(number, slide.chapter); button.addEventListener('click', () => showSlide(index));
      $('#chapters').append(button);
    });
    $('#previous').addEventListener('click', previous);
    $('#next').addEventListener('click', next);
    $('#reset').addEventListener('click', () => motion.reset());
    $('#play').addEventListener('click', () => motion.toggle());
    $('#notes-button').addEventListener('click', toggleNotes);
    $('#fullscreen').addEventListener('click', toggleFullscreen);

    window.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (event.key === ' ' && target.closest?.('button, a, summary')) return;
      const actions = { ArrowRight: next, ' ': next, ArrowLeft: previous,
        r: () => motion.reset(), p: () => motion.toggle(), n: toggleNotes, f: toggleFullscreen,
        Home: () => showSlide(0), End: () => { showSlide(slides.length-1); motion.finish(); } };
      const action = actions[event.key] || actions[event.key.toLowerCase()];
      if (!action) return;
      event.preventDefault();
      if (!event.repeat) action();
    });
    window.addEventListener('resize', fitPresentation);
    document.addEventListener('visibilitychange', () => { if (document.hidden) motion.pause(); });
    window.addEventListener('pagehide', () => motion.pause());
    document.addEventListener('fullscreenchange', () => {
      $('#fullscreen').textContent = document.fullscreenElement ? '全画面を終了' : '全画面';
      fitPresentation();
    });


    function typesetCurrentMath() {
      const roots = [$('#stage'), $('#speaker-notes')];
      window.MathJax?.typesetPromise?.(roots).catch(() => {});
    }
    window.addEventListener('load', typesetCurrentMath);

    const params = new URLSearchParams(location.search);
    const rawStep = Number(params.get('step') ?? 0);
    const initialPage = Number.isInteger(rawStep) ? rawStep : 0;
    const rawCue = Number(params.get('cue') ?? 0);
    showSlide(initialPage < 0 ? 0 : initialPage, Number.isInteger(rawCue) ? rawCue : 0);

    // A small inspection API for authoring and browser verification.
    return {
      showSlide, next, previous,
      get snapshot() { return { page, slide: slides[page].id, ...motion.snapshot }; },
      get motion() { return motion; },
    };

  };
})();
