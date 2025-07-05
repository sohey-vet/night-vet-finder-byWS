# 夜間救急どうぶつ病院マップ

> 緊急時に診療中の動物病院を素早く検索できるWebアプリケーション

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)]()
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)]()

## 📋 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術仕様](#技術仕様)
- [セットアップ](#セットアップ)
- [開発](#開発)
- [デプロイ](#デプロイ)
- [ライセンス](#ライセンス)

## 📖 概要

夜間救急どうぶつ病院マップは、ペットの緊急事態に備えて夜間（19:00～翌朝9:00）に診療している動物病院を迅速に検索・表示するWebアプリケーションです。

### 🎯 ターゲットユーザー
- 犬や猫などのペットの飼い主
- 夜間緊急時に動物病院を探している方
- 獣医関係者

### 🎨 デザインコンセプト
- **モバイルファースト**: スマートフォンでの利用を最優先
- **緊急時対応**: 直感的で迅速な操作を重視
- **アクセシビリティ**: すべてのユーザーが利用可能

## ✨ 主な機能

### 🔍 検索機能
- **📍 現在地検索**: GPS位置情報から周辺の病院を自動検索
- **🗺️ 地名検索**: 地名・駅名入力による指定エリアの病院検索
- **🌙 夜間フィルタリング**: 19:00～翌9:00に診療中の病院のみ表示

### 🗺️ 地図機能
- **インタラクティブマップ**: Google Maps統合による詳細な地図表示
- **カスタムマーカー**: 現在地と病院を区別したピン表示
- **自動調整**: 検索結果に応じた最適なズームレベル
- **マーカー連動**: 地図ピンクリックで対応するカード情報をハイライト

### 🏥 病院情報
- **詳細情報カード**: 病院名、住所、距離、診療時間を表示
- **📞 ワンタッチ電話**: 電話番号タップで直接発信
- **🌐 公式サイト**: 病院ホームページへの直リンク
- **🚗 ナビゲーション**: 外部地図アプリでの経路案内

### 🎭 ユーザー体験
- **💓 心電図ローダー**: 医療テーマに合わせた独自ローディングアニメーション
- **📱 レスポンシブ対応**: スマートフォン、タブレット、PC完全対応
- **🔄 リアルタイム更新**: 検索条件変更時の即座な結果更新
- **📤 SNSシェア**: Twitter/X連携による情報共有

### 📋 フィードバック機能
- **📝 情報報告**: 病院情報の間違いや改善提案の収集
- **📊 カテゴリ分類**: 報告種別による効率的な問い合わせ管理

## 🛠️ 技術仕様

### フロントエンド
```
Language:     HTML5, CSS3, ES6+ JavaScript
Framework:    Vanilla JavaScript (フレームワークレス)
Architecture: クラスベースモジュール設計
Design:       CSS Custom Properties (CSS変数)
Bundling:     なし（軽量化のため）
```

### 外部API
```
Google Maps JavaScript API  - 地図表示・マーカー管理
Google Places API          - 動物病院検索・詳細情報取得
Google Geocoding API       - 地名から座標への変換
Browser Geolocation API    - ユーザー現在地取得
```

### PWA対応
```
Manifest:        PWAマニフェスト対応
Service Worker:  オフライン対応（予定）
App Icons:       各種デバイス対応アイコン
Theme Color:     ブランドカラー統一
```

### パフォーマンス
```
Bundle Size:     < 100KB (圧縮後)
First Paint:     < 1.5秒
Interactive:     < 2.5秒
Lighthouse:      95+ スコア目標
```

## 🚀 セットアップ

### 前提条件
- モダンブラウザ（Chrome 90+, Firefox 88+, Safari 14+）
- HTTPSまたはlocalhost環境（位置情報取得のため）

### 1. リポジトリのクローン
```bash
git clone https://github.com/sohey-vet/night-vet-finder-byWS.git
cd night-vet-finder-byWS
```

### 2. Google Maps API設定

#### APIキーの取得
1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクト作成
2. 以下のAPIを有効化：
   - **Maps JavaScript API**
   - **Places API** 
   - **Geocoding API**

#### APIキーの制限設定（セキュリティ重要）
```
Application restrictions:
  HTTP referrers (web sites)
  Add: your-domain.com/*
  Add: localhost:8000/* (開発用)

API restrictions:
  Restrict key
  Select APIs:
    - Maps JavaScript API
    - Places API
    - Geocoding API
```

#### 設定ファイルの準備
```bash
# サンプルファイルをコピー
cp config.sample.js config.js

# APIキーを設定
# config.js内のAPI_KEYを実際のキーに置き換え
```

### 3. ローカル開発サーバー起動

#### Python使用
```bash
python3 -m http.server 8000
```

#### Node.js使用
```bash
npx serve .
```

#### PHP使用
```bash
php -S localhost:8000
```

### 4. 動作確認
```
URL: http://localhost:8000
確認項目:
  ✓ 地図が正常に表示される
  ✓ 現在地検索が動作する
  ✓ 地名検索が動作する
  ✓ 病院情報が表示される
```

## 💻 開発

### プロジェクト構造
```
night-vet-finder-byWS/
├── index.html              # メインHTML
├── config.js               # 設定ファイル（git管理対象外）
├── config.sample.js        # 設定サンプル
├── script.js               # メインJavaScript
├── style.css               # メインスタイルシート
├── netlify.toml           # Netlifyデプロイ設定
├── .gitignore             # Git除外設定
└── README.md              # プロジェクト説明書
```

### アーキテクチャ設計

#### JavaScript設計
```javascript
// クラスベースモジュール構成
VetHospitalApp           // メインアプリケーション
├── AppState             // 状態管理
├── DOMManager          // DOM要素管理
├── Logger              // ログ管理
├── NightHoursChecker   // 夜間営業判定
├── GeoUtils            // 地理計算
└── OpeningHoursFormatter // 営業時間表示
```

#### CSS設計
```css
/* CSS Custom Properties使用 */
:root {
  --primary-blue: #007BFF;
  --danger-red: #dc3545;
  --success-green: #28a745;
  /* ... 統一されたデザインシステム */
}
```

### 開発ワークフロー

#### ローカル開発
```bash
# 開発サーバー起動
python3 -m http.server 8000

# ログ確認（ブラウザ開発者ツール）
Console > Logger出力を確認

# テスト
- 現在地検索テスト
- 地名検索テスト（"東京駅", "新宿"等）
- レスポンシブ表示確認
```

#### コード品質管理
```bash
# HTMLバリデーション
# https://validator.w3.org/

# CSS検証
# https://jigsaw.w3.org/css-validator/

# Lighthouse監査
# Chrome DevTools > Lighthouse
```

### 環境別設定

#### 開発環境
```javascript
// config.js
const ENVIRONMENT = {
    isDevelopment: true,    // ログ出力有効
    logging: { enabled: true, level: 'debug' }
};
```

#### 本番環境
```javascript
// config.js
const ENVIRONMENT = {
    isDevelopment: false,   // ログ出力無効
    logging: { enabled: false, level: 'error' }
};
```

## 🌐 デプロイ

### Netlify（推奨）
```bash
# 自動デプロイ設定済み
git push origin main
# → 自動デプロイ実行
```

### GitHub Pages
```bash
# Settings > Pages > Source: Deploy from a branch
# Branch: main / root
```

### その他ホスティング
```bash
# 静的ファイルホスティングサービスならどこでも対応
# Vercel, Firebase Hosting, AWS S3 等
```

### 環境変数設定（本番）
```
# Netlify環境変数
GOOGLE_MAPS_API_KEY=your_production_api_key

# ビルド時に自動置換される仕組みも可能
```

## 🧪 テスト

### 手動テスト項目
```
□ 現在地検索（位置情報許可）
□ 現在地検索（位置情報拒否）
□ 地名検索（存在する地名）
□ 地名検索（存在しない地名）
□ 地名検索（曖昧な地名）
□ 夜間営業判定ロジック
□ 電話リンク動作
□ 地図アプリ連携
□ SNSシェア機能
□ フィードバックフォーム
□ レスポンシブ表示
□ アクセシビリティ
```

### ブラウザ対応
```
✓ Chrome 90+ (Android/Desktop)
✓ Firefox 88+ (Android/Desktop)
✓ Safari 14+ (iOS/macOS)
✓ Edge 90+ (Desktop)
```

### パフォーマンステスト
```
Tools: Chrome DevTools Lighthouse
Targets:
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 90+
  - SEO: 90+
```

## 🔐 セキュリティ

### APIキー保護
```
1. HTTPリファラー制限必須
2. API制限の適用
3. 使用量監視の設定
4. 定期的なキーローテーション
```

### データプライバシー
```
- 位置情報の一時使用のみ
- 個人情報の保存なし
- クッキー使用なし
- GDPR準拠設計
```

## 📈 監視・メンテナンス

### ログ監視
```javascript
// 本番環境でのエラー追跡
Logger.error('Search failed', { 
  location: userLocation, 
  error: errorMessage 
});
```

### パフォーマンス監視
```
- Google Maps API使用量
- レスポンス時間
- エラー率
- ユーザビリティメトリクス
```

### 定期メンテナンス
```
□ Google Maps API料金確認
□ 病院情報の精度確認
□ ブラウザ対応状況更新
□ セキュリティアップデート
□ 依存関係の更新
```

## 🤝 コントリビューション

### 報告・提案
```
Issues:     GitHub Issues使用
Feature:    機能提案歓迎
Bug Report: 再現手順明記
Feedback:   アプリ内フィードバック機能使用
```

### 開発参加
```bash
# Fork & Clone
git clone https://github.com/your-username/night-vet-finder-byWS.git

# Branch作成
git checkout -b feature/your-feature-name

# 開発・テスト
# ...

# Pull Request作成
```

## 📜 ライセンス

```
MIT License

Copyright (c) 2025 夜間救急どうぶつ病院マップ

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 サポート

### お問い合わせ
- **Website**: [https://crypto-paw.com/](https://crypto-paw.com/)
- **Issues**: [GitHub Issues](https://github.com/sohey-vet/night-vet-finder-byWS/issues)
- **アプリ内**: フィードバックフォーム使用

### 免責事項
> ⚠️ **重要**: 表示される情報はGoogleマップのデータに基づいています。診療時間や休診日は急遽変更されることがあります。**受診する前には、必ず病院に直接電話をして、診療可能かご確認ください。** 本ツールの利用によって生じたいかなる損害についても、運営者は一切の責任を負いません。

---

<div align="center">

**🐾 緊急時のペットの健康を守るために 🐾**

Made with ❤️ for pet owners everywhere

</div>