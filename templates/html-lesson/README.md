# HTML lesson template

このディレクトリをコピーして、新しい教材を作る。

```bash
cp -R templates/html-lesson projects/<lesson-id>
```

作成後は、次の順で編集する。

1. `storyboard.md` を埋める。
2. `storyboard.md` のテーマを `classic-light` または `midnight-dark` から選び、`index.html` の `data-theme` に同じ値を設定する。
3. `index.html` のタイトルとMathJax設定を確認する。
4. `lesson.js` の `steps` を台本に合わせて実装する。
5. `lesson.css` をその教材に合わせて調整する。

`index.html` はダブルクリックで開ける。複数ファイルをまたぐESモジュールや共有JavaScriptを追加した場合だけ、ローカルHTTPサーバーを使う。

ローカルHTTPサーバーを使う場合は、リポジトリのルートで次を実行する。

```bash
python3 -m http.server 8765
```

その後、`http://localhost:8765/projects/<lesson-id>/` を開く。`←`、`→`、Space と `?step=0` が使える。
