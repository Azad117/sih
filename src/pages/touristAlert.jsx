import React, { useState, useEffect } from 'react';

// To resolve the build errors, leaflet and react-leaflet are imported
// from a CDN that serves ES modules. This makes the component self-contained.
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// NOTE: The 'leaflet/dist/leaflet.css' file needs to be included in your main HTML file
// for the map to render correctly, like this:
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

// --- Fix for default Leaflet icon not showing up ---
// Uses CDN URLs to resolve the image paths.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// --- SIMULATION DATA & LOGIC (Inlined to remove context dependency) ---
const touristPath = [
    { lat: 13.1850, lng: 80.1650 }, { lat: 13.1840, lng: 80.1665 },
    { lat: 13.1830, lng: 80.1680 }, { lat: 13.1820, lng: 80.1695 },
    { lat: 13.1810, lng: 80.1710 }, { lat: 13.1800, lng: 80.1725 },
    { lat: 13.1790, lng: 80.1740 }, { lat: 13.1785, lng: 80.1745 },
    { lat: 13.1780, lng: 80.1750 }, { lat: 13.1775, lng: 80.1755 },
];

const riskZone = {
    name: 'Redhills Market Area',
    center: { lat: 13.1780, lng: 80.1750 },
    warningRadius: 1000,
    criticalRadius: 400,
};

const getDistance = (pos1, pos2) => {
    const R = 6371e3; // meters
    const φ1 = pos1.lat * Math.PI / 180; const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180; const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};


export default function TouristAlert() {
    // State is now managed directly within the component
    const [tourist, setTourist] = useState({ name: 'Rohan Desai', position: touristPath[0] });
    const [touristAlerts, setTouristAlerts] = useState([]);
    const [pathIndex, setPathIndex] = useState(0);

    // Refs to track if alerts have been triggered
    const triggeredWarning = React.useRef(false);
    const triggeredCritical = React.useRef(false);

    // Effect for the simulation interval
    useEffect(() => {
        const interval = setInterval(() => {
            setPathIndex(prevIndex => (prevIndex + 1) % touristPath.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Effect to update tourist position and check for alerts
    useEffect(() => {
        const newPosition = touristPath[pathIndex];
        setTourist(prev => ({ ...prev, position: newPosition }));

        const distance = getDistance(newPosition, riskZone.center);

        if (distance <= riskZone.criticalRadius && !triggeredCritical.current) {
            triggeredCritical.current = true;
            const alert = { id: Date.now(), type: 'critical', title: 'CRITICAL: High-Risk Zone', message: `You have entered a high-risk area: ${riskZone.name}.` };
            setTouristAlerts(prev => [alert, ...prev]);
        } else if (distance <= riskZone.warningRadius && !triggeredWarning.current) {
            triggeredWarning.current = true;
            const alert = { id: Date.now(), type: 'warning', title: 'Warning: Approaching Risky Area', message: `You are near ${riskZone.name}. Exercise caution.` };
            setTouristAlerts(prev => [alert, ...prev]);
        }
    }, [pathIndex]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-semibold mb-3 text-lg">Tourist Live Map</h3>
                <MapContainer center={tourist.position} zoom={15} style={{ height: '24rem', width: '100%' }} className="rounded-md">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={tourist.position}>
                        <Popup>Your Location</Popup>
                    </Marker>
                    <Circle center={riskZone.center} radius={riskZone.warningRadius} pathOptions={{ color: 'orange', fillOpacity: 0.1 }} />
                    <Circle center={riskZone.center} radius={riskZone.criticalRadius} pathOptions={{ color: 'red', fillOpacity: 0.2 }} />
                </MapContainer>
            </div>
            <aside className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-3">Your Alerts</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {touristAlerts.length === 0 ? (
                        <p className="text-sm text-gray-500">No alerts yet. You are in a safe area.</p>
                    ) : (
                        touristAlerts.map(alert => (
                            <div key={alert.id} className={`p-3 rounded-lg border ${alert.type === 'critical' ? 'bg-red-100 border-red-200 text-red-800' : 'bg-yellow-100 border-yellow-200 text-yellow-800'}`}>
                                <p className="font-semibold">{alert.title}</p>
                                <p className="text-sm">{alert.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </div>
    );
}

