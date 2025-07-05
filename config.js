/**
 * 夜間救急どうぶつ病院マップ - 設定ファイル
 * Google Maps API設定とアプリケーション定数
 */

// 環境設定
const ENVIRONMENT = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
};

// Google Maps API設定
const API_KEY = 'AIzaSyCrR07t7S7AZ3p09dxfrg1toT3DcVKD3Ts';

// アプリケーション設定
const APP_CONFIG = {
    // Google Maps API
    googleMaps: {
        apiKey: API_KEY,
        libraries: ['places', 'geometry'],
        region: 'JP',
        language: 'ja'
    },
    
    // 地図設定
    map: {
        defaultCenter: { lat: 35.6895, lng: 139.6917 }, // 東京駅
        defaultZoom: 10,
        searchZoom: 13,
        maxZoom: 18,
        minZoom: 5
    },
    
    // 検索設定
    search: {
        radius: 20000, // 20km
        maxResults: 50,
        timeout: 10000, // 10秒
        enableHighAccuracy: true,
        maximumAge: 300000 // 5分
    },
    
    // 夜間営業時間の定義
    nightHours: {
        startHour: 19, // 19:00から
        endHour: 9     // 翌9:00まで
    },
    
    // アニメーション設定
    animation: {
        heartbeatDuration: 2000, // 2秒
        mapTransitionDuration: 1000, // 1秒
        cardHighlightDuration: 2000 // 2秒
    },
    
    // UI設定
    ui: {
        loadingMinDisplayTime: 1000, // 最小表示時間1秒
        errorDisplayTime: 5000, // エラー表示時間5秒
        successMessageTime: 3000 // 成功メッセージ表示時間3秒
    },
    
    // ログ設定
    logging: {
        enabled: ENVIRONMENT.isDevelopment,
        level: ENVIRONMENT.isDevelopment ? 'debug' : 'error'
    }
};

// 外部リンク設定
const EXTERNAL_LINKS = {
    website: 'https://crypto-paw.com/',
    twitter: 'https://twitter.com/intent/tweet',
    googleMaps: 'https://www.google.com/maps/search/?api=1'
};

// エクスポート（後方互換性のため）
const CONFIG = APP_CONFIG;
