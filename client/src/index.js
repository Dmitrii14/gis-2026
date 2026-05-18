import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import { fromLonLat, transform } from 'ol/proj';


const CENTER = [50.319, 53.4187];
const ZOOM = 18;

const osmLayer = new TileLayer({
  source: new OSM(),
  zIndex: 0
});

const createWmsLayer = (layerName, zIndex, visible = true) => {
  return new ImageLayer({
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/gis/wms',
      params: { 
        'LAYERS': `gis:${layerName}`, 
        'TILED': true,
        'FORMAT': 'image/png',
        'TRANSPARENT': true
      },
      serverType: 'geoserver',
      ratio: 1
    }),
    visible: visible,
    zIndex: zIndex
  });
};

const buildingsLayer = createWmsLayer('buildings', 1, true);
const roadsLayer = createWmsLayer('roads', 2, true);
const poiLayer = createWmsLayer('poi', 3, true);

const map = new Map({
  target: 'map',
  layers: [osmLayer, buildingsLayer, roadsLayer, poiLayer],
  view: new View({
    center: fromLonLat(CENTER),
    zoom: ZOOM
  })
});

const statusPanel = document.getElementById('statusPanel');
const coordsPanel = document.getElementById('coordsPanel');

map.on('pointermove', (event) => {
  const coords3857 = map.getCoordinateFromPixel(event.pixel);
  const coords4326 = transform(coords3857, 'EPSG:3857', 'EPSG:4326');
  const lon = coords4326[0];
  const lat = coords4326[1];
  
  if (isNaN(lon) || isNaN(lat)) {
    coordsPanel.innerHTML = `Координаты: --`;
  } else {
    coordsPanel.innerHTML = `Координаты: ${lon.toFixed(6)}, ${lat.toFixed(6)}`;
  }
});

const checkGeoServerConnection = async () => {
  try {
    const response = await fetch('http://localhost:8080/geoserver/gis/wms?service=WMS&version=1.1.0&request=GetCapabilities');
    if (response.ok) {
      statusPanel.innerHTML = 'GeoServer подключен';
      statusPanel.style.color = '#0f0';
    } else {
      statusPanel.innerHTML = 'GeoServer ответил с ошибкой';
      statusPanel.style.color = '#ff0';
    }
  } catch (error) {
    statusPanel.innerHTML = 'GeoServer недоступен. Запустите: docker compose up -d';
    statusPanel.style.color = '#f00';
  }
};

document.getElementById('buildings').addEventListener('change', e => {
  buildingsLayer.setVisible(e.target.checked);
});

document.getElementById('roads').addEventListener('change', e => {
  roadsLayer.setVisible(e.target.checked);
});

document.getElementById('poi').addEventListener('change', e => {
  poiLayer.setVisible(e.target.checked);
});

checkGeoServerConnection();