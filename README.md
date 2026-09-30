# HTML Video Lesson Starter

口頭説明・動画収録向けのHTML教材テンプレート。heap教材の制作で固めた配色、強調、右キーで進めるアニメーションを共通化しています。HTML/CSS/JavaScriptを直接編集し、ビルドツールやフレームワークは使いません。

```text
templates/html-lesson/         # 新しい教材の複製元（2ページ）
examples/heap-memory/          # stack・状態変化・参照・リンク・分類の5ページ
examples/key-exchange-basics/  # 従来の明るいテーマの鍵交換サンプル
shared/slide-kit/              # 配色、表示、手動アニメーションなどの共通部品
lessons/                       # 作成した教材
docs/design.md                # カラーテーマ・デザイン・演出の方針
docs/history.md               # テンプレートの由来と今回の統合内容
AGENTS.md                     # 編集・確認時の規約
```

## サンプルを見る

`examples/heap-memory/index.html` をブラウザで開きます。共有ファイルを含むリポジトリ一式があれば、ダブルクリックで動きます。外部CDNやAPIへの接続は不要です。

ページは初期状態で待機します。**右キーでひとつの動きだけ進めて停止**し、すべて説明し終えた次の右キーで次のページへ進みます。動作中に右を押すと、その動きを完了して停止します。

| 操作 | 動作 |
| --- | --- |
| → / Space / 次へ | 次の動き、または次のページ |
| ← / 戻る | 一段戻る。動作中ならその動きの開始前へ |
| R / 最初から | 現在のページの初期状態へ |
| N / メモ | 発表メモを開閉し、動きを停止 |
| P / 連続再生 | 明示的に選んだ場合だけ現在のページを連続再生 |
| F / 全画面 | 全画面表示を切り替える |
| Home / End | 最初のページの初期状態 / 最後のページの完成状態 |

`?step=3&cue=1` は4ページ目の最初の動きが完了した状態です。再読み込みしても自動再生しません。章ガイドを選ぶと、そのページの初期状態へ戻ります。

## 新しい教材を作る

```bash
mkdir -p lessons
cp -R templates/html-lesson lessons/my-lesson
```

1. `lessons/my-lesson/storyboard.md` に学習目標・画面・ナレーション・完成条件を書く。
2. [デザイン方針](docs/design.md) を読み、各ページで強調する要点をひとつ決める。
3. `index.html`、`lesson.js`、`lesson.css` を直接編集する。
4. `index.html` を開き、初期・途中・完成状態と巻き戻しを確認する。

Codexへの依頼例:

```text
lessons/my-lesson/storyboard.md と docs/design.md を読み、Step 1〜4を実装してください。
テーマは midnight-dark。右キーで説明単位ごとに止め、1980×1020とスマホ幅で確認してください。
```

## 配色と収録

既定の `midnight-dark` は紺・青・白・金。金はそのページの主題、青→紫→赤は位置や分類の対応に使います。枠線を塗りと同じ色相に揃え、無関係な色分けを増やしません。色コード、60／30／10の目安、強調の判断基準は [docs/design.md](docs/design.md) に記録しています。

| テーマ | 見た目 |
| --- | --- |
| `midnight-dark` | 今回の教材から引き継いだ紺・青・白・金。新しい教材の既定値 |
| `classic-light` | 従来の白・黒・くすんだ紫・控えめな金。明るい教材用 |

テーマは `storyboard.md` とHTML先頭の `data-theme` に同じ値を設定します。両テーマのCSSはあらかじめ読み込まれています。

```html
<html lang="ja" data-theme="midnight-dark">
```

収録基準は **1980×1020のブラウザ表示領域**。PCでは構図を保って画面内に収め、操作ボタンを下側へ分けます。スマホでは通常のスクロールと、必要に応じた図内の横スクロールを使います。キャラクターの表示は任意です。

## HTTPで開く・検証する

必要ならリポジトリのルートで起動します。

```bash
python3 -m http.server 8766 --bind 127.0.0.1
```

ブラウザで `http://localhost:8766/examples/heap-memory/` を開きます。既存のESモジュール部品を直接importする教材ではHTTPを使ってください。新テンプレートの共有JavaScriptは通常のscriptなので、HTTPは必須ではありません。

開発用の確認手順は [tests/README.md](tests/README.md)、元の構成からの更新点は [CHANGELOG.md](CHANGELOG.md) にまとめています。
