let map;
let userMarker;
let formVisible = true;

document.addEventListener("DOMContentLoaded", () => {
    map = L.map('map').fitWorld();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.locate({setView: true, maxZoom: 16});

    function onLocationFound(e) {
        if (userMarker) {
            map.removeLayer(userMarker);
        }
        userMarker = L.marker(e.latlng).addTo(map)
            .bindPopup("Vous êtes ici").openPopup();

        // Sauvegarder les coordonnées dans des variables globales
        window.userLatLng = e.latlng;
    }

    map.on('locationfound', onLocationFound);

    map.on('locationerror', () => {
        alert("Localisation non trouvée");
    });

    map.on('click', (e) => {
        if (userMarker) {
            map.removeLayer(userMarker);
        }
        userMarker = L.marker(e.latlng).addTo(map)
            .bindPopup("Petite cellule ici").openPopup();

        window.userLatLng = e.latlng;
    });
});

function calculateCoverage() {
    // Récupérer les valeurs des champs de formulaire
    const Pt = parseFloat(document.getElementById('Pt').value);
    const Gt = parseFloat(document.getElementById('Gt').value);
    const Gr = parseFloat(document.getElementById('Gr').value);
    const Pr = parseFloat(document.getElementById('Pr').value);
    const frequency = parseFloat(document.getElementById('frequency').value) * 1e6; // MHz to Hz
    const hb = parseFloat(document.getElementById('hb').value);
    const hm = parseFloat(document.getElementById('hm').value);
    const environment = document.getElementById('environment').value;
    const model = document.getElementById('model').value;

    let d_max;

    if (model === 'FreeSpace') {
        // Modèle de propagation en espace libre
        const C = 20 * Math.log10(4 * Math.PI / 3e8); // c = vitesse de la lumière
        d_max = Math.pow(10, ((Pt + Gt + Gr - Pr - 20 * Math.log10(frequency) - C) / 20));
    } else if (model === 'HataUrban') {
        // Modèle de Hata pour environnement urbain
        const a_hm = (1.1 * Math.log10(frequency / 1e6) - 0.7) * hm - (1.56 * Math.log10(frequency / 1e6) - 0.8);
        const PL_d = 69.55 + 26.16 * Math.log10(frequency / 1e6) - 13.82 * Math.log10(hb) - a_hm + (44.9 - 6.55 * Math.log10(hb)) * Math.log10(1); // Pour d = 1 km, il faut ajuster cette valeur
        d_max = Math.pow(10, ((Pt + Gt + Gr - Pr - PL_d) / 20));
    }

    document.getElementById('coverageResult').innerText = `Distance maximale de couverture: ${d_max.toFixed(2)} mètres`;

    if (window.userLatLng) {
        displayMap(window.userLatLng.lat, window.userLatLng.lng, d_max); 
    } else {
        alert("Veuillez cliquer sur la carte pour définir la position de la petite cellule.");
    }
}

function displayMap(lat, lon, radius) {
    map.setView([lat, lon], 15);

    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup("Petite cellule ici").openPopup();

    L.circle([lat, lon], {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5,
        radius: radius
    }).addTo(map);
}

function toggleForm() {
    const form = document.getElementById('coverageForm');
    formVisible = !formVisible;
    if (formVisible) {
        form.classList.remove('hidden');
        document.getElementById('toggleButton').innerText = "Hide Form";
    } else {
        form.classList.add('hidden');
        document.getElementById('toggleButton').innerText = "Show Form";
    }
}
