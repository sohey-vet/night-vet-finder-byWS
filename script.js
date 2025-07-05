/**
 * 夜間救急どうぶつ病院マップ - メインアプリケーションファイル
 * 動物病院の検索・表示・管理機能を提供
 */

// ==========================================
// アプリケーション状態管理
// ==========================================
class AppState {
    constructor() {
        this.map = null;
        this.service = null;
        this.userLocation = null;
        this.markers = [];
        this.infoWindow = null;
        this.searchStartTime = null;
        this.isSearching = false;
    }

    reset() {
        this.userLocation = null;
        this.clearMarkers();
        this.searchStartTime = null;
        this.isSearching = false;
    }

    clearMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
    }
}

// ==========================================
// ロガークラス
// ==========================================
class Logger {
    static log(level, message, ...args) {
        if (!APP_CONFIG.logging.enabled) return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        
        switch (level) {
            case 'debug':
                console.log(prefix, message, ...args);
                break;
            case 'info':
                console.info(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'error':
                console.error(prefix, message, ...args);
                break;
        }
    }

    static debug(message, ...args) { this.log('debug', message, ...args); }
    static info(message, ...args) { this.log('info', message, ...args); }
    static warn(message, ...args) { this.log('warn', message, ...args); }
    static error(message, ...args) { this.log('error', message, ...args); }
}

// ==========================================
// DOM要素管理クラス
// ==========================================
class DOMManager {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    initializeElements() {
        const elementIds = [
            'loading', 'loading-message', 'error', 'hospitals-list',
            'no-results', 'cta-area', 'back-button-container', 'back-button',
            'map', 'search-current-location', 'location-input', 'search-by-name-btn'
        ];

        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
            if (!this.elements[id]) {
                Logger.warn(`Element with id '${id}' not found`);
            }
        });
    }

    get(elementId) {
        return this.elements[elementId];
    }

    show(elementId) {
        const element = this.get(elementId);
        if (element) element.classList.remove('hidden');
    }

    hide(elementId) {
        const element = this.get(elementId);
        if (element) element.classList.add('hidden');
    }

    setText(elementId, text) {
        const element = this.get(elementId);
        if (element) element.textContent = text;
    }

    setHTML(elementId, html) {
        const element = this.get(elementId);
        if (element) element.innerHTML = html;
    }
}

// ==========================================
// 夜間営業判定クラス
// ==========================================
class NightHoursChecker {
    static isOpenAtNight(openingHours) {
        if (!openingHours?.periods) {
            return false;
        }

        // 24時間営業の場合
        if (openingHours.periods.length === 1 && 
            openingHours.periods[0].open.time === '0000' && 
            !openingHours.periods[0].close) {
            return true;
        }

        const { startHour, endHour } = APP_CONFIG.nightHours;
        const nightStart = startHour * 100; // 19:00 -> 1900
        const nightEnd = endHour * 100;     // 09:00 -> 900

        for (const period of openingHours.periods) {
            if (!period.open || !period.close) continue;

            const openTime = parseInt(period.open.time, 10);
            const closeTime = parseInt(period.close.time, 10);

            // 日をまたぐ場合（例：月20:00-火08:00）
            if (period.open.day !== period.close.day) {
                return true;
            }

            // 夜の時間帯（19:00-24:00）に重なる
            if (openTime < 2400 && closeTime > nightStart) {
                return true;
            }

            // 朝の時間帯（00:00-09:00）に重なる
            if (openTime < nightEnd && closeTime > 0) {
                return true;
            }
        }

        return false;
    }
}

