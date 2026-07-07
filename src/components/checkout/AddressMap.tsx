
'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

interface AddressMapProps {
  selectedPos: [number, number] | null;
  onLocationSelect: (pos: [number, number]) => void;
  center: [number, number];
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function AddressMap({ selectedPos, onLocationSelect, center }: AddressMapProps) {
  return (
    <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}>
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{x}/{y}/{z}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <MapEvents onLocationSelect={onLocationSelect} />
      {selectedPos && <Marker position={selectedPos} />}
    </MapContainer>
  );
}
