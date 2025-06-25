# Night Vet Finder - 夜間救急動物病院検索

緊急時のペット医療施設検索をサポートするモバイルファーストWebアプリケーションです。

## 🐾 概要

「Night Vet Finder」は、夜間や緊急時にペットの医療が必要になった飼い主のために設計された、シンプルで使いやすい動物病院検索アプリです。パニック状態でも迷わず操作できるよう、最小限のタップで最寄りの夜間対応動物病院を見つけることができます。

## ✨ 主な機能

- **GPS自動検索**: 現在地から最寄りの夜間対応動物病院を自動検索
- **時間制限機能**: 夜間時間帯（18:00〜翌9:00）のみ利用可能
- **ダークモード**: 夜間利用に配慮した目に優しいダークテーマ
- **ワンタップアクション**: 電話発信とマップアプリ連携
- **レスポンシブデザイン**: モバイルファーストの直感的なUI

## 🎨 デザインコンセプト

**「Calm in Chaos（混乱の中の冷静さ）」**

- 緊急時でも落ち着いて操作できるシンプルなインターフェース
- 医療アプリらしい信頼性のあるデザイン
- ダークモードによる夜間利用への配慮

### カラーパレット

- **Primary Blue** (#007AFF): メインアクション、信頼感
- **Background** (#121212): 深い黒、目に優しい
- **Surface** (#1E1E1E): カード背景
- **Success Green** (#34D399): 営業中ステータス
- **Warning Orange** (#FF9F0A): 要確認ステータス

## 🚀 セットアップ

### 1. リポジトリのクローン
```bash
git clone [repository-url]
cd 夜間救急動物病院検索
```

### 2. Google Maps API キーの設定
1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. 以下のAPIを有効化：
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API
3. APIキーを作成し、HTTP referrer制限を設定
4. `config.sample.js`を`config.js`にコピー
5. `config.js`内の`YOUR_GOOGLE_MAPS_API_KEY_HERE`を実際のAPIキーに置換

```bash
cp config.sample.js config.js
# config.jsを編集してAPIキーを設定
```

### 3. ローカルサーバーの起動
```bash
# Python 3の場合
python -m http.server 8080

# または
python3 -m http.server 8080
```

### 4. ブラウザでアクセス
http://localhost:8080 にアクセス

## 🔧 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **地図API**: Google Maps JavaScript API
- **検索API**: Google Places API
- **位置情報**: Browser Geolocation API

## 📱 機能

- **現在地検索**: GPS位置情報から最寄りの動物病院を検索
- **地名検索**: 都市名・駅名などから動物病院を検索
- **リアルタイム情報**: Google Places APIによる最新の病院情報
- **インタラクティブマップ**: 病院位置をマップ上に表示
- **詳細情報**: 電話番号、住所、営業時間、評価などを表示
- **ルート案内**: Google Mapsでのルート検索機能

## 🛡️ セキュリティ

- APIキーは`config.js`に分離し、`.gitignore`で除外
- HTTP referrer制限でAPIキーの不正使用を防止
- 本番環境では適切なドメイン制限を設定

## 🚀 デプロイ

### GitHub Pages
1. GitHubリポジトリの Settings → Pages
2. Source を "Deploy from a branch" に設定
3. Branch を "main" に設定
4. `config.js`ファイルを手動でアップロード（APIキー設定済み）

### その他のホスティング
- Netlify, Vercel, Firebase Hosting等でも利用可能
- 静的ファイルのみなので、任意のWebサーバーで動作

## 📄 ライセンス

MIT License

## 📋 ファイル構成

```
夜間救急動物病院検索/
├── index.html          # メインHTMLファイル
├── styles.css          # スタイルシート
├── script.js           # JavaScriptロジック
├── config.sample.js    # APIキー設定ファイル（サンプル）
├── config.js           # APIキー設定ファイル
└── README.md           # このファイル
```

## ⚠️ 注意事項

- **Google Maps API**: 商用利用時は課金が発生する場合があります
- **位置情報**: ユーザーの許可が必要です
- **時間制限**: 18:00〜9:00以外は利用できません
- **免責事項**: 表示される情報はGoogleマップに基づきます。受診前には必ず病院へ直接お電話ください

## 🔒 プライバシー

- 位置情報は検索目的のみに使用
- 個人情報の保存は行いません
- 外部への情報送信はGoogle Maps APIのみ

## 🐛 トラブルシューティング

### よくある問題

1. **地図が表示されない**
   - APIキーが正しく設定されているか確認
   - APIの利用制限に達していないか確認

2. **位置情報が取得できない**
   - ブラウザの位置情報許可を確認
   - HTTPSでアクセスしているか確認

3. **病院が見つからない**
   - 検索範囲（10km）内に対象施設がない可能性
   - 手動で地名検索を試してください

## 📞 サポート

緊急時は最寄りの動物病院に直接お電話ください。

---
