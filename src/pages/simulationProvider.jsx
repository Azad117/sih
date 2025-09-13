import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// --- Static Data Definitions ---
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

const policeStation = {
    name: 'Redhills Police Station',
    position: { lat: 13.1735, lng: 80.1712 }
};

// --- React Context Setup ---
const SimulationContext = createContext();

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider = ({ children }) => {
    const [tourist, setTourist] = useState({ name: 'Rohan Desai', position: touristPath[0] });
    const [touristAlerts, setTouristAlerts] = useState([]);
    const [policeAlerts, setPoliceAlerts] = useState([]);
    const [pathIndex, setPathIndex] = useState(0);
    const [simulationStatus, setSimulationStatus] = useState("Simulation Paused. Navigate to a view to begin.");
    
    const triggeredWarning = useRef(false);
    const triggeredCritical = useRef(false);
    const simulationInterval = useRef(null);

    // --- Core Simulation Logic ---
    useEffect(() => {
        const startSimulation = () => {
            if (simulationInterval.current) return;
            simulationInterval.current = setInterval(() => {
                setPathIndex(prevIndex => (prevIndex + 1) % touristPath.length);
            }, 2500);
        };
        startSimulation();
        return () => clearInterval(simulationInterval.current);
    }, []);

    useEffect(() => {
        const newPosition = touristPath[pathIndex];
        setTourist(prev => ({ ...prev, position: newPosition }));
        setSimulationStatus(`Simulation in Progress... Step ${pathIndex + 1}/${touristPath.length}`);
        
        // Check alerts on position change
        const distance = getDistance(newPosition, riskZone.center);

        if (distance <= riskZone.criticalRadius && !triggeredCritical.current) {
            triggeredCritical.current = true;
            const alert = { id: Date.now(), type: 'critical', title: 'CRITICAL: High-Risk Zone', message: `You have entered a high-risk area: ${riskZone.name}.`, position: newPosition };
            setTouristAlerts(prev => [alert, ...prev]);
            setPoliceAlerts(prev => [alert, ...prev]);
        } else if (distance <= riskZone.warningRadius && !triggeredWarning.current) {
            triggeredWarning.current = true;
            const alert = { id: Date.now(), type: 'warning', title: 'Warning: Approaching Risky Area', message: `You are near ${riskZone.name}. Exercise caution.` };
            setTouristAlerts(prev => [alert, ...prev]);
        }
    }, [pathIndex]);

    const getDistance = (pos1, pos2) => {
        const R = 6371e3; // meters
        const φ1 = pos1.lat * Math.PI / 180; const φ2 = pos2.lat * Math.PI / 180;
        const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180; const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    
    const value = { tourist, riskZone, policeStation, touristAlerts, policeAlerts, simulationStatus };

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
};