// ==========================================
// 地理計算ユーティリティ
// ==========================================
class GeoUtils {
    static calculateDistance(pos1, pos2) {
        const lat1 = typeof pos1.lat === 'function' ? pos1.lat() : pos1.lat;
        const lng1 = typeof pos1.lng === 'function' ? pos1.lng() : pos1.lng;
        const lat2 = typeof pos2.lat === 'function' ? pos2.lat() : pos2.lat;
        const lng2 = typeof pos2.lng === 'function' ? pos2.lng() : pos2.lng;

        const R = 6371000; // 地球の半径（メートル）
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
}

// ==========================================
// 営業時間フォーマッタークラス
// ==========================================
class OpeningHoursFormatter {
    static format(openingHours) {
        if (!openingHours?.weekday_text) {
            if (openingHours?.periods?.length === 1 && 
                openingHours.periods[0].open.time === '0000' && 
                !openingHours.periods[0].close) {
                return '<strong>診療時間:</strong><br>24時間営業';
            }
            return '<strong>診療時間:</strong><br>情報なし';
        }

        const hoursMap = new Map();
        const dayOrder = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

        // 営業時間ごとに曜日をグループ化
        openingHours.weekday_text.forEach(text => {
            const [day, ...timeParts] = text.split(': ');
            const time = timeParts.join(': ').trim() || '休診';
            if (!hoursMap.has(time)) {
                hoursMap.set(time, []);
            }
            hoursMap.get(time).push(day);
        });

        const resultLines = [];

        for (const [time, days] of hoursMap.entries()) {
            if (days.length === 0) continue;

            days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
            const dayGroups = this.groupConsecutiveDays(days, dayOrder);
            const formattedDayString = this.formatDayGroups(dayGroups);
            resultLines.push(`${formattedDayString}: ${time}`);
        }

        // 曜日順に並べ替え
        resultLines.sort((a, b) => {
            const firstDayA = a.split(/[:～・]/)[0];
            const firstDayB = b.split(/[:～・]/)[0];
            const dayIndexA = dayOrder.findIndex(d => d.startsWith(firstDayA));
            const dayIndexB = dayOrder.findIndex(d => d.startsWith(firstDayB));
            return dayIndexA - dayIndexB;
        });

        return '<strong>診療時間:</strong><br>' + resultLines.join('<br>');
    }

    static groupConsecutiveDays(days, dayOrder) {
        const dayGroups = [];
        let currentGroup = [days[0]];

        for (let i = 1; i < days.length; i++) {
            const prevDayIndex = dayOrder.indexOf(days[i - 1]);
            const currentDayIndex = dayOrder.indexOf(days[i]);
            
            if (currentDayIndex === prevDayIndex + 1) {
                currentGroup.push(days[i]);
            } else {
                dayGroups.push(currentGroup);
                currentGroup = [days[i]];
            }
        }
        dayGroups.push(currentGroup);
        return dayGroups;
    }

    static formatDayGroups(dayGroups) {
        return dayGroups.map(group => {
            const startDay = group[0].replace('曜日', '');
            if (group.length > 2) {
                const endDay = group[group.length - 1].replace('曜日', '');
                return `${startDay}～${endDay}`;
            } else {
                return group.map(d => d.replace('曜日', '')).join('・');
            }
        }).join('、');
    }
}

// ==========================================
// メインアプリケーションクラス
// ==========================================
class VetHospitalApp {
    constructor() {
        this.state = new AppState();
        this.dom = new DOMManager();
        this.initializeApp();
    }

    // Google Maps初期化
    initMap() {
        Logger.info('Initializing Google Maps');
        
        this.state.map = new google.maps.Map(this.dom.get('map'), {
            center: APP_CONFIG.map.defaultCenter,
            zoom: APP_CONFIG.map.defaultZoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            maxZoom: APP_CONFIG.map.maxZoom,
            minZoom: APP_CONFIG.map.minZoom
        });

        this.state.service = new google.maps.places.PlacesService(this.state.map);
        this.state.infoWindow = new google.maps.InfoWindow();
        
        this.setupEventListeners();
        Logger.info('Google Maps initialized successfully');
    }

