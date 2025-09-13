import React from 'react';
import { Link } from 'react-router-dom';

// --- Icon Components (Inlined SVGs for self-containment) ---
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 1.944c-3.12 0-5.644 2.524-5.644 5.644 0 3.12 2.524 5.644 5.644 5.644s5.644-2.524 5.644-5.644C15.644 4.468 13.12 1.944 10 1.944zM8.75 16.25a.75.75 0 001.5 0v-5.5a.75.75 0 00-1.5 0v5.5zM10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
  </svg>
);
const GpsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);
const BlockchainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-.553-.894l-4-2A1 1 0 0011 7v10zM4 15a1 1 0 00.553.894l4 2A1 1 0 0010 17V7a1 1 0 00-1.447-.894l-4 2A1 1 0 004 9.236V15zM14.447 3.106a1 1 0 00-1.447 0l-4 2A1 1 0 008 6v1.236a1 1 0 00.553.894l4 2A1 1 0 0013 9V3a1 1 0 00-1.447-.894z" />
    </svg>
);


export default function Landing() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* --- Hero Section --- */}
        <header className="text-center bg-white rounded-lg shadow-lg p-10 mb-12 border border-gray-200">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Smart Tourist Safety & Incident Response
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
            A unified platform leveraging Real-Time Geofencing, AI, and Blockchain to ensure tourist safety and provide law enforcement with actionable intelligence.
          </p>
        </header>

        {/* --- Key Features Section --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <FeatureCard
                icon={<GpsIcon />}
                title="Real-Time Geofencing"
                description="Automatically monitor tourist locations, triggering instant alerts when they enter designated high-risk zones, ensuring proactive safety measures."
            />
            <FeatureCard
                icon={<ShieldIcon />}
                title="AI-Powered Safety Score"
                description="Dynamically calculates a safety score for each tourist based on their location, proximity to risks, and recent alerts, providing a clear at-a-glance status."
            />
            <FeatureCard
                icon={<BlockchainIcon />}
                title="Blockchain Digital ID"
                description="Issues secure, time-bound digital identities for tourists, ensuring verifiable credentials and a tamper-proof record of their visit duration."
            />
        </section>


        {/* --- Portals / Call to Action Section --- */}
        <section className="bg-white rounded-lg shadow p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Access the Portals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <PortalLink
                    to="/dashboard/T-MORAI-250912-001" // Example Tourist ID
                    title="Tourist Dashboard"
                    description="Live map, safety score, and panic button."
                />
                <PortalLink
                    to="/police/1" // Example Police Station ID
                    title="Police Command Center"
                    description="Jurisdiction map, live alerts, and tourist tracking."
                />
                <PortalLink
                    to="/admin/id-issue"
                    title="Admin & ID Issuance"
                    description="Issue new digital IDs and manage records."
                />
            </div>
        </section>
        
        {/* --- Prototype Notes --- */}
        <footer className="mt-12 text-center text-gray-500">
            <p className="text-sm">
                <strong>Project Status:</strong> This is a fully functional end-to-end prototype. It demonstrates the complete UX flow and core features with a live backend connection.
            </p>
        </footer>

      </div>
    </div>
  );
}


// --- Reusable Sub-components for a cleaner structure ---

function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-6 rounded-lg shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-indigo-100 text-sm">{description}</p>
        </div>
    );
}

function PortalLink({ to, title, description }) {
    return (
        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-xl hover:border-indigo-500 transition-shadow duration-300">
            <h3 className="font-semibold text-xl text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">{description}</p>
            <Link to={to} className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors duration-300">
                Open Portal &rarr;
            </Link>
        </div>
    );
}
