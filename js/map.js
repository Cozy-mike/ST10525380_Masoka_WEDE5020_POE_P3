/* =========================================================
   map.js — interactive map on contact.html (Leaflet, self-hosted
   in /vendor/leaflet so it works without a CDN)

   - Marker + popup for the shelter
   - Scroll-wheel zoom only after the visitor clicks the map
     (so the page can still be scrolled past it)
   - "How far am I?" uses the Geolocation API and the haversine
     formula to show the distance, and fits both points on screen
   - Initialised lazily, when the map is about to scroll into view
   ========================================================= */
(function () {
    'use strict';

    var host = document.getElementById('map');
    if (!host) { return; }

    var S = (window.PAWS_CONFIG || {}).shelter;
    var status = document.getElementById('map-status');
    var locateBtn = document.getElementById('locate-btn');
    var map = null, userMarker = null, line = null;

    function init() {
        if (map) { return; }
        if (!window.L) {
            host.querySelector('.map-fallback').textContent =
                'The interactive map could not load. Our address is ' + S.address + '.';
            if (locateBtn) { locateBtn.disabled = true; }
            return;
        }
        host.textContent = '';                                  // remove the fallback text

        L.Icon.Default.imagePath = 'vendor/leaflet/images/';
        map = L.map(host, { scrollWheelZoom: false }).setView([S.lat, S.lng], 15);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Popup content built with DOM methods, not HTML strings
        var pop = document.createElement('div');
        var title = document.createElement('strong'); title.textContent = S.name;
        var addr = document.createElement('div'); addr.textContent = S.address;
        var hrs = document.createElement('div'); hrs.textContent = S.hours;
        pop.appendChild(title); pop.appendChild(addr); pop.appendChild(hrs);

        L.marker([S.lat, S.lng], { title: S.name, alt: S.name + ' location' }).addTo(map).bindPopup(pop).openPopup();

        map.once('focus', function () { map.scrollWheelZoom.enable(); });
        host.addEventListener('click', function () { if (map) { map.scrollWheelZoom.enable(); } });
    }

    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) { init(); io.disconnect(); }
        }, { rootMargin: '300px' });
        io.observe(host);
    } else {
        init();
    }

    /* Haversine distance in km between two lat/lng points */
    function distanceKm(lat1, lng1, lat2, lng2) {
        var R = 6371, rad = Math.PI / 180;
        var dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    if (locateBtn) {
        locateBtn.addEventListener('click', function () {
            init();
            if (!map) { return; }
            if (!navigator.geolocation) {
                status.textContent = 'Your browser does not support location lookup.';
                return;
            }
            status.textContent = 'Finding your location…';
            locateBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(function (pos) {
                var lat = pos.coords.latitude, lng = pos.coords.longitude;
                var km = distanceKm(lat, lng, S.lat, S.lng);
                status.textContent = 'You are about ' + (km < 10 ? km.toFixed(1) : Math.round(km)) + ' km (as the crow flies) from the shelter.';

                if (userMarker) { map.removeLayer(userMarker); }
                if (line) { map.removeLayer(line); }
                userMarker = L.circleMarker([lat, lng], { radius: 8, color: '#1F5FA8', fillColor: '#1F5FA8', fillOpacity: 0.8 })
                    .addTo(map).bindTooltip('You are here');
                line = L.polyline([[lat, lng], [S.lat, S.lng]], { color: '#F2994A', weight: 3, dashArray: '6 8' }).addTo(map);
                map.fitBounds(L.latLngBounds([[lat, lng], [S.lat, S.lng]]).pad(0.25));
                locateBtn.disabled = false;
            }, function (err) {
                status.textContent = err.code === 1
                    ? 'Location access was blocked. You can still use "Get directions" below.'
                    : 'We could not work out your location. Try "Get directions" instead.';
                locateBtn.disabled = false;
            }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
        });
    }
}());
