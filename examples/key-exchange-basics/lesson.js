function readStepParam() {
  const value = Number(new URLSearchParams(window.location.search).get("step"));
  return Number.isInteger(value) ? value : 0;
}

function typesetMath(root) {
  return window.MathJax?.typesetPromise?.([root]).catch(() => {});
}

function createStepDeck({ length, initialStep, onRender }) {
  let step = Math.max(0, Math.min(initialStep, length - 1));
  const api = {
    get isFirst() { return step === 0; },
    get isLast() { return step === length - 1; },
    get lastStep() { return length - 1; },
    render() { onRender(step, api); },
    next() { step = Math.min(step + 1, length - 1); api.render(); },
    previous() { step = Math.max(step - 1, 0); api.render(); },
  };
  return api;
}

const steps = [
  {
    eyebrow: "Diffie–Hellman key exchange",
    title: "共通の出発点",
    scene: `<div class="people"><article class="person alice"><h2>Alice</h2><p>秘密 <i>a</i></p></article><section class="public"><span>公開値</span><strong><i>g</i></strong><small>誰でも見られる</small></section><article class="person bob"><h2>Bob</h2><p>秘密 <i>b</i></p></article></div>`,
    note: "二人は公開値 <i>g</i> を共有し、それぞれ秘密の指数 <i>a</i>、<i>b</i> を選ぶ。",
  },
  {
    eyebrow: "Diffie–Hellman key exchange",
    title: "公開値を交換する",
    scene: `<div class="exchange"><article class="person alice"><h2>Alice</h2><p>送る: <i>g</i><sup>a</sup></p><strong>共有鍵: <i>g</i><sup>ab</sup></strong></article><section class="channel"><span>公開チャネル</span><div><i>g</i><sup>a</sup> →</div><div>← <i>g</i><sup>b</sup></div><small>秘密 <i>a</i>、<i>b</i> は送らない</small></section><article class="person bob"><h2>Bob</h2><p>送る: <i>g</i><sup>b</sup></p><strong>共有鍵: <i>g</i><sup>ab</sup></strong></article></div>`,
    note: "交換するのは <i>g</i><sup>a</sup> と <i>g</i><sup>b</sup> だけ。各自が相手の公開値を秘密の指数で計算すると、同じ <i>g</i><sup>ab</sup> になる。",
  },
];

const elements = Object.fromEntries(["eyebrow", "title", "scene", "note", "status", "previous", "next"].map((id) => [id, document.querySelector(`#${id}`)]));
const deck = createStepDeck({ length: steps.length, initialStep: readStepParam(), onRender(step, api) {
  const current = steps[step];
  document.body.dataset.step = String(step);
  elements.eyebrow.textContent = current.eyebrow;
  elements.title.textContent = current.title;
  elements.scene.innerHTML = current.scene;
  elements.note.innerHTML = current.note;
  elements.status.textContent = `${step + 1} / ${api.lastStep + 1}`;
  elements.previous.disabled = api.isFirst;
  elements.next.disabled = api.isLast;
  typesetMath(elements.scene); typesetMath(elements.note);
} });
elements.previous.addEventListener("click", () => deck.previous());
elements.next.addEventListener("click", () => deck.next());
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); deck.next(); }
  if (event.key === "ArrowLeft") { event.preventDefault(); deck.previous(); }
});
deck.render();
window.addEventListener("load", () => { typesetMath(elements.scene); typesetMath(elements.note); });
