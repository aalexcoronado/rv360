let map;
let markers = [];
let polyline;
let imageFiles = [];
let imageLocations = new Map();
let selectedImage = null;
let accessToken = null;

function handleCredentialResponse(response) {
  const idToken = response.credential;
  console.log('ID Token:', idToken);
  accessToken = 'SIMULATED_ACCESS_TOKEN';
  alert('Inicio de sesión exitoso');
}

function initMap() {
  const defaultLocation = { lat: -12.0464, lng: -77.0428 };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: defaultLocation
  });

  map.addListener('click', function(event) {
    if (selectedImage) {
      const location = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      imageLocations.set(selectedImage, location);
      updateMapMarkers();
    }
  });
}

async function getExifLocation(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const view = new DataView(e.target.result);
      EXIF.getData({ src: e.target.result }, function() {
        const lat = EXIF.getTag(this, "GPSLatitude");
        const lon = EXIF.getTag(this, "GPSLongitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
        const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

        if (lat && lon) {
          const latitude = (lat[0] + lat[1]/60 + lat[2]/3600) * (latRef === "N" ? 1 : -1);
          const longitude = (lon[0] + lon[1]/60 + lon[2]/3600) * (lonRef === "E" ? 1 : -1);
          resolve({ lat: latitude, lng: longitude });
        } else {
          resolve(null);
        }
      });
    };
    reader.readAsArrayBuffer(file);
  });
}

document.getElementById('image360').addEventListener('change', async function(event) {
  const files = Array.from(event.target.files);
  imageFiles = files;
  const previewContainer = document.getElementById('previewContainer');
  previewContainer.innerHTML = '';
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  if (polyline) polyline.setMap(null);

  for (const file of files) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'thumb';
      img.title = 'Click para seleccionar y ubicar en el mapa';
      img.addEventListener('click', () => {
        selectedImage = file.name;
        alert(`Seleccionada imagen: ${file.name}. Ahora haz clic en el mapa para ubicarla.`);
      });
      previewContainer.appendChild(img);

      const location = await getExifLocation(file);
      if (location) {
        imageLocations.set(file.name, location);
      }
      updateMapMarkers();
    };
    reader.readAsDataURL(file);
  }
});

function updateMapMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  const photoPoints = [];
  [...imageLocations.entries()].forEach(([name, location], index) => {
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      label: `${index + 1}`,
      title: `Foto: ${name}\nLat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}`
    });
    markers.push(marker);
    photoPoints.push(location);
  });

  if (photoPoints.length > 0) {
    map.setCenter(photoPoints[0]);
    if (polyline) polyline.setMap(null);
    polyline = new google.maps.Polyline({
      path: photoPoints,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: map
    });
  }
}

function uploadToStreetView() {
  if (!accessToken) {
    alert('Por favor, inicia sesión con tu cuenta de Google.');
    return;
  }

  if (imageFiles.length === 0) {
    alert('Por favor, selecciona al menos una imagen 360° con ubicación.');
    return;
  }

  imageFiles.forEach((file, index) => {
    const location = imageLocations.get(file.name);
    if (location) {
      console.log(`Subiendo imagen ${index + 1}: ${file.name} con ubicación`, location);
    } else {
      console.warn(`Imagen ${file.name} no tiene ubicación asignada.`);
    }
  });

  alert('Imágenes listas para ser subidas con ubicación a la API de Street View.');
}

window.onload = initMap;
