import Landing from "./pages/LandingPage"
import TopNav from "./components/TopNav"
import TouristDashboard from "./pages/tourist/touristDashboard"
import TouristID from "./pages/tourist/TouristID"
import TrackingPage from "./pages/tourist/touristTrackingPage"
import { Route, Routes } from "react-router-dom"
import PoliceDashboard from "./pages/police/PoliceDashboard"
import PoliceAlert from "./pages/policeAlert"
import TouristAlert from "./pages/touristAlert"
import TouristRegistration from "./pages/tourist/touristRegistration"

function App() {  

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tourist/dashboard/:touristId" element={<TouristDashboard />} />
          <Route path="/tourist/id/:touristId" element={<TouristID />} />
          <Route path="/tourist/tracking" element={<TrackingPage />} />
          <Route path="/police/dashboard/:stationId" element={<PoliceDashboard />} />
          <Route path="/police/alert" element={<PoliceAlert />} />
          <Route path="/tourist/alert" element={<TouristAlert />} />
          <Route path="/tourist/register" element={<TouristRegistration />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
