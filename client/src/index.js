import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import { fromLonLat } from 'ol/proj';

// ==================== КООРДИНАТЫ ВАШИХ ДАННЫХ ====================
// Центр вашего участка (СНТ Сокский-1, Красноярский район)
const CENTER = [50.319, 53.4187];  // Долгота, Широта
const ZOOM = 18;  // Хороший зум для просмотра домов

// ==================== СЛОИ ====================

// Подложка OpenStreetMap
const osmLayer = new TileLayer({
  source: new OSM(),
  zIndex: 0
});

// Функция создания WMS слоя с обработкой ошибок
const createWmsLayer = (layerName, zIndex, visible = true) => {
  const source = new ImageWMS({
    url: 'http://localhost:8080/geoserver/gis/wms',
    params: { 
      'LAYERS': `gis:${layerName}`, 
      'TILED': true,
      'FORMAT': 'image/png',
      'TRANSPARENT': true
    },
    serverType: 'geoserver',
    ratio: 1
  });
  
  return new ImageLayer({
    source: source,
    visible: visible,
    zIndex: zIndex
  });
};

// Слои из GeoServer
const buildingsLayer = createWmsLayer('buildings', 1, true);
const roadsLayer = createWmsLayer('roads', 2, true);
const poiLayer = createWmsLayer('poi', 3, true);

// Создаем карту с центром на ваших данных
const map = new Map({
  target: 'map',
  layers: [osmLayer, buildingsLayer, roadsLayer, poiLayer],
  view: new View({
    center: fromLonLat(CENTER),  // Конвертируем градусы в проекцию карты
    zoom: ZOOM
  })
});

// Добавляем информационную панель с вашими координатами
const infoDiv = document.createElement('div');
infoDiv.style.cssText = `
  position: absolute;
  bottom: 15px;
  left: 15px;
  background: rgba(0,0,0,0.7);
  color: #0f0;
  padding: 8px 15px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 12px;
  z-index: 1000;
  pointer-events: none;
`;
infoDiv.innerHTML = '📍 СНТ «Сокский-1», Красноярский район | Центр: 50.319, 53.419';
document.body.appendChild(infoDiv);

// Добавляем координаты мыши (опционально)
const mouseCoordsDiv = document.createElement('div');
mouseCoordsDiv.style.cssText = `
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 8px 15px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 12px;
  z-index: 1000;
`;
mouseCoordsDiv.innerHTML = 'Координаты: --';
document.body.appendChild(mouseCoordsDiv);

// Отображение координат при движении мыши
map.on('pointermove', (event) => {
  const coords = map.getCoordinateFromPixel(event.pixel);
  const lonLat = fromLonLat(coords, 'EPSG:3857');
  // Конвертируем обратно в градусы для отображения
  const lon = lonLat[0];
  const lat = lonLat[1];
  mouseCoordsDiv.innerHTML = `Координаты: ${lon.toFixed(6)}, ${lat.toFixed(6)}`;
});

// Проверка подключения к GeoServer
const checkGeoServerConnection = async () => {
  try {
    const response = await fetch('http://localhost:8080/geoserver/gis/wms?service=WMS&version=1.1.0&request=GetCapabilities');
    if (response.ok) {
      infoDiv.style.color = '#0f0';
      infoDiv.innerHTML = '✅ GeoServer: OK | 📍 СНТ «Сокский-1» | 🏠 Домов: 12 | 🛣️ Дорог: 3';
    } else {
      infoDiv.innerHTML = '⚠️ GeoServer ответил с ошибкой';
      infoDiv.style.color = '#ff0';
    }
  } catch (error) {
    infoDiv.innerHTML = '❌ GeoServer недоступен. Запустите: docker compose up -d';
    infoDiv.style.color = '#f00';
  }
};

// Переключение слоёв
document.getElementById('buildings').addEventListener('change', e => {
  buildingsLayer.setVisible(e.target.checked);
  console.log(`Здания: ${e.target.checked ? 'показаны' : 'скрыты'}`);
});

document.getElementById('roads').addEventListener('change', e => {
  roadsLayer.setVisible(e.target.checked);
  console.log(`Дороги: ${e.target.checked ? 'показаны' : 'скрыты'}`);
});

document.getElementById('poi').addEventListener('change', e => {
  poiLayer.setVisible(e.target.checked);
  console.log(`POI: ${e.target.checked ? 'показаны' : 'скрыты'}`);
});

// Запускаем проверку подключения
setTimeout(() => {
  checkGeoServerConnection();
}, 1000);

console.log('Карта загружена! Центр: СНТ Сокский-1, Самарская область');