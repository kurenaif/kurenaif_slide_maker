"use strict";
(() => {
  const kit = window.SlideKit ||= {};
  // Adapted from the heap lesson's cue-motion.js. Rendering is deterministic:
  // (-1, 1) means the initial state; (i, p) means progress p through cue i.
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => { const p = clamp(value); return p * p * (3 - 2 * p); };

  function createCueMotion({ cues, render, speed = 1.5, onChange = () => {},
    reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches }) {
    if (!Array.isArray(cues) || cues.some(c => !Number.isFinite(c.duration) || c.duration <= 0)) {
      throw new TypeError('Each cue needs a positive duration in milliseconds.');
    }
    if (!Number.isFinite(speed) || speed <= 0) throw new TypeError('speed must be positive.');
    let position = 0, elapsed = 0, running = false, continuous = false;
    let frame = null, last = null, destroyed = false;
    const rest = () => render(position - 1, 1);
    const halt = () => {
      running = false; cancelAnimationFrame(frame); frame = last = null;
    };
    const complete = () => { render(position, 1); position++; elapsed = 0; };
    const tick = now => {
      if (!running || destroyed) return;
      if (last !== null) elapsed += Math.min(100, now - last) * speed;
      last = now;
      render(position, clamp(elapsed / cues[position].duration));
      if (elapsed >= cues[position].duration) {
        complete();
        if (!continuous || position === cues.length) { halt(); onChange(); return; }
        render(position, 0); onChange();
      }
      frame = requestAnimationFrame(tick);
    };
    const run = () => {
      if (destroyed || position === cues.length) return;
      if (reducedMotion()) {
        complete(); continuous = false; halt(); onChange(); return;
      }
      running = true; last = null;
      render(position, elapsed / cues[position].duration);
      frame = requestAnimationFrame(tick); onChange();
    };
    const api = {
      advance() {
        if (destroyed || position === cues.length) return false;
        continuous = false;
        if (running) { halt(); complete(); onChange(); } else run();
        return true;
      },
      back() {
        if (destroyed) return false;
        const midCue = running || elapsed > 0;
        if (!midCue && position === 0) return false;
        halt(); continuous = false;
        if (!midCue) position--;
        elapsed = 0; rest(); onChange(); return true;
      },
      reset() {
        if (destroyed) return;
        halt(); continuous = false; position = elapsed = 0; rest(); onChange();
      },
      finish() {
        if (destroyed) return;
        halt(); continuous = false; position = cues.length; elapsed = 0; rest(); onChange();
      },
      toggle() {
        if (destroyed || cues.length === 0) return;
        if (running) { api.pause(); return; }
        if (position === cues.length) { position = elapsed = 0; rest(); }
        continuous = true; run();
      },
      pause() { if (!destroyed) { halt(); continuous = false; onChange(); } },
      destroy() { destroyed = true; halt(); },
      get snapshot() {
        return { position, elapsed, running, continuous, cueCount: cues.length,
          completed: position === cues.length };
      },
    };
    rest();
    return api;
  }

  // Read progress without depending on previously rendered frames. Safe to rewind.
  function cueProgress(index, progress, target) {
    return index > target ? 1 : index === target ? clamp(progress) : 0;
  }

  Object.assign(kit, { clamp, ease, createCueMotion, cueProgress });
})();
