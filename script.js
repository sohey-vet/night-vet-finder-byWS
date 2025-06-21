// Global variables
let map;
let service;
let infoWindow;
let currentLocation;
let markers = [];

// DOM elements
const currentLocationBtn = document.getElementById('currentLocationBtn');
const locationNameBtn = document.getElementById('locationNameBtn');
const locationNameInput = document.getElementById('locationNameInput');
const locationName = document.getElementById('locationName');
const searchBtn = document.getElementById('searchBtn');
const loadingArea = document.getElementById('loadingArea');
const errorArea = document.getElementById('errorArea');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const resultsArea = document.getElementById('resultsArea');
const hospitalsList = document.getElementById('hospitalsList');
const shareBtn = document.getElementById('shareBtn');
const feedbackBtn = document.getElementById('feedbackBtn');

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize Google Maps with default settings and styles
 * Sets up the map, places service, and info window
 */
function initMap() {
    console.log('initMap called - Google Maps API loaded');
    
    // Initialize map (will be updated with actual location later)
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Map element not found');
        return;
    }
    
    try {
        map = new google.maps.Map(mapElement, {
            zoom: 12,
            center: { lat: 35.6812, lng: 139.7671 }, // Tokyo Station
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        // Show map immediately after initialization
        document.getElementById('resultsArea').style.display = 'block';

        service = new google.maps.places.PlacesService(map);
        infoWindow = new google.maps.InfoWindow();
        
        console.log('Map initialized successfully');
        
        // 成功メッセージを地図エリアに表示
        mapElement.style.border = '2px solid #28a745';
        
    } catch (error) {
        console.error('Map initialization error:', error);
        mapElement.innerHTML = '<div style="text-align:center;padding:50px;color:#dc3545;"><h3>⚠️ 地図初期化エラー</h3><p>' + error.message + '</p></div>';
    }
}

// Make initMap available globally
window.initMap = initMap;

/**
 * Initialize app functionality and event listeners
 * Sets up button handlers, keyboard events, and search functionality
 */
function initializeApp() {
    // Search method toggle
    currentLocationBtn.addEventListener('click', function() {
        setSearchMethod('current');
    });

    locationNameBtn.addEventListener('click', function() {
        setSearchMethod('name');
    });

    // Search button
    searchBtn.addEventListener('click', function() {
        performSearch();
    });

    // Retry button
    retryBtn.addEventListener('click', function() {
        hideError();
        performSearch();
    });

    // Share button
    shareBtn.addEventListener('click', function() {
        shareToTwitter();
    });

    // Feedback button
    feedbackBtn.addEventListener('click', function() {
        openFeedbackForm();
    });

    // Enter key for location name input
    locationName.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

/**
 * Set search method (current location or by name)
 * @param {string} method - 'current' for current location, 'name' for location name
 */
function setSearchMethod(method) {
    if (method === 'current') {
        currentLocationBtn.classList.add('active');
        locationNameBtn.classList.remove('active');
        locationNameInput.style.display = 'none';
    } else {
        currentLocationBtn.classList.remove('active');
        locationNameBtn.classList.add('active');
        locationNameInput.style.display = 'block';
        locationName.focus();
    }
}

/**
 * Perform search based on selected method
 * Validates prerequisites and delegates to appropriate search function
 */
function performSearch() {
    console.log('performSearch called');
    
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
        showError('Google Maps APIが読み込まれていません。ページを再読み込みしてください。');
        return;
    }
    
    // Check if map is initialized
    if (!map) {
        showError('地図が初期化されていません。少し待ってから再試行してください。');
        return;
    }
    
    hideResults();
    hideError();
    showLoading();

    if (currentLocationBtn.classList.contains('active')) {
        searchByCurrentLocation();
    } else {
        searchByLocationName();
    }
}

/**
 * Search for hospitals using device's current location
 * Uses geolocation API to get coordinates and search nearby hospitals
 */
function searchByCurrentLocation() {
    if (!navigator.geolocation) {
        showError('位置情報がサポートされていません。地名で検索してください。');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            map.setCenter(currentLocation);
            searchHospitals(currentLocation);
        },
        function(error) {
            let errorMsg = '位置情報の取得に失敗しました。';
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
            showError(errorMsg);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

/**
 * Search for hospitals by location name
 * Uses geocoding to convert location name to coordinates
 */
function searchByLocationName() {
    let location = locationName.value.trim();
    if (!location) {
        location = '東京'; // Default to Tokyo if no input
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, function(results, status) {
        if (status === 'OK' && results[0]) {
            currentLocation = results[0].geometry.location;
            map.setCenter(currentLocation);
            searchHospitals(currentLocation);
        } else {
            showError('指定された地名が見つかりません。別の地名をお試しください。');
        }
    });
}

/**
 * Search for hospitals using Google Places API
 * @param {google.maps.LatLng|Object} location - Search center location
 */
function searchHospitals(location) {
    clearMarkers();

    const request = {
        location: location,
        radius: 10000, // 10km radius
        keyword: '夜間救急 動物病院',
        type: 'veterinary_care',
        openNow: true
    };

    service.nearbySearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            // Sort by distance
            results.sort((a, b) => {
                const distanceA = calculateDistance(location, a.geometry.location);
                const distanceB = calculateDistance(location, b.geometry.location);
                return distanceA - distanceB;
            });

            displayResults(results, location);
        } else {
            // Try alternative search
            const alternativeRequest = {
                location: location,
                radius: 15000, // Expand radius
                keyword: '動物病院 休日診療',
                type: 'veterinary_care'
            };

            service.nearbySearch(alternativeRequest, function(altResults, altStatus) {
                if (altStatus === google.maps.places.PlacesServiceStatus.OK && altResults.length > 0) {
                    altResults.sort((a, b) => {
                        const distanceA = calculateDistance(location, a.geometry.location);
                        const distanceB = calculateDistance(location, b.geometry.location);
                        return distanceA - distanceB;
                    });
                    displayResults(altResults, location);
                } else {
                    showError('この周辺には現在診療中の夜間救急病院が見つかりませんでした。検索範囲を広げるか、地域の動物医師会などにご確認ください。');
                }
            });
        }
    });
}

