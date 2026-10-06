# Slide Kit

技術教材の共通部品。配色と演出の方針は [docs/design.md](../../docs/design.md) を参照。

## 口頭説明・動画収録用の部品

`templates/html-lesson/` と `examples/heap-memory/` は、次の通常スクリプトを順に読み込む。ビルドやESモジュールのfetchが不要なため、ローカルファイルとして開ける。

```html
<script src="../../shared/slide-kit/core/cues.js"></script>
<script src="../../shared/slide-kit/core/arrows.js"></script>
<script src="../../shared/slide-kit/core/presenter.js"></script>
<script src="lesson.js"></script>
```

APIは `window.SlideKit` にある。

| API | 用途 |
| --- | --- |
| `createCueMotion({ cues, render, onChange })` | 右キーごとに一区切り進む時計。既定は1.5倍速、開始時は停止 |
| `cueProgress(index, progress, target)` | 再描画・巻き戻しに依存しない、指定した動きの進行度 |
| `createArrow(path, { centre })` | 点線を保つ矢印描画。両端が矢印の線はcentreで中央から伸ばす |
| `paintOutline(rect, progress)` | 矢印到着後の強調枠 |
| `createArrowCycle(paths)` | 指定順の線を一周。全長に一度だけイーズイン・イーズアウト |
| `createLessonPresenter({ slides })` | キー・ボタン、URL、発表メモ、収録サイズへの調整 |

`slides` の各要素は `id`、`chapter`、`title`、`notes`、`mount(root, onChange)` を持つ。`mount` は図を置き、`createCueMotion` で作った時計を返す。シーンを離れると時計の `destroy()` が呼ばれる。具体例はテンプレートの `lesson.js` にある。

`render(-1, 1)` は初期状態、`render(i, p)` はi番目の動きの進行度p。完成済みの状態へURLから移る場合も、前フレームに依存せず再現できるようにする。

共通CSSは `ui/lesson.css`、配色は `ui/midnight-dark.css` と `ui/classic-light.css`。既存の `--metal` などのトークン名は互換用に残し、新しい表示では `--gold`、`--used`、`--free` など意味ごとの変数を使う。

## テーマ選択

配色に `ui/formal-witch.css` を追加。全サンプルは3テーマのCSSに加え、`ui/theme-picker.css` と `core/themes.js` を読み込む。`themes.js` はheadで同期読み込みし、URLのテーマを描画前に反映する。

操作部に `<label class="theme-picker">テーマ <select data-theme-picker aria-label="カラーテーマ"></select></label>` を置くと、選択肢を自動で設定する。変更はCSSの切り替えだけなので、表示中のページ・動きの位置・停止状態を維持する。URLの `theme` で復元でき、未知のテーマ名は無視してHTMLの既定値を使う。

## 従来のESモジュール部品

以下は従来の教材向けに維持している。直接importする場合はローカルHTTPサーバーを使う。新しい通常スクリプトのAPIと読み込み方法を混同しない。

## What belongs here

- `core/deck.js`: step counters, keyboard navigation, URL step parameters.
- `core/math.js`: MathJax configuration and re-typesetting of dynamic content.
- `core/deck.js#createExternalNoteDock`: moves the supporting explanation below a presentation stage on wide screens.
- `ui/theme.css`: shared colors and basic note styles.
- `ui/components.js`: lightweight DOM constructors for notes and curve cards.
- `diagrams/montgomery.js`: an actual plotter for `y^2 = x^3 + ax^2 + x`.

## Minimal deck

```html
<!-- From lessons/<lesson-id>/index.html -->
<link rel="stylesheet" href="../../shared/slide-kit/ui/theme.css">
<script type="module">
  import { createStepDeck, readStepParam } from "../../shared/slide-kit/core/deck.js";

  const deck = createStepDeck({
    length: 3,
    initialStep: readStepParam(),
    onRender(step, api) {
      document.body.dataset.step = step;
      status.textContent = `${step + 1} / ${api.lastStep + 1}`;
    },
  });
  next.onclick = () => deck.next();
  previous.onclick = () => deck.previous();
  deck.bindKeyboard();
  deck.render();
</script>
```

## Presentation notes

Keep a normal explanation card inside each slide. `createExternalNoteDock` temporarily moves the active card into a footer outside the stage when the presentation breakpoint matches. The source is restored on slide changes, so mobile and normal desktop layouts keep their local card.

## Adding a new diagram

Use a domain-specific module such as `diagrams/montgomery.js`, rather than adding a generic drawing abstraction. For example:

```js
import { createMontgomeryCurveSvg } from "../../shared/slide-kit/diagrams/montgomery.js";
card.append(createMontgomeryCurveSvg({ a: -3.2, stroke: "#d9a942" }));
```
