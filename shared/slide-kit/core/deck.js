/**
 * Small framework-free deck controller for step-by-step technical slides.
 */
export function readStepParam(name = "step", fallback = 0) {
  const value = Number(new URLSearchParams(window.location.search).get(name));
  return Number.isInteger(value) ? value : fallback;
}

function isEditableTarget(target) {
  return target instanceof HTMLElement
    && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export function createStepDeck({ length, initialStep = 0, onRender }) {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error("createStepDeck requires a positive integer length.");
  }

  let step = Math.max(0, Math.min(initialStep, length - 1));

  const api = {
    get step() { return step; },
    get lastStep() { return length - 1; },
    get isFirst() { return step === 0; },
    get isLast() { return step === length - 1; },
    render() {
      onRender(step, api);
    },
    next() {
      step = Math.min(step + 1, length - 1);
      api.render();
    },
    previous() {
      step = Math.max(step - 1, 0);
      api.render();
    },
    reset() {
      step = 0;
      api.render();
    },
    setStep(nextStep) {
      if (!Number.isInteger(nextStep)) return;
      step = Math.max(0, Math.min(nextStep, length - 1));
      api.render();
    },
    bindKeyboard({ target = window, resetKey = "r", next = api.next, previous = api.previous, reset = api.reset } = {}) {
      const listener = (event) => {
        if (isEditableTarget(event.target)) return;
        if (event.key === "ArrowRight" || event.key === " ") {
          event.preventDefault();
          next();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          previous();
        } else if (resetKey && event.key.toLowerCase() === resetKey.toLowerCase()) {
          reset();
        }
      };
      target.addEventListener("keydown", listener);
      return () => target.removeEventListener("keydown", listener);
    },
  };

  return api;
}

/**
 * Moves a slide's supporting note below the stage only in presentation mode.
 * The source node is restored before every slide render and when the viewport
 * leaves the presentation breakpoint.
 */
export function createExternalNoteDock({ panel, footer, mediaQuery, selectorForStep, typeset = () => {} }) {
  const query = typeof mediaQuery === "string" ? window.matchMedia(mediaQuery) : mediaQuery;
  let origin = null;

  function restore() {
    if (!origin) return;
    const { element, parent, nextSibling } = origin;
    parent.insertBefore(element, nextSibling);
    origin = null;
    footer.replaceChildren();
  }

  function sync(step) {
    restore();
    if (!query.matches) return;

    const selector = selectorForStep(step);
    const element = selector ? panel.querySelector(selector) : null;
    if (!element) return;

    origin = { element, parent: element.parentNode, nextSibling: element.nextSibling };
    footer.append(element);
    typeset(footer);
  }

  const onChange = () => {
    if (!query.matches) restore();
  };
  query.addEventListener("change", onChange);

  return {
    restore,
    sync,
    destroy() {
      restore();
      query.removeEventListener("change", onChange);
    },
  };
}
