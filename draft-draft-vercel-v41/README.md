# ドラフトドラフト Vercel版 v4.1

## 重要
この版は `index.html` をPCで直接ダブルクリックして開く方式では、外部データ取得APIが動きません。
**Vercelへデプロイ後の `https://...vercel.app/` から開いてください。**

## Vercel公開
1. このフォルダ一式をGitHubリポジトリへ入れる
2. Vercelで New Project → Import Git Repository
3. Framework Preset は Other
4. Build Command は空欄
5. Output Directory も空欄
6. Deploy

## 動作確認
公開後に次をブラウザで開いてください。
`https://あなたのURL.vercel.app/api/health`

`{"ok":true,...}` が表示されればAPIは正常です。

次に
`https://あなたのURL.vercel.app/api/draft?year=2010`
を開き、JSONが表示されればドラフト取得も正常です。

## Failed to fetch が出る場合
- `file:///.../index.html` で開いていないか確認
- VercelのDeploymentsでFunctionsのエラーを確認
- `/api/health` が404なら、APIフォルダがデプロイ対象に含まれていません
- `/api/health` は動くが `/api/draft?year=2010` が500なら、外部取得先側の応答エラーです
