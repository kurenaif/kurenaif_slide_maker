"use strict";
(() => {
  const { createCueMotion, cueProgress, ease, createArrow, paintOutline, createLessonPresenter } = window.SlideKit;
  // Edit slide content here. Each mount creates one independent, rewindable clock.
  // The shell owns navigation and cancellation; a scene owns only its own diagram.
  const svgDefs = `<defs>
    <marker id="arrow-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--gold)"/></marker>
    <marker id="arrow-muted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)"/></marker>
    <pattern id="free-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M 0 0 V 12" stroke="#D2DDEE" stroke-opacity=".16" stroke-width="3"/></pattern>
  </defs>`;
  const diagram = (label, content, { compact = false, viewBox = '0 0 1200 470' } = {}) =>
    `<div class="diagram-scroll" tabindex="0" aria-label="図。必要に応じて横にスクロールできます"><svg class="diagram ${compact ? 'compact' : ''}" viewBox="${viewBox}" role="img" aria-label="${label}">${svgDefs}${content}</svg></div>`;

  const slides = [
    {
      id: 'palette', chapter: '配色と余白', title: '白と黒で、主題を引き立てる',
      notes: '白黒の魔女衣装を起点にしたテーマ。白い見出し帯とチャコールの図面、細いブロンズの線を組み合わせる。紫は分類など意味があるところに絞る。下部のテーマ選択で同じ内容を既存テーマと比較できる。',
      mount(root, onChange) {
        root.innerHTML = `
          <div class="design-study">
            <div class="study-intro">
              <p class="study-kicker">01 — FORM & CONTRAST</p>
              <h2>静かな余白に、<br>伝えたいことを。</h2>
              <p class="study-description">白と黒のコントラスト。<br>装飾は細く、主題は明確に。</p>
              <div class="study-signature" aria-hidden="true"><span></span>◇<span></span></div>
              <p class="study-caption">Inspired by the Formal Crypto Witch Costume</p>
            </div>
            <div class="study-specimen">
              <p class="study-kicker">PALETTE / 配色の役割</p>
              <div class="study-swatches">
                <div><i class="swatch-paper"></i><span>背景</span></div>
                <div><i class="swatch-text"></i><span>文字</span></div>
                <div><i class="swatch-gold"></i><span>主題</span></div>
                <div><i class="swatch-class"></i><span>分類</span></div>
              </div>
              <div class="study-example"><span class="study-number">A</span><div><span class="study-label">FOCUS / 注目する領域</span><p>大切な箇所にだけ、光を。</p></div><span class="study-diamond" aria-hidden="true">◇</span></div>
              <p class="study-caption">次のページで、矢印と状態変化の見え方を確認。</p>
            </div>
          </div>`;
        return createCueMotion({ cues: [], onChange, render() {} });
      },
    },
    {
      id: 'reference', chapter: '参照', title: '参照先の位置と範囲',
      notes: '矢印を出発点から参照先までたどり、その後に該当範囲を囲う。1回の右キーでここまでを見せて止める。具体的な図と説明はstoryboard.mdに合わせて置き換える。',
      mount(root, onChange) {
        root.innerHTML = diagram('結果から注目する領域へ向かい、到着後に範囲を囲う矢印', `
          <text x="55" y="125" class="large code accent">result = process()</text>
          <rect x="664" y="74" width="414" height="100" rx="8" class="panel"/>
          <text x="871" y="133" text-anchor="middle" class="muted">その他の情報</text>
          <rect x="664" y="184" width="414" height="220" rx="8" class="used"/>
          <text x="871" y="307" text-anchor="middle">注目する領域</text>
          <path id="mem-arrow" d="M 97 149 V 184 H 659" class="arrow" marker-end="url(#arrow-gold)"/>
          <rect id="mem-focus" x="664" y="184" width="414" height="220" rx="8" class="outline"/>
        `);
        const arrow = createArrow(root.querySelector('#mem-arrow'));
        return createCueMotion({ cues: [{ duration: 1350 }], onChange,
          render(index, progress) {
            const p = cueProgress(index, progress, 0);
            arrow.paint(ease(p/.78));
            paintOutline(root.querySelector('#mem-focus'), ease((p-.78)/.22));
          },
        });
      },
    },
    {
      id: 'state', chapter: '状態変化', title: '状態変化と参照の分離',
      notes: '同じ箱の見た目が更新されるところで止める。次の右キーで管理側からの参照を見せる。状態変化と参照を別の説明単位にする。',
      mount(root, onChange) {
        root.innerHTML = diagram('更新前の領域が更新後に変わり、その後に管理側から参照される模式図', `
          <text x="145" y="98" class="large accent code">update(A)</text>
          <text id="state-label" x="750" y="98" text-anchor="middle">更新前</text>
          <rect x="552" y="139" width="396" height="214" rx="10" class="used"/>
          <g id="free-surface"><rect x="552" y="139" width="396" height="214" rx="10" class="free"/><rect x="552" y="139" width="396" height="214" rx="10" class="hatch"/></g>
          <text x="750" y="260" class="large" text-anchor="middle">A</text>
          <g id="manager"><rect x="145" y="205" width="226" height="80" rx="9" class="panel"/><text x="258" y="255" text-anchor="middle">管理側</text></g>
          <path id="state-arrow" d="M 371 245 H 547" class="arrow" marker-end="url(#arrow-gold)"/>
          <rect id="state-focus" x="552" y="139" width="396" height="214" rx="10" class="outline"/>
        `);
        const arrow = createArrow(root.querySelector('#state-arrow'));
        return createCueMotion({ cues: [{ duration: 750 }, { duration: 1350 }], onChange,
          render(index, progress) {
            const state = ease(cueProgress(index, progress, 0));
            const ref = cueProgress(index, progress, 1);
            root.querySelector('#free-surface').style.opacity = state;
            root.querySelector('#state-label').textContent = state < .5 ? '更新前' : '更新後';
            root.querySelector('#manager').style.opacity = index >= 1 ? 1 : .25;
            arrow.paint(ease(ref / .78));
            paintOutline(root.querySelector('#state-focus'), ease((ref-.78)/.22));
          },
        });
      },
    },
  ];
  window.lessonPresenter = createLessonPresenter({ slides });
})();
