export function createNote(content, className = "") {
  const note = document.createElement("div");
  note.className = `sk-note ${className}`.trim();
  note.innerHTML = content;
  return note;
}

export function createCurveCard({ label, color = "var(--soft)", glyph, className = "" }) {
  const card = document.createElement("article");
  card.className = `sk-curve-card ${className}`.trim();
  card.style.cssText = [
    "border: 2px solid currentColor",
    "border-radius: 8px",
    "background: var(--paper)",
    "display: grid",
    "grid-template-rows: auto 1fr",
    "place-items: center",
    "padding: 12px",
    `color: ${color}`,
  ].join(";");
  card.innerHTML = `<div class="sk-curve-card__label">${label}</div>`;
  if (glyph) card.append(glyph);
  return card;
}
