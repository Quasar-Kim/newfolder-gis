import * as Comlink from 'https://jspm.dev/comlink'
import workbox from 'https://jspm.dev/workbox-window'

const map = L.map('map', { zoomControl: false }).setView([36.02901093587494, 129.32806994448887], 14);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoia2ltanMzNTUwIiwiYSI6ImNqcWRlYXl0NTB6M2s0M253dTc0b2lnZmUifQ.RyACn_bFyprINnyG4E_OaQ'
}).addTo(map);
// L.control.searchBar({ position: 'topleft' }).addTo(map)
// L.control.zoom({ position: 'topright' }).addTo(map)

if ('serviceWorker' in navigator) {
    // Use the window load event to keep the page load performant
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}