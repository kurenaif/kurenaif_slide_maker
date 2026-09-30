# HTML lesson template

リポジトリのルートで、このディレクトリを新しい教材へコピーする。

```bash
mkdir -p lessons
cp -R templates/html-lesson lessons/my-lesson
```

1. `storyboard.md` の学習目標・画面・ナレーション・完成条件を埋める。
2. [デザイン方針](../../docs/design.md) を読み、テーマを選ぶ。既定は `midnight-dark`。`classic-light` に変える場合はHTMLの `data-theme` と台本の指定を揃える。
3. `index.html` のタイトルと左上の分類表記を変える。
4. `lesson.js` の `slides` を台本に合わせて編集する。`mount()` が図と手動アニメーションを作る。
5. 教材固有の見た目を `lesson.css` に追加する。

HTML/CSS/JavaScriptが完成品で、ビルド不要。共有ファイルを含むリポジトリ一式があれば `index.html` をダブルクリックして開ける。配布するときも共有CSS・JSを一緒に渡す。

右キー／Spaceでひとつの動き、左キーで一段戻る。ページに入っただけでは再生しない。`?step=1&cue=1` は2ページ目の最初の動きが完了した状態。操作の詳細はルートのREADMEを参照。

初期サンプルは「参照先に矢印が届いてから囲う」「状態を変えてから別操作で参照を示す」の2ページ。具体的な教材へ置き換えて使う。さらにstack・循環リンク・分類の例は `examples/heap-memory/` にある。

数式が必要ならMathJaxをこの教材で読み込む。共通の表示制御はロード時とページ切り替え時に再タイプセットする。テンプレート自体はMathJaxや外部CDNに依存しない。

HTTPで開く場合はルートで `python3 -m http.server 8766 --bind 127.0.0.1` を起動し、`http://localhost:8766/lessons/my-lesson/` を開く。