/**
 * Display search results on map and in list
 * @param {Array} places - Array of place objects from Places API
 * @param {google.maps.LatLng|Object} userLocation - User's location
 */
function displayResults(places, userLocation) {
    hideLoading();
    showResults();

    // Clear previous results
    hospitalsList.innerHTML = '';

    // Add markers and create hospital cards
    places.forEach((place, index) => {
        // Add marker to map
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            icon: {
                url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="15" fill="#dc3545" stroke="white" stroke-width="2"/>
                        <text x="16" y="20" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">+</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            }
        });

        // Add hospital name label below the marker
        const infoLabel = new google.maps.InfoWindow({
            content: `<div style="font-size: 12px; font-weight: bold; color: #333; text-align: center; padding: 2px 4px;">${place.name}</div>`,
            position: place.geometry.location,
            disableAutoPan: true,
            pixelOffset: new google.maps.Size(0, 40)
        });
        infoLabel.open(map);

        markers.push(marker);

        // Add click listener for marker
        marker.addListener('click', function() {
            infoWindow.setContent(`
                <div style="max-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px;">${place.name}</h3>
                    <p style="margin: 0; font-size: 14px; color: #666;">${place.vicinity}</p>
                </div>
            `);
            infoWindow.open(map, marker);
        });

        // Create hospital card
        const hospitalCard = createHospitalCard(place, userLocation);
        hospitalsList.appendChild(hospitalCard);
    });

    // Adjust map bounds to show all markers
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(userLocation);
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
    }
}

/**
 * Create hospital card element for display
 * @param {Object} place - Place object from Places API
 * @param {google.maps.LatLng|Object} userLocation - User's location
 * @return {HTMLElement} Hospital card element
 */
function createHospitalCard(place, userLocation) {
    const distance = calculateDistance(userLocation, place.geometry.location);
    const distanceText = distance < 1 ? `約${Math.round(distance * 1000)}m` : `約${distance.toFixed(1)}km`;

    const card = document.createElement('div');
    card.className = 'hospital-card';
    
    card.innerHTML = `
        <div class="hospital-name">${place.name}</div>
        <div class="hospital-distance">${distanceText}</div>
        <div class="hospital-address">${place.vicinity}</div>
        ${place.formatted_phone_number ? `<div class="hospital-phone">📞 ${place.formatted_phone_number}</div>` : ''}
        <div class="hospital-actions">
            ${place.formatted_phone_number ? 
                `<button class="hospital-action-btn phone-btn" onclick="callHospital('${place.formatted_phone_number}')">
                    📞 電話をかける
                </button>` : ''
            }
            <button class="hospital-action-btn map-btn" onclick="openInMaps(${place.geometry.location.lat()}, ${place.geometry.location.lng()}, '${encodeURIComponent(place.name)}')">
                🗺️ 地図アプリで開く
            </button>
        </div>
    `;

    return card;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} pos1 - First position with lat/lng
 * @param {Object} pos2 - Second position with lat/lng
 * @return {number} Distance in kilometers
 */
function calculateDistance(pos1, pos2) {
    const lat1 = typeof pos1.lat === 'function' ? pos1.lat() : pos1.lat;
    const lng1 = typeof pos1.lng === 'function' ? pos1.lng() : pos1.lng;
    const lat2 = typeof pos2.lat === 'function' ? pos2.lat() : pos2.lat;
    const lng2 = typeof pos2.lng === 'function' ? pos2.lng() : pos2.lng;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/**
 * Initiate phone call to hospital
 * @param {string} phoneNumber - Hospital phone number
 */
function callHospital(phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
}

/**
 * Open location in device's maps app
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} name - Location name
 */
function openInMaps(lat, lng, name) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
        window.open(`maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
    } else if (isAndroid) {
        window.open(`geo:${lat},${lng}?q=${lat},${lng}(${name})`);
    } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
}

/**
 * Clear all markers from the map
 */
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingArea.style.display = 'block';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingArea.style.display = 'none';
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    hideLoading();
    errorMessage.textContent = message;
    errorArea.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
    errorArea.style.display = 'none';
}

/**
 * Show search results area
 */
function showResults() {
    resultsArea.style.display = 'block';
}

/**
 * Hide search results area
 */
function hideResults() {
    resultsArea.style.display = 'none';
}

/**
 * Share app to Twitter with predefined message
 */
function shareToTwitter() {
    const text = '夜間救急どうぶつ病院マップで緊急時の動物病院を検索しました！';
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
}

/**
 * Open feedback form for user input
 */
function openFeedbackForm() {
    // This would typically open a feedback form or redirect to a feedback page
    alert('ご意見・ご感想をお聞かせください。\n\n情報が古い場合や改善点がございましたら、お知らせください。');
}