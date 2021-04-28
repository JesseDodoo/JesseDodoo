var OpenStreetMap_Mapnik = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    minZoom: 3,
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

//Create Leaflet Map
var map = L.map("mapid", {
  center: [34.0, -111.8],
  zoom: 2,
  attributionControl: true,
  layers: [OpenStreetMap_Mapnik],
});

map.createPane("labels");

var weatherMap = L.tileLayer(
  "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=85cd2937e01b4a4afef0c2bd3a49a097",
  {
    minZoom: 3,
    maxZoom: 19,
    transparent: true,
    attribution:
      '&copy; <a href="https://www.openweathermap.org/copyright">OpenWeatherMap</a> contributors',
    pane: "labels",
  }
);

var defaultEmptyLayer = L.tileLayer("").addTo(map);
var overlayMaps = {
  Empty: defaultEmptyLayer,
  Countries: L.geoJSON(geojson),
  "Heat Map": weatherMap,
};

L.control.layers(overlayMaps).addTo(map);

const issIcon = L.icon({
  iconUrl: "./images/issIcon.png", 
  iconSize: [80, 32],
  iconAnchor: [9, 5],
   
});

//track International Space Statcion
const api_url = "https://api.wheretheiss.at/v1/satellites/25544";

async function getISS() {
  const response = await fetch(api_url);
  const data = await response.json();
  const { latitude, longitude } = data;

  const markerISS = L.marker([latitude, longitude], { icon: issIcon }).addTo(map);

  markerISS.bindPopup("<b>I am the International Space Station!").openPopup();

  document.getElementById("lat").textContent = latitude;
  document.getElementById("lon").textContent = longitude;
}

getISS();

const successCallback = (position) => {
  console.log(position);
};

const errorCallback = (error) => {
  console.error(error);
};

navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
  });
}
