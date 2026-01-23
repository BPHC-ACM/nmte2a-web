import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

export default function CampusMap({
  center = [17.543717, 78.572944],
  locations = [
    {
      name: "CP",
      position: [17.542499, 78.574744],
    },
    {
      name: "Mess 1",
      position: [17.542596, 78.574085],
    },
    {
      name: "Mess 2",
      position: [17.544591, 78.575104],
    },
    {
      name: "Main Gate",
      position: [17.547291, 78.572465],
    },
    {
      name: "Academic Block",
      position: [17.544775, 78.571998],
    },
  ],
} = {}) {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen relative">
      <div className="w-full h-full">
        <MapContainer
          center={center}
          zoom={16}
          scrollWheelZoom
          className="w-full h-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((loc) => (
            <Marker key={loc.name} position={loc.position}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <button
        onClick={() => navigate("/dashboard")}
        className="fixed top-4 right-4 pointer-events-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full transition shadow-lg"
        style={{ zIndex: 10000 }}
      >
        <ArrowLeft size={20} />
        Back
      </button>
    </div>
  );
}
