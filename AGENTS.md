# Codex instructions for HTML video lessons

このリポジトリでは、HTML/CSS/JavaScriptを完成品として直接編集する。Markdownから画面を自動生成する仕組みは追加しない。

## 新しい教材

`templates/html-lesson/` を `lessons/<lesson-id>/` へコピーしてから作業する。各教材は次を持つ。

```text
lessons/<lesson-id>/
├── index.html
├── lesson.css
├── lesson.js
└── storyboard.md
```

`storyboard.md` は台本と画面仕様の正本である。各ステップに「学習目標・画面・ナレーション・完成条件」を書く。先頭にテーマとして `classic-light` または `midnight-dark` を指定する。

## 実装

1. 変更前に対象教材の `storyboard.md`、HTML、CSS、JSを読む。
2. 指定されたステップだけを変更する。無関係な全体リデザインはしない。
3. ステップ状態は1か所で管理し、`←`、`→`、Space、`?step=`を維持する。
4. 複雑な図はHTML/SVGを直接書いてよい。2教材以上で再利用されるまで共有部品にしない。
5. 数式を動的に挿入したときは、MathJaxを再タイプセットする。
6. `index.html` の `data-theme` は `storyboard.md` のテーマ指定と一致させる。

## 確認

- 対象ステップの初期・途中・最終状態を確認する。
- 16:9で重なりがなく、必要なら右下に話者アバター領域を確保する。
- `storyboard.md` の完成条件と画面が一致する。
