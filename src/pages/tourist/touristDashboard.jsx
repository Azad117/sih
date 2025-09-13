import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

// To resolve the build errors, 'react-leaflet' and 'leaflet' are imported
// from a CDN that serves ES modules. This makes the component self-contained.
import { MapContainer, TileLayer, Marker, Popup, Circle,Polyline } from 'react-leaflet';
import L from 'leaflet';


// NOTE: The leaflet.css file needs to be included in your main HTML file
// for the map to render correctly, like this:
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />


// --- INLINED: The SafetyCard component is now defined inside this file ---
function SafetyCard({ name, score }) {
  // Constants for the circular progress bar
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Determine color and status text based on the safety score
  let colorClass, statusText;
  if (score >= 80) {
    colorClass = 'text-green-500';
    statusText = 'Safety Status: Good';
  } else if (score > 50) {
    colorClass = 'text-yellow-500';
    statusText = 'Safety Status: Caution';
  } else {
    colorClass = 'text-red-500';
    statusText = 'Safety Status: High Risk';
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
      <h4 className="font-bold text-xl text-gray-800">{name || 'Tourist'}</h4>
      <p className="text-sm text-gray-500 mb-4">Live Safety Score</p>

      {/* Circular Progress Bar Visualization */}
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
          />
          <circle
            className={colorClass}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="64"
            cy="64"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <span className={`absolute text-4xl font-extrabold ${colorClass}`}>{score}</span>
      </div>

      <p className={`mt-4 font-semibold ${colorClass}`}>{statusText}</p>
      <p className="text-xs text-gray-400 mt-2">Score is updated in real-time based on location and proximity to risk zones.</p>
    </div>
  );
}

// --- FIX: Use CDN URLs for Leaflet's default icon images ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Custom Icon for Police Stations (Inline SVG) ---
const policeIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="royalblue"><path d="M12 2L1 9l4 2.18V15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3.82L23 9z"/><path d="M12 16.5l-4-2.5v-4l4 2.5 4-2.5v4z"/></svg>'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// --- Custom Icon for Waypoints (Inline SVG) ---
const waypointIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="darkgreen"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});


export default function TouristDashboard() {
  const { touristId } = useParams();
  const mapRef = useRef(null);

  // --- State Management ---
  const [tourist, setTourist] = useState(null);
  const [riskZones, setRiskZones] = useState([]);
  const [policeStations, setPoliceStations] = useState([]); // Will now only hold the nearest station
  const [currentLocation, setCurrentLocation] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plannedRoute, setPlannedRoute] = useState(null);
  const [routeWaypoints, setRouteWaypoints] = useState([]);
  // --- FIX: The state for 'notification' is now correctly defined ---
  const [notification, setNotification] = useState('');
