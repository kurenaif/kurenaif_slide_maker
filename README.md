# HTML Video Lesson Starter

Codexと一緒に、動画撮影向けのステップ式HTML教材を作るための最小リポジトリです。ビルドツールやフレームワークは不要です。

```text
examples/key-exchange-basics/  # そのまま動く2ステップのサンプル
templates/html-lesson/         # 新しい教材の複製元
shared/slide-kit/              # 必要になったときに使う共通部品
lessons/                       # 作成した教材の置き場所
AGENTS.md                      # Codexに守らせる実装・確認ルール
```

## まずサンプルを見る

`examples/key-exchange-basics/index.html` をダブルクリックで開く。`←`、`→`、Spaceで移動でき、`?step=1` で2枚目を直接開けます。

## 新しい教材を作る

```bash
cp -R templates/html-lesson lessons/my-lesson
```

次に `lessons/my-lesson/storyboard.md` を書き、Codexへ次のように依頼します。

```text
lessons/my-lesson/storyboard.md を読み、Step 1〜4を実装してください。
各ステップの初期・途中・最終状態を確認し、他のステップは変更しないでください。
```

テンプレートはダブルクリックで開けます。ESモジュールや複数教材で使うJavaScript部品を追加した場合だけ、リポジトリのルートで `python3 -m http.server 8765` を実行して確認してください。

## テーマ

教材を作るときに、`storyboard.md` の先頭で次のどちらかを指定します。

```md
- テーマ: `classic-light`
```

| 指定値 | 見た目 |
| --- | --- |
| `classic-light` | 白・黒・くすんだ紫・控えめな金。紙面調のクラシカルなライトテーマ。 |
| `midnight-dark` | 濃紺・ピンク・紫・真鍮色。暗い画面で見せるテーマ。 |

次に、教材の `index.html` の最初の要素を同じ値にします。両方のテーマCSSはあらかじめ読み込まれているため、この1か所だけで切り替わります。

```html
<html lang="ja" data-theme="classic-light">
```

Codexへは、テーマも含めて依頼できます。

```text
lessons/my-lesson/storyboard.md を読み、テーマは midnight-dark で実装してください。
```

## 方針

- HTML/CSS/JavaScriptが完成品。Markdownは生成元ではなく、台本と画面仕様。
- 1回しか使わない図や演出は教材の中に置く。
- 複数教材で使い、意味も共通なものだけ `shared/slide-kit/` に移す。
- 詳細な作業規約は [AGENTS.md](AGENTS.md) を参照。
