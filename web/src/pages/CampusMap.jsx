import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.flyTo(center, zoom, {
    duration: 1,
    easeLinearity: 0.25,
  });
  return null;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

export default function CampusMap({ center = [17.543717, 78.572944] } = {}) {
  const [mapCenter, setMapCenter] = useState(center);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigate = useNavigate();

  const categories = [
    {
      id: "messes area 1",
      name: "mess 1 area",
      options: [
        {
          label: "Mess 1",
          pos: [17.542596, 78.574085],
          menuImage: "/mess_menu.jpg",
        },
        {
          label: "Bits & Bytes",
          pos: [17.543184, 78.574353],
        },
        {
          label: "Yumpies",
          pos: [17.542754, 78.574036],
        },
      ],
    },
    {
      id: "messes area 2",
      name: "mess 2 area",
      options: [
        {
          label: "Mess 2",
          pos: [17.54456, 78.575093],
          menuImage: "/mess_menu.jpg",
        },
      ],
    },
    {
      id: "academic",
      name: "Academic Blocks",
      options: [
        { label: "Main Building", pos: [17.544775, 78.571998] },
        { label: "Library", pos: [17.545603, 78.571526] },
        { label: "Auditorium", pos: [17.545271, 78.570936] },
      ],
    },
    {
      id: "cp&sac",
      name: "CP & SAC",
      options: [
        { label: "CP", pos: [17.542064, 78.575879] },
        { label: "SAC", pos: [17.540821, 78.575265] },
      ],
    },
  ];

  const handleRecenter = () => {
    setMapCenter(center);
    setSelectedLocation(null);
  };

  const handleBack = () => {
    const user = localStorage.getItem("speaker");
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

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

          <ChangeView center={mapCenter} zoom={18} />

          {categories.map((cat) =>
            cat.options.map((opt) => {
              // Check if this option's position is the one currently focused
              const isFocused =
                opt.pos[0] === mapCenter[0] && opt.pos[1] === mapCenter[1];

              if (isFocused) {
                return (
                  <Marker key={opt.label} position={opt.pos}>
                    <Popup>{opt.label}</Popup>
                  </Marker>
                );
              }
              return null;
            }),
          )}
        </MapContainer>

        <button
          onClick={handleRecenter}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full shadow-xl"
          style={{ zIndex: 10000 }}
        >
          Focus Campus
        </button>
      </div>

      <button
        onClick={handleBack}
        className="fixed top-8 right-4 pointer-events-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full transition shadow-lg"
        style={{ zIndex: 10000 }}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div
        className="fixed top-20 left-4 w-64 flex flex-col gap-2"
        style={{ zIndex: 10000 }}
      >
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-1">
            {/* Parent Button */}
            <button
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-4 rounded-lg shadow-md border-l-4 border-blue-600 flex justify-between items-center"
            >
              {cat.name}
              <span>{activeCategory === cat.id ? "−" : "+"}</span>
            </button>

            {/* Collapsible Sub-Buttons */}
            {activeCategory === cat.id && (
              <div className="flex flex-col gap-1 pl-4 transition-all">
                {cat.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setMapCenter(opt.pos);
                      setSelectedLocation(opt); // This tells the panel to show the image
                    }}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-md text-sm font-medium border border-blue-200 text-left"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* This panel ONLY appears if there is a selected location AND it has an image */}
      {selectedLocation?.menuImage && (
        <div className="fixed bottom-20 right-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[10000]">
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-800">
              {selectedLocation.label}
            </h3>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-red-500 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-2">
            <img
              src={selectedLocation.menuImage}
              alt="Menu"
              className="w-full h-auto rounded-lg shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
