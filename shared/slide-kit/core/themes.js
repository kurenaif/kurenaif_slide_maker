"use strict";
(() => {
  const themes = [
    ['midnight-dark', 'Midnight · 紺'],
    ['classic-light', 'Classic · 白'],
    ['formal-witch', 'Formal Witch · 白黒'],
  ];
  const root = document.documentElement;
  const valid = value => themes.some(([id]) => id === value);
  const requested = new URLSearchParams(location.search).get('theme');
  if (valid(requested)) root.dataset.theme = requested;

  // Only change CSS tokens: the current scene and its animation remain intact.
  document.addEventListener('DOMContentLoaded', () => {
    const pickers = [...document.querySelectorAll('[data-theme-picker]')];
    for (const picker of pickers) {
      picker.replaceChildren(...themes.map(([id, label]) => new Option(label, id)));
      picker.value = root.dataset.theme;
      picker.addEventListener('change', () => {
        if (!valid(picker.value)) return;
        root.dataset.theme = picker.value;
        for (const other of pickers) other.value = picker.value;
        const url = new URL(location.href);
        url.searchParams.set('theme', picker.value);
        try { history.replaceState(null, '', url); } catch { /* Restricted file viewers can still switch the current view. */ }
      });
    }
  });
})();
