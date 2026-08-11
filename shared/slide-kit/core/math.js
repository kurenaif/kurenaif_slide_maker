/** Request MathJax to typeset dynamically inserted or moved slide content. */
export function typesetMath(root = document.body) {
  if (!window.MathJax?.typesetPromise) return Promise.resolve();
  return window.MathJax.typesetPromise([root]).catch(() => {});
}

export function configureInlineMath() {
  window.MathJax = {
    tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"]] },
    options: { skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"] },
  };
}