const [panicStatus, setPanicStatus] = useState('');
const [showPanicModal, setShowPanicModal] = useState(false);
  // --- 1. Initial Data Fetching from Backend ---
  useEffect(() => {
    // --- FIX: Add a guard clause to prevent API calls with an invalid ID ---
    // This ensures we don't proceed until the touristId from the URL is available.
    if (!touristId) {
        setLoading(false);
        setError("No Tourist ID found in the URL. Please check the address.");
        return;
    }

    const fetchInitialData = async () => {
      try {
        const [touristRes, zonesRes] = await Promise.all([
          axios.get(`/api/tourists/${touristId}`),
          axios.get('/api/risk-zones'),
        ]);

        const touristData = touristRes.data;
        setTourist(touristData);
        setRiskZones(zonesRes.data);

        // --- UPDATED LOGIC ---
        // Once we have the tourist's location, fetch the *initial* nearest station.
        if (touristData.location?.coordinates) {
          const [lng, lat] = touristData.location.coordinates;
          setCurrentLocation({ lat, lng });

          const stationsRes = await axios.get(`/api/police-stations/nearby?lat=${lat}&lng=${lng}`);
          setPoliceStations(stationsRes.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch initial data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [touristId]);

  // --- 2. Get Live Location & Fetch NEW Nearest Station ---
  useEffect(() => {
    if (!tourist) return; // Wait for initial data

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setCurrentLocation(newLocation);

        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 15);
        }

        try {
          // --- UPDATED LOGIC ---
          // On every location update, fetch the new nearest station and update the location log in parallel.
          const [stationsRes, updateRes] = await Promise.all([
            axios.get(`/api/police-stations/nearby?lat=${newLocation.lat}&lng=${newLocation.lng}`),
            axios.post('/api/locations/update', {
              touristId: tourist.touristId,
              lat: newLocation.lat,
              lng: newLocation.lng,
            })
          ]);

          setPoliceStations(stationsRes.data); // Update the state with the new nearest station
          setApiResponse(updateRes.data);

          if (updateRes.data?.policeAlert) {
             setTourist(prev => ({...prev, safetyScore: Math.max(0, prev.safetyScore - 5)}));
          }

        } catch (err) {
          console.error('Error during location update:', err);
        }
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        setError('Could not get live location. Please enable location services.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [tourist]);


  const handleNewTrip = async () => {
    setNotification('Planning new trip, please wait...');

    const waypoints = [
        { name: 'Chennai', coords: [80.2707, 13.0827] }, // lng, lat
        { name: 'Madurai', coords: [78.1198, 9.9252] },
        { name: 'Tiruchirappalli', coords: [78.7047, 10.7905] }
    ];

     const coordinates = [
        [currentLocation.lng, currentLocation.lat], // Start from current location
        ...waypoints.map(wp => wp.coords)
    ];
    // Note: This is a public demo key. Replace with your own key in a real application.
    const orsApiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjBlNTc0ODNlMzIxNjQ1ODk5MDAxMmNlODFkNTBiMjhjIiwiaCI6Im11cm11cjY0In0='; // Replace with your key
    const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;

    try {
        const response = await axios.post(orsUrl, 
            { coordinates: coordinates },
            { 
                headers: { 
                    'Authorization': orsApiKey,
                    'Content-Type': 'application/json'
                } 
            }
        );
        const data = response.data;
      
      if (data && data.features && data.features.length > 0) {
            // Convert route coordinates to [lat, lng] for Leaflet
            const routeCoords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setPlannedRoute(routeCoords);

            // Set the waypoints for displaying markers on the map
            const waypointsForMap = waypoints.map(wp => ({ name: wp.name, position: [wp.coords[1], wp.coords[0]] }));
            setRouteWaypoints(waypointsForMap);

            setNotification('New multi-stop trip planned! See the route and waypoints on the map.');
        } else {
            setNotification('Error: Could not fetch route from the planning service.');
        }
    } catch (error) {
      console.error("Route planning error:", error);
      setNotification('Error: Could not fetch route. Check API key or network.');
    }
  };

  const handlePanic = async () => {
    if (!currentLocation) {
        alert("Cannot send panic alert: current location is not available.");
        return;
    }
    setShowPanicModal(true);
    setPanicStatus("Sending SOS to nearest police station...");

    try {
        await axios.post('/api/panic', {
            touristId: touristId,
            lat: currentLocation.lat,
            lng: currentLocation.lng,
        });
        setPanicStatus("Success! Your alert has been sent. Help is on the way.");
    } catch (err) {
        console.error("Panic alert failed:", err);
        setPanicStatus("Error! Could not send alert. Please contact emergency services directly.");
    }
  };

  if (loading) return <p className="text-center p-10 font-semibold">Loading Live Dashboard...</p>;
  if (error) return <p className="text-center p-10 text-red-600 bg-red-50 rounded-lg">Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* Map Section */}
      <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-lg mb-3">Live Location Tracker</h3>
        {currentLocation ? (
          <MapContainer
            ref={mapRef}
            center={[currentLocation.lat, currentLocation.lng]}
            zoom={14}
            style={{ height: '550px', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
            <Marker position={[currentLocation.lat, currentLocation.lng]}>
              <Popup>Current Location of {tourist?.name}</Popup>
            </Marker>

           {plannedRoute && <Polyline pathOptions={{ color: 'blue', weight: 5 }} positions={plannedRoute} />}
            {routeWaypoints.map((wp, index) => (
                <Marker key={index} position={wp.position} icon={waypointIcon}>
                    <Popup><b>Waypoint:</b> {wp.name}</Popup>
                </Marker>
            ))}
            {Array.isArray(riskZones) && riskZones.map((zone) => (
              <Circle key={`zone-${zone.id}`} center={[zone.location.coordinates[1], zone.location.coordinates[0]]} radius={zone.radius} pathOptions={{ color: 'orange', fillColor: 'red', fillOpacity: 0.2 }}>
                <Popup><b>Risk Zone:</b> {zone.name}</Popup>
              </Circle>
            ))}

            {Array.isArray(policeStations) && policeStations.map((station) => (
               <Marker key={`station-${station.id}`} position={[station.location.coordinates[1], station.location.coordinates[0]]} icon={policeIcon}>
                 <Popup><b>Police Station:</b> {station.name}</Popup>
               </Marker>
            ))}
          </MapContainer>
        ) : (
          <div style={{ height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-gray-100 rounded-lg">
             <p>Waiting for GPS signal...</p>
          </div>
        )}
        {apiResponse?.touristAlert && (
          <div className="mt-4 p-3 border rounded-lg bg-red-100 text-red-800 font-semibold animate-pulse">
            ⚠️ <b>Alert:</b> Entered risky area: {apiResponse.touristAlert.zoneName} ({apiResponse.touristAlert.distanceMeters}m away)
          </div>
        )}
        {notification && (
            <div className="mt-4 p-3 border rounded-lg bg-blue-100 text-blue-800 font-semibold">
                {notification}
            </div>
        )}
      </div>

      {/* Sidebar Section */}
      <aside className="bg-white p-4 rounded-lg shadow-md">
        {tourist && <SafetyCard name={tourist.name} score={tourist.safetyScore} />}
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <button onClick={handlePanic} className="block w-full text-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold shadow-lg animate-pulse">
                  PANIC BUTTON
                </button>
            <Link to="/tourist/tracking" className="block w-full text-center px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors">Share Live Location</Link>
            <Link to={`/tourist/id/${touristId}`} className="block w-full text-center px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors">View Digital ID</Link>
            <button onClick={handleNewTrip} className="block w-full text-center px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors">Plan Trip</button>
          </div>
        </div>
      </aside>
        
      {showPanicModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center" style={{ zIndex: 1000 }}>
                <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-sm mx-4">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Panic Alert Sent</h2>
                    <p className="text-gray-700 mb-6">{panicStatus}</p>
                    <button 
                        onClick={() => setShowPanicModal(false)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}

