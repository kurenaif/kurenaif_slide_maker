# Slide Kit

Small dependency-free modules for the interactive cryptography teaching decks.

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
