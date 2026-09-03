
'use client';

import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TrackingMapProps {
  deliveryPos: [number, number];
  storePos?: [number, number];
}

export default function TrackingMap({ deliveryPos, storePos = [28.6139, 77.2090] }: TrackingMapProps) {
  return (
    <MapContainer 
      center={deliveryPos} 
      zoom={14} 
      style={{ height: '100%', width: '100%', borderRadius: '2rem' }}
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
    >
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{x}/{y}/{z}.png"
        attribution='&copy; OpenStreetMap'
      />
      <Marker position={storePos} />
      <Marker position={deliveryPos} />
      <Polyline positions={[storePos, deliveryPos]} color="#FF6B00" weight={3} dashArray="10, 10" />
    </MapContainer>
  );
}
