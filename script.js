let selectedLatLng = null;
let marker = null;
let accessToken = null;

document.getElementById('image360').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('previewImage').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function initMap() {
  const defaultLocation = { lat: -12.0464, lng: -77.0428 }; // Lima, Perú
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: defaultLocation
  });

  map.addListener('click', function(event) {
    selectedLatLng = event.latLng;

    if (marker) marker.setMap(null);

    marker = new google.maps.Marker({
      position: selectedLatLng,
      map: map
    });
  });
}

function handleCredentialResponse(response) {
  const idToken = response.credential;
  console.log('ID Token:', idToken);

  // Simular token de acceso válido (en producción, enviar a tu backend para obtener access token)
  accessToken = 'SIMULATED_ACCESS_TOKEN';
  alert('Inicio de sesión exitoso');
}

async function uploadToStreetView() {
  if (!accessToken) {
    alert('Por favor, inicia sesión con tu cuenta de Google.');
    return;
  }

  if (!selectedLatLng) {
    alert('Por favor, selecciona una ubicación en el mapa.');
    return;
  }

  const file = document.getElementById('image360').files[0];
  if (!file) {
    alert('Por favor, selecciona una imagen 360°.');
    return;
  }

  alert('Subida simulada: imagen 360° y ubicación serían enviadas a la API de Street View Publish.');
}

window.onload = initMap;
