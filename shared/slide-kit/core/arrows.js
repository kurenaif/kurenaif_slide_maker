"use strict";
(() => {
  const kit = window.SlideKit ||= {};
  const { clamp, ease } = kit;
  let arrowMaskSequence = 0;

  // Reveal with a mask, so dashed lines keep their pattern. Markers are withheld
  // until their endpoint is reached. Use centre=true for a double-headed arrow.
  function createArrow(path, { centre = false } = {}) {
    const svg = path.ownerSVGElement;
    const ns = 'http://www.w3.org/2000/svg';
    let defs = svg.querySelector('defs');
    if (!defs) { defs = document.createElementNS(ns, 'defs'); svg.prepend(defs); }
    const mask = document.createElementNS(ns, 'mask');
    const id = `cue-arrow-mask-${++arrowMaskSequence}`;
    mask.id = id;
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    const vb = svg.viewBox.baseVal;
    for (const [key, value] of Object.entries({ x: vb.x - 32, y: vb.y - 32,
      width: vb.width + 64, height: vb.height + 64 })) mask.setAttribute(key, value);
    const reveal = document.createElementNS(ns, 'path');
    reveal.setAttribute('d', path.getAttribute('d'));
    reveal.setAttribute('fill', 'none'); reveal.setAttribute('stroke', 'white');
    reveal.setAttribute('stroke-width', '32'); reveal.setAttribute('pathLength', '1');
    mask.append(reveal); defs.append(mask);
    const markers = ['marker-start', 'marker-end'].map(name => [name, path.getAttribute(name)]);
    const paint = raw => {
      const p = clamp(raw);
      path.style.visibility = p > 0 ? 'visible' : 'hidden';
      path.dataset.progress = p.toFixed(4);
      if (p < 1) {
        path.setAttribute('mask', `url(#${id})`);
        reveal.setAttribute('stroke-dasharray', centre ? `0 ${(1-p)/2} ${p} 2` : '1 1');
        reveal.setAttribute('stroke-dashoffset', centre ? '0' : String(1-p));
      } else path.removeAttribute('mask');
      for (const [name, value] of markers) {
        if (p >= 1 && value) path.setAttribute(name, value); else path.removeAttribute(name);
      }
    };
    paint(0);
    return { paint, length: path.getTotalLength(), destroy: () => mask.remove() };
  }

  function paintOutline(rect, progress) {
    const p = clamp(progress);
    rect.style.visibility = p > 0 ? 'visible' : 'hidden';
    rect.setAttribute('pathLength', '1');
    rect.setAttribute('stroke-dasharray', '1 1');
    rect.setAttribute('stroke-dashoffset', String(1 - p));
    rect.dataset.progress = p.toFixed(4);
  }

  // One easing curve across the complete route, not one curve per segment.
  function createArrowCycle(paths) {
    const arrows = paths.map(path => createArrow(path));
    const total = arrows.reduce((sum, arrow) => sum + arrow.length, 0);
    return {
      paint(progress) {
        let distance = ease(progress) * total;
        for (const arrow of arrows) {
          arrow.paint(clamp(distance / arrow.length)); distance -= arrow.length;
        }
      },
      destroy() { arrows.forEach(arrow => arrow.destroy()); },
    };
  }

  Object.assign(kit, { createArrow, paintOutline, createArrowCycle });
})();