    // イベントリスナー設定
    setupEventListeners() {
        // 現在地検索
        this.dom.get('search-current-location')?.addEventListener('click', () => {
            this.searchByCurrentLocation();
        });

        // 地名検索
        const locationInput = this.dom.get('location-input');
        const searchBtn = this.dom.get('search-by-name-btn');
        
        locationInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.searchByLocationName();
            }
        });

        searchBtn?.addEventListener('click', () => {
            this.searchByLocationName();
        });

        // その他のイベントリスナー
        this.setupUtilityEventListeners();
    }

    setupUtilityEventListeners() {
        // Xシェア
        document.getElementById('share-twitter')?.addEventListener('click', () => {
            this.shareToTwitter();
        });

        // フィードバック
        document.querySelector('.feedback-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showFeedbackForm();
        });

        // フィードバックフォーム送信
        document.getElementById('feedback-form-element')?.addEventListener('submit', (e) => {
            this.handleFeedbackSubmit(e);
        });

        // 戻るボタン
        this.dom.get('back-button')?.addEventListener('click', () => {
            this.resetUI();
        });
    }

    // 現在地検索
    async searchByCurrentLocation() {
        if (this.state.isSearching) return;
        
        this.showLoading('現在地から診療中の病院を探しています…');
        
        if (!navigator.geolocation) {
            this.handleError('お使いのブラウザは位置情報機能に対応していません。');
            return;
        }

        try {
            const position = await this.getCurrentPosition();
            this.state.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            await this.findHospitals(this.state.userLocation);
        } catch (error) {
            this.handleLocationError(error);
        }
    }

    // 地名検索
    async searchByLocationName() {
        if (this.state.isSearching) return;
        
        const locationName = this.dom.get('location-input')?.value.trim();
        if (!locationName) {
            this.showError('地名を入力してください。');
            return;
        }

        this.showLoading(`「${locationName}」周辺の診療中の病院を探しています…`);

        try {
            const geocoder = new google.maps.Geocoder();
            const results = await this.geocodeLocation(geocoder, locationName);
            
            if (results[0]?.partial_match) {
                Logger.warn('Geocoding resulted in partial match:', results[0]);
                this.handleError(`「${locationName}」に該当する日本の明確な地名が見つかりませんでした。`);
                return;
            }

            const location = results[0].geometry.location;
            this.state.userLocation = {
                lat: location.lat(),
                lng: location.lng()
            };
            
            await this.findHospitals(this.state.userLocation);
        } catch (error) {
            this.handleError('入力された地名が見つかりませんでした。別の地名で試してください。');
        }
    }

    // 位置情報取得のPromise化
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: APP_CONFIG.search.timeout,
                enableHighAccuracy: APP_CONFIG.search.enableHighAccuracy,
                maximumAge: APP_CONFIG.search.maximumAge
            });
        });
    }

    // ジオコーディングのPromise化
    geocodeLocation(geocoder, locationName) {
        return new Promise((resolve, reject) => {
            geocoder.geocode(
                { 
                    address: locationName, 
                    componentRestrictions: { country: 'JP' } 
                },
                (results, status) => {
                    if (status === 'OK' && results[0]) {
                        resolve(results);
                    } else {
                        reject(new Error(`Geocoding failed: ${status}`));
                    }
                }
            );
        });
    }

    // 病院検索
    async findHospitals(location) {
        if (this.state.isSearching) return;
        
        this.state.isSearching = true;
        this.clearResults();
        this.state.map.setCenter(location);
        this.state.map.setZoom(APP_CONFIG.map.searchZoom);

        // 現在地マーカー作成
        this.createCurrentLocationMarker(location);

        try {
            const results = await this.searchHospitals(location);
            const nightHospitals = await this.filterNightHospitals(results);
            
            await this.processSearchResults(nightHospitals, location);
        } catch (error) {
            Logger.error('Hospital search failed:', error);
            this.handleError('病院情報の検索中にエラーが発生しました。');
        } finally {
            this.state.isSearching = false;
        }
    }

    // 病院検索のPromise化
    searchHospitals(location) {
        return new Promise((resolve, reject) => {
            const request = {
                location: location,
                radius: APP_CONFIG.search.radius,
                query: '動物病院',
                type: 'veterinary_care'
            };

            this.state.service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    resolve(results);
                } else {
                    reject(new Error(`Search failed: ${status}`));
                }
            });
        });
    }

    // 夜間営業病院フィルタリング
    async filterNightHospitals(results) {
        const detailPromises = results.map(place => this.getPlaceDetails(place.place_id));
        const detailedResults = await Promise.all(detailPromises);
        
        return detailedResults
            .filter(place => place && NightHoursChecker.isOpenAtNight(place.opening_hours))
            .sort((a, b) => {
                const distanceA = GeoUtils.calculateDistance(this.state.userLocation, a.geometry.location);
                const distanceB = GeoUtils.calculateDistance(this.state.userLocation, b.geometry.location);
                return distanceA - distanceB;
            });
    }

    // 場所詳細取得のPromise化
    getPlaceDetails(placeId) {
        return new Promise((resolve) => {
            const request = {
                placeId: placeId,
                fields: ['name', 'place_id', 'geometry', 'formatted_address', 
                        'formatted_phone_number', 'opening_hours', 'website', 
                        'international_phone_number']
            };

            this.state.service.getDetails(request, (result, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            });
        });
    }

    // 検索結果処理
    async processSearchResults(nightHospitals, location) {
        const elapsedTime = Date.now() - this.state.searchStartTime;
        const delay = Math.max(0, APP_CONFIG.animation.heartbeatDuration - elapsedTime);

        setTimeout(() => {
            this.hideLoading(nightHospitals.length);

            if (nightHospitals.length === 0) {
                this.dom.show('no-results');
                return;
            }

            nightHospitals.forEach(place => {
                this.createHospitalMarker(place);
                this.createHospitalCard(place, location);
            });

            this.dom.show('cta-area');
            this.adjustMapBounds();
        }, delay);
    }

    // 現在地マーカー作成
    createCurrentLocationMarker(location) {
        const marker = new google.maps.Marker({
            position: location,
            map: this.state.map,
            title: '現在地',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc3545" width="24" height="24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>`
                ),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
            }
        });
        this.state.markers.push(marker);
    }

    // 病院マーカー作成
    createHospitalMarker(place) {
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: this.state.map,
            title: place.name,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#007BFF" width="24" height="24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>`
                ),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
            }
        });

        marker.addListener('click', () => {
            this.showMarkerInfo(marker, place);
        });

        this.state.markers.push(marker);
    }

    // マーカー情報表示
    showMarkerInfo(marker, place) {
        const content = `
            <div>
                <strong>${place.name}</strong><br>
                ${place.formatted_phone_number ? `電話: ${place.formatted_phone_number}<br>` : ''}
                <a href="${EXTERNAL_LINKS.googleMaps}&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}" target="_blank">Googleマップで見る</a>
            </div>
        `;
        
        this.state.infoWindow.setContent(content);
        this.state.infoWindow.open(this.state.map, marker);
        
        this.highlightHospitalCard(place.place_id);
    }

    // 病院カードハイライト
    highlightHospitalCard(placeId) {
        const card = document.querySelector(`[data-place-id="${placeId}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('highlight');
            setTimeout(() => {
                card.classList.remove('highlight');
            }, APP_CONFIG.animation.cardHighlightDuration);
        }
    }

    // 病院カード作成
    createHospitalCard(place, origin) {
        const distance = GeoUtils.calculateDistance(origin, place.geometry.location);
        
        const card = document.createElement('div');
        card.className = 'hospital-card';
        card.dataset.placeId = place.place_id;

        card.innerHTML = `
            <h3>${place.name}</h3>
            <p class="distance">📍 距離: 約${(distance / 1000).toFixed(1)}km</p>
            <p>🏠 住所: ${(place.formatted_address || '情報なし').replace(/^日本、/, '')}</p>
            <div class="opening-hours">${OpeningHoursFormatter.format(place.opening_hours)}</div>
            <div class="hospital-actions">
                ${this.createActionButtons(place)}
            </div>
        `;

        this.dom.get('hospitals-list')?.appendChild(card);
    }

    // アクションボタン作成
    createActionButtons(place) {
        let buttons = '';

        // 電話ボタン
        if (place.international_phone_number) {
            buttons += `<a href="tel:${place.international_phone_number}" class="btn call-btn">📞 電話をかける</a>`;
        } else {
            buttons += `<span class="btn call-btn disabled">電話番号なし</span>`;
        }

        // ウェブサイトボタン
        if (place.website) {
            buttons += `<a href="${place.website}" target="_blank" rel="noopener noreferrer" class="btn web-btn">🌐 病院ホームページ</a>`;
        }

        // 地図ボタン
        const mapUrl = `${EXTERNAL_LINKS.googleMaps}&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
        buttons += `<a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="btn map-btn">🗺️ 地図アプリで開く</a>`;

        return buttons;
    }

    // 地図境界調整
    adjustMapBounds() {
        if (this.state.markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            this.state.markers.forEach(marker => bounds.extend(marker.getPosition()));
            this.state.map.fitBounds(bounds);
            
            if (this.state.markers.length <= 2) {
                const listener = google.maps.event.addListener(this.state.map, 'idle', () => {
                    if (this.state.map.getZoom() > 14) {
                        this.state.map.setZoom(14);
                    }
                    google.maps.event.removeListener(listener);
                });
            }
        }
    }

    // UI制御メソッド
    showLoading(message) {
        this.state.searchStartTime = Date.now();
        this.clearResults();
        this.dom.hide('error');
        this.dom.hide('no-results');
        this.dom.hide('cta-area');
        this.dom.setText('loading-message', message);
        this.dom.show('loading');
    }

    hideLoading(resultsCount = -1) {
        if (resultsCount > 0 || resultsCount === -1) {
            this.dom.hide('loading');
            return;
        }

        if (resultsCount === 0) {
            this.dom.setText('loading-message', 'この周辺に、現在診療中の夜間救急病院は見つかりませんでした。');
            this.dom.show('back-button-container');
        }
    }

    showError(message) {
        this.clearResults();
        this.hideLoading();
        this.dom.hide('no-results');
        this.dom.hide('cta-area');
        this.dom.setText('error', message);
        this.dom.show('error');
    }

    clearResults() {
        this.state.clearMarkers();
        this.dom.setHTML('hospitals-list', '');
        this.dom.hide('error');
        this.dom.hide('no-results');
        this.dom.hide('cta-area');
    }

    resetUI() {
        this.clearResults();
        this.dom.hide('loading');
        this.dom.hide('back-button-container');
        this.dom.setText('loading-message', '現在地から診療中の病院を探しています…');
        this.state.reset();
    }

    handleLocationError(error) {
        let errorMsg = '位置情報の取得に失敗しました。';
        
        if (error.code) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = '位置情報の使用が許可されていません。ブラウザの設定を確認してください。';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = '位置情報が取得できません。地名で検索してください。';
                    break;
                case error.TIMEOUT:
                    errorMsg = '位置情報の取得がタイムアウトしました。もう一度お試しください。';
                    break;
            }
        }
        
        this.handleError(errorMsg);
        this.state.map.setCenter(APP_CONFIG.map.defaultCenter);
        this.state.map.setZoom(APP_CONFIG.map.minZoom);
    }

    handleError(message) {
        Logger.error('Application error:', message);
        this.showError(message);
    }

    // ユーティリティメソッド
    shareToTwitter() {
        const text = '夜間救急どうぶつ病院マップで緊急時の動物病院を検索しました！';
        const url = window.location.href;
        const twitterUrl = `${EXTERNAL_LINKS.twitter}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }

    showFeedbackForm() {
        document.getElementById('feedback-form')?.classList.remove('hidden');
        document.getElementById('feedback-form')?.scrollIntoView({ behavior: 'smooth' });
    }

    handleFeedbackSubmit(e) {
        e.preventDefault();
        
        const feedbackType = document.getElementById('feedback-type')?.value;
        const feedbackMessage = document.getElementById('feedback-message')?.value;
        
        if (!feedbackType) {
            alert('報告の種類を選択してください。');
            return;
        }
        
        Logger.info('Feedback submitted:', { type: feedbackType, message: feedbackMessage });
        alert('フィードバックありがとうございます。貴重なご意見として承りました。');
        
        document.getElementById('feedback-form-element')?.reset();
        document.getElementById('feedback-form')?.classList.add('hidden');
    }

    // アプリケーション初期化
    initializeApp() {
        Logger.info('Initializing VetHospitalApp');
        
        // DOM準備完了後に実行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.dom = new DOMManager();
            });
        }
    }
}

// ==========================================
// グローバル関数（Google Maps API用）
// ==========================================
let app;

function initMap() {
    app = new VetHospitalApp();
    app.initMap();
}

// ウィンドウに関数を登録
window.initMap = initMap;

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    if (!window.app) {
        window.app = new VetHospitalApp();
    }
});