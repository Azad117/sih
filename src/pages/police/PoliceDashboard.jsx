import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

// Import Leaflet and React-Leaflet from a CDN to make the component self-contained and fix build errors.
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// --- Leaflet CSS and Icon Fixes ---
// NOTE: Include leaflet.css in your main HTML file: <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Custom Icons (Inline SVG) ---
const policeIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="royalblue"><path d="M12 2L1 9l4 2.18V15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3.82L23 9z"/><path d="M12 16.5l-4-2.5v-4l4 2.5 4-2.5v4z"/></svg>'),
    iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38],
});
const touristIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-green-500"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>'),
    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
});


export default function PoliceDashboard() {
  const { stationId } = useParams(); // Get station ID from URL, e.g., /police/1

  // --- State Management ---
  const [station, setStation] = useState(null);
  const [tourists, setTourists] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. Initial Data Fetching (Station Details & Initial Tourist List) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [stationRes, touristsRes] = await Promise.all([
          axios.get(`/api/police-stations/${stationId}`),
          axios.get(`/api/police-stations/${stationId}/tourists`),
        ]);
        setStation(stationRes.data);
        setTourists(touristsRes.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch initial data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [stationId]);

  // --- 2. Real-Time Updates via WebSockets ---
  useEffect(() => {
    // Connect to the WebSocket server, passing the stationId in the query.
    const socket = io('http://localhost:3000', { query: { stationId } });

    socket.on('connect', () => console.log(`Socket connected for station ${stationId}`));

    // Listen for new critical alerts for this station
    socket.on('police-alert', (alert) => {
      console.log('Police received geofence alert:', alert);
      setCriticalAlerts((prev) => [alert, ...prev]);
    });

// --- NEW: Listen for high-priority panic alerts ---
    socket.on('panic-alert', (alert) => {
      console.log('Police received PANIC alert:', alert);
      // Add a property to distinguish panic alerts for styling
      const panicEvent = { ...alert, isPanic: true };
      setCriticalAlerts((prev) => [panicEvent, ...prev]);
    });
    
    // Listen for live location updates of tourists within this jurisdiction
    socket.on('tourist-location-update', (updatedTourist) => {
        setTourists(prevTourists => {
            const existing = prevTourists.find(t => t.id === updatedTourist.id);
            if (existing) {
                return prevTourists.map(t => t.id === updatedTourist.id ? {...t, location: updatedTourist.location, lastUpdated: updatedTourist.lastUpdated} : t);
            } else {
                return [...prevTourists, updatedTourist];
            }
        });
    });

    return () => socket.disconnect();
  }, [stationId]);

  if (loading) return <p className="text-center p-10 font-semibold">Loading Police Dashboard...</p>;
  if (error) return <p className="text-center p-10 text-red-600 bg-red-50 rounded-lg">Error: {error}</p>;
  if (!station) return <p className="text-center p-10">Station data not available.</p>;

  const [lng, lat] = station.location.coordinates;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {/* Left: Map + stats */}
      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-lg mb-3">Live Jurisdiction Map for: {station.name}</h3>
        <MapContainer center={[lat, lng]} zoom={13} style={{ height: '500px', width: '100%', borderRadius: '8px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Station Marker and Jurisdiction Circle */}
          <Marker position={[lat, lng]} icon={policeIcon}>
            <Popup>{station.name}</Popup>
          </Marker>
          <Circle center={[lat, lng]} radius={station.jurisdictionRadius} pathOptions={{ color: 'blue', fillOpacity: 0.1 }}>
             <Popup>Jurisdiction Radius: {station.jurisdictionRadius / 1000} km</Popup>
          </Circle>

          {/* Live Tourist Markers */}
          {tourists.map((t) => (
            <Marker key={t.id} position={[t.location.coordinates[1], t.location.coordinates[0]]} icon={touristIcon}>
              <Popup><b>{t.name}</b><br/>ID: {t.touristId}<br/>Safety Score: {t.safetyScore}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Right: Alerts */}
      <aside className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="font-semibold mb-2">Live Alerts</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {criticalAlerts.length > 0 ? (
            criticalAlerts.map((a) => (
              <div 
                key={a.id} 
                className={`p-3 border rounded-md ${
                  a.isPanic 
                  ? 'bg-red-500 text-white border-red-700 animate-pulse' 
                  : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                <p className="font-bold">
                  {a.isPanic ? '🚨 PANIC ALERT 🚨' : `Geofence Alert`}
                </p>
                <p className="text-sm mt-1">
                  <strong>{a.touristName}</strong> reported an emergency.
                  {a.zoneName !== 'SOS/Panic Event' && ` Near: ${a.zoneName}.`}
                </p>
                <p className="text-xs mt-1">{new Date(a.createdAt).toLocaleTimeString()}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No critical alerts for this station yet.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

