
'use client';

import { MapContainer, TileLayer, Marker, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
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

interface ZoneMapProps {
  points: [number, number][];
  onMapClick: (pos: [number, number]) => void;
  center: [number, number];
}

function Events({ onMapClick }: { onMapClick: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function ZoneMap({ points, onMapClick, center }: ZoneMapProps) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{x}/{y}/{z}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Events onMapClick={onMapClick} />
      {points?.map((pos, i) => (
        <Marker key={`marker-${i}`} position={pos} />
      ))}
      {points?.length > 1 && <Polyline positions={points} color="#FF6B00" weight={3} />}
      {points?.length > 2 && <Polygon positions={points} pathOptions={{ color: '#FF6B00', fillColor: '#FF6B00', fillOpacity: 0.2 }} />}
    </MapContainer>
  );
}
