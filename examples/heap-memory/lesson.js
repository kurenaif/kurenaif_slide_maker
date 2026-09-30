"use strict";
(() => {
  const { createCueMotion, cueProgress, ease, createArrow, paintOutline, createArrowCycle, createLessonPresenter } = window.SlideKit;
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
      id: 'structure', chapter: '構造', title: 'データ構造としてのstack',
      notes: '後から積んだものを先に取り出す。Cを取り出してからD、Eを積み直すことで、同じ場所を使えることを示す。\n上から下へ積む向きに統一する。色はデータ名ではなく深さに対応し、CとDは同じ場所なら同じ色になる。',
      mount(root, onChange) {
        const moves = [['push','A'], ['push','B'], ['push','C'], ['pop','C'],
          ['push','D'], ['push','E'], ['pop','E'], ['pop','D'], ['pop','B'], ['pop','A']];
        const states = [[]];
        for (const [action, value] of moves) {
          const next = [...states.at(-1)]; action === 'push' ? next.push(value) : next.pop(); states.push(next);
        }
        root.innerHTML = diagram('上から下へ積み、最後に積んだ要素から取り出すstack', `
          <text id="operation" x="390" y="52" class="large accent" text-anchor="middle"></text>
          <path d="M 205 87 V 471 H 575 V 87" class="divider" fill="none"/>
          ${Array.from({ length: 4 }, (_, i) => `<g data-slot="${i}"><rect x="224" y="${104+i*88}" width="332" height="74" rx="8" class="swatch depth-${i}"/><text x="390" y="${153+i*88}" text-anchor="middle" class="large"></text></g>`).join('')}
          <g id="stack-top"><path d="M 585 0 H 626" stroke="var(--muted)" stroke-width="2"/><text x="641" y="8" class="label">top</text></g>
        `, { compact: true, viewBox: '0 0 780 520' });
        root.querySelector('svg').style.maxWidth = '1100px';
        root.querySelector('svg').style.margin = '0 auto';
        return createCueMotion({ cues: moves.map(() => ({ duration: 600 })), onChange,
          render(index, progress) {
            const before = states[Math.max(0, index)], after = states[index+1];
            const p = index < 0 ? 0 : ease(progress);
            root.querySelector('#operation').textContent = index < 0 ? '' : moves[index][0];
            root.querySelectorAll('[data-slot]').forEach((node, slot) => {
              const oldValue = before[slot], newValue = after[slot];
              const entering = !oldValue && newValue, leaving = oldValue && !newValue;
              node.style.opacity = entering ? p : leaving ? 1-p : newValue ? 1 : 0;
              node.setAttribute('transform', `translate(0,${entering ? -32*(1-p) : leaving ? -32*p : 0})`);
              node.querySelector('text').textContent = newValue || oldValue || '';
            });
            const depth = before.length + (after.length-before.length)*p;
            root.querySelector('#stack-top').setAttribute('transform', `translate(0,${96+depth*88})`);
          },
        });
      },
    },
    {
      id: 'state', chapter: '状態変化', title: '解放に伴うメモリの使い道の変化',
      notes: 'ここでは実装の詳細を省いた模式図を使う。まず同じ領域の役割が「使用中」から「再利用待ち」に変わるところで止める。次の操作で管理側からの参照を示す。\nこの図の線は参照だけを表す。状態の変化とポインタの矢印を同時に混ぜない。管理情報の具体的な配置は、対象の実装を説明する教材で追加する。',
      mount(root, onChange) {
        root.innerHTML = diagram('使用中の領域が再利用待ちに変わり、その後に管理側から参照される模式図', `
          <text x="145" y="98" class="large accent code">free(A)</text>
          <text id="state-label" x="750" y="98" text-anchor="middle">使用中</text>
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
            root.querySelector('#state-label').textContent = state < .5 ? '使用中' : '再利用待ち';
            root.querySelector('#manager').style.opacity = index >= 1 ? 1 : .25;
            arrow.paint(ease(ref / .78));
            paintOutline(root.querySelector('#state-focus'), ease((ref-.78)/.22));
          },
        });
      },
    },
    {
      id: 'reference', chapter: '参照', title: 'mallocの返り値とアプリが使う領域',
      notes: '返り値が指しているのは管理情報の後にあるユーザー領域の先頭。参照をたどってから、その領域を枠で囲う。\nこのページでは具体的なアドレス、サイズ計算、フラグを説明しない。実装に依存する細部は別ページで示す。',
      mount(root, onChange) {
        root.innerHTML = diagram('mallocの返り値から、チャンク内のアプリが使う領域の先頭への矢印', `
          <text x="55" y="125" class="large code accent">mem = malloc(128)</text>
          <rect x="664" y="74" width="414" height="100" rx="8" class="panel"/>
          <text x="871" y="133" text-anchor="middle" class="muted">管理情報</text>
          <rect x="664" y="184" width="414" height="220" rx="8" class="used"/>
          <text x="871" y="307" text-anchor="middle">アプリが使う領域</text>
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
      id: 'cycle', chapter: 'リンク', title: '双方向リストの参照関係',
      notes: '1回目の操作でfdを一周、2回目でbkを一周する。headはリストの番兵を表す。\n黄色の実線はfd、控えめな点線はbk。色だけでなく位置・線種・矢印の向きでも区別する。一周全体に一度だけイーズイン・イーズアウトをかけ、途中のノードごとに減速しない。\n実際のチャンクがメモリ内で移動する図ではなく、参照関係を配置した模式図。',
      mount(root, onChange) {
        const positions = [60, 355, 650, 945];
        const fdPaths = ['M 220 194 H 350','M 515 194 H 645','M 810 194 H 940',
          'M 1025 168 V 90 H 140 V 163'];
        const bkPaths = ['M 140 282 V 386 H 1025 V 287','M 945 254 H 815',
          'M 650 254 H 520','M 355 254 H 225'];
        root.innerHTML = diagram('headとA、B、Cがfdとbkで循環する双方向リスト', `
          <text x="582" y="66" text-anchor="middle" class="accent">fd</text>
          <text x="582" y="434" text-anchor="middle" class="label">bk</text>
          ${positions.map((x, i) => `<rect x="${x}" y="168" width="160" height="114" rx="9" class="${i === 0 ? 'panel' : 'free'}"/>${i ? `<rect x="${x}" y="168" width="160" height="114" rx="9" class="hatch"/>` : ''}<text x="${x+80}" y="236" text-anchor="middle" class="large">${['head','A','B','C'][i]}</text>`).join('')}
          ${fdPaths.map(d => `<path d="${d}" data-cycle="fd" class="arrow" marker-end="url(#arrow-gold)"/>`).join('')}
          ${bkPaths.map(d => `<path d="${d}" data-cycle="bk" class="arrow bk" marker-end="url(#arrow-muted)"/>`).join('')}
        `);
        const fd = createArrowCycle([...root.querySelectorAll('[data-cycle="fd"]')]);
        const bk = createArrowCycle([...root.querySelectorAll('[data-cycle="bk"]')]);
        return createCueMotion({ cues: [{ duration: 1500 }, { duration: 1500 }], onChange,
          render(index, progress) {
            fd.paint(cueProgress(index, progress, 0));
            bk.paint(cueProgress(index, progress, 1));
          },
        });
      },
    },
    {
      id: 'mapping', chapter: '分類', title: 'サイズによる分類と領域の対応',
      notes: '同じサイズの見出し・リスト・物理領域を同じ色で対応させる。1〜4 MBは分類の説明用であり、glibcのbinの境界値ではない。\n無関係なものに別々の色を付けるのではなく、対応を読み取るために色を使う。各箱は単色で、枠線も同じ色相。サイズのラベルでも対応を確認できる。',
      mount(root, onChange) {
        root.innerHTML = diagram('同じサイズの分類と領域が同じ色、同じラベルで対応する模式図', `
          <text x="76" y="65" class="label">サイズ別のリスト</text>
          ${[1,2,3,4].map((n,i) => `<g class="depth-${i}">
            <rect x="${76+i*288}" y="91" width="202" height="92" rx="9" class="swatch"/>
            <text x="${177+i*288}" y="149" text-anchor="middle" class="large">${n} MB</text>
            <path data-mapping d="M ${177+i*288} 190 V 290" class="arrow" style="stroke:var(--swatch)"/>
            <rect x="${76+i*288}" y="300" width="202" height="106" rx="9" class="swatch"/>
            <rect x="${76+i*288}" y="300" width="202" height="106" rx="9" class="hatch"/>
            <text x="${177+i*288}" y="365" text-anchor="middle">${n} MB</text>
          </g>`).join('')}
          <text x="76" y="450" class="label">対応する空き領域</text>
        `, { viewBox: '0 0 1240 470' });
        const arrows = [...root.querySelectorAll('[data-mapping]')].map(path => createArrow(path));
        return createCueMotion({ cues: [{ duration: 900 }], onChange,
          render(index, progress) {
            const p = ease(cueProgress(index, progress, 0)); arrows.forEach(arrow => arrow.paint(p));
          },
        });
      },
    },
  ];

  window.lessonPresenter = createLessonPresenter({ slides });
})();
