import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Using CDN import

// --- Helper function to format dates ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function TouristID() {
  const { touristId } = useParams();
  const [tourist, setTourist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!touristId) {
        setLoading(false);
        setError("No touristId provided in the URL.");
        return;
    }

    const fetchTouristData = async () => {
      try {
        // --- CRITICAL FIX: Added a leading slash '/' to make the path absolute ---
        // This ensures the request is always sent to the root, e.g., http://localhost:5173/api/...
        // which the Vite proxy can correctly handle.
        const response = await axios.get(`/api/tourists/${touristId}`);
        
        // axios automatically parses the JSON, so we just access response.data
        setTourist(response.data);

      } catch (err) {
        // --- IMPROVEMENT: More detailed error handling ---
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Error ${err.response.status}: ${err.response.data.message || 'Could not fetch tourist data.'}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError('Network error. Could not connect to the server.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTouristData();
  }, [touristId]);

  // --- Render loading state ---
  if (loading) {
    return (
      <div className="text-center p-10">
        <p className="text-lg text-gray-500">Loading Digital ID...</p>
      </div>
    );
  }

  // --- Render error state ---
  if (error) {
    return (
      <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-200 text-center">
        <h3 className="text-xl font-semibold text-red-800">Error</h3>
        <p className="mt-2 text-red-600">{error}</p>
      </div>
    );
  }

  // --- Render successful data state ---
  if (!tourist) return null;

  const now = new Date();
  const validToDate = tourist.validTo ? new Date(tourist.validTo) : null;
  const isActive = validToDate && now < validToDate;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-start pb-4 border-b">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Digital Tourist ID</h3>
          <p className="text-sm text-gray-500">Government of Tamil Nadu</p>
        </div>
        <div
          className={`px-3 py-1 text-sm font-semibold rounded-full ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isActive ? 'Active' : 'Expired'}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Photo Section */}
        <div className="flex justify-center">
           <div className="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
             </svg>
           </div>
        </div>

        {/* Details Section */}
        <div className="md:col-span-2 text-center md:text-left">
          <p className="text-3xl font-bold text-slate-800">{tourist.name}</p>
          <p className="mt-1">
            <span className="text-sm text-slate-600">ID: </span>
            <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
              {tourist.touristId}
            </span>
          </p>
          <div className="mt-4 flex flex-col md:flex-row gap-x-6 gap-y-2 text-sm justify-center md:justify-start">
             <div>
                <p className="text-slate-500">Valid From</p>
                <p className="font-semibold text-slate-700">{formatDate(tourist.validFrom)}</p>
             </div>
             <div>
                <p className="text-slate-500">Valid To</p>
                <p className="font-semibold text-slate-700">{formatDate(tourist.validTo)}</p>
             </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t">
         <h4 className="font-semibold text-slate-800">Emergency Contact</h4>
         <p className="text-lg text-blue-600 font-medium">{tourist.emergencyContact || 'Not Provided'}</p>
      </div>

      <div className="mt-6 text-sm text-slate-700 p-4 bg-gray-50 rounded-lg">
        <strong>Note:</strong> In the real system this ID would be minted on a blockchain and be time-bound to the visit duration.
      </div>
    </div>
  );
}

