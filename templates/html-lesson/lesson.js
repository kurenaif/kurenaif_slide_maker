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
    eyebrow: "教材の分類",
    title: "最初の画面",
    scene: `<section class="placeholder-card"><strong>この図を置き換える</strong><span>HTML/SVGを直接書いてよい</span></section>`,
    note: "このステップで視聴者に伝えることを書く。数式は \\(E_0\\) のように記述する。",
  },
  {
    eyebrow: "教材の分類",
    title: "次の要点",
    scene: `<section class="placeholder-card"><strong>2つ目の画面</strong><span>複雑な図は scenes/ に分割する</span></section>`,
    note: "storyboard.md の完成条件と画面が一致していることを確認する。",
  },
];

const eyebrow = document.querySelector("#eyebrow");
const title = document.querySelector("#title");
const scene = document.querySelector("#scene");
const note = document.querySelector("#note");
const status = document.querySelector("#status");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");

const deck = createStepDeck({
  length: steps.length,
  initialStep: readStepParam(),
  onRender(step, api) {
    const current = steps[step];
    document.body.dataset.step = String(step);
    eyebrow.textContent = current.eyebrow;
    title.textContent = current.title;
    scene.innerHTML = current.scene;
    note.innerHTML = current.note;
    status.textContent = `${step + 1} / ${api.lastStep + 1}`;
    previous.disabled = api.isFirst;
    next.disabled = api.isLast;
    typesetMath(scene);
    typesetMath(note);
  },
});

previous.addEventListener("click", () => deck.previous());
next.addEventListener("click", () => deck.next());
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); deck.next(); }
  if (event.key === "ArrowLeft") { event.preventDefault(); deck.previous(); }
});
deck.render();
window.addEventListener("load", () => { typesetMath(scene); typesetMath(note); });
