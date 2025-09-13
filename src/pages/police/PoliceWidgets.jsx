import React, { useEffect, useState } from 'react';
import axios from 'axios';


export function AlertTable({ stationId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stationId) return;

    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/alerts/station/${stationId}`);
        setAlerts(res.data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError(err.message || 'Failed to fetch alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Optional: poll every 10 seconds to get new alerts
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [stationId]);

  if (loading) return <p>Loading alerts...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="text-sm">
      <table className="w-full border">
        <thead className="text-left bg-slate-50">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Time</th>
            <th className="p-2">Tourist</th>
            <th className="p-2">Zone</th>
            <th className="p-2">Severity</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length === 0 && (
            <tr>
              <td colSpan={5} className="p-2 text-center">
                No alerts yet.
              </td>
            </tr>
          )}
          {alerts.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-2">{a.id}</td>
              <td className="p-2">{new Date(a.createdAt).toLocaleString()}</td>
              <td className="p-2">{a.tourist?.name || a.tourist?.touristId}</td>
              <td className="p-2">{a.zoneName}</td>
              <td className="p-2">{a.severity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
