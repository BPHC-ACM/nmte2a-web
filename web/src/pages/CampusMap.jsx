import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crosshair, MapPin, ExternalLink } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for marker icons using CDN
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

const categories = [
  {
    id: "messes-1",
    name: "Mess 1 Area",
    options: [
      {
        label: "Mess 1",
        pos: [17.542596, 78.574085],
        menuImage: "/mess_menu.jpg",
      },
      { label: "Bits & Bytes", pos: [17.543184, 78.574353] },
      { label: "Yumpies", pos: [17.542754, 78.574036] },
    ],
  },
  {
    id: "messes-2",
    name: "Mess 2 Area",
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
];

export default function CampusMap({
  initialCenter = [17.543717, 78.572944],
  initialZoom = 16,
  locations = categories,
}) {
  const [view, setView] = useState({
    center: initialCenter,
    zoom: initialZoom,
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showFullscreenMenu, setShowFullscreenMenu] = useState(false); // New state for modal

  const navigate = useNavigate();

  const handleLocationSelect = (loc) => {
    setView({ center: loc.pos, zoom: 18 });
    setSelectedLocation(loc);
  };

  const showUI = locations.length > 0;

  return (
    <div className="w-full h-screen relative bg-slate-100 overflow-hidden font-sans">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full z-0"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController center={view.center} zoom={view.zoom} />

        {showUI &&
          locations.map((cat) =>
            cat.options.map((opt) => {
              const isFocused =
                opt.pos[0].toFixed(6) === view.center[0].toFixed(6) &&
                opt.pos[1].toFixed(6) === view.center[1].toFixed(6);

              return isFocused ? (
                <Marker key={opt.label} position={opt.pos}>
                  <Popup>
                    <div className="flex flex-col items-center gap-2 min-w-[120px] p-1">
                      <span className="font-bold text-slate-800 text-sm">
                        {opt.label}
                      </span>
                      {opt.menuImage ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents the map from intercepting the click
                            setSelectedLocation(opt);
                            setShowFullscreenMenu(true);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2 px-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
                        >
                          <ExternalLink size={12} />
                          VIEW MENU
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          No menu available
                        </span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ) : null;
            }),
          )}
      </MapContainer>

      {/* Fullscreen Menu Modal */}
      {showFullscreenMenu && selectedLocation?.menuImage && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
          {/* Backdrop: Clicking this closes the menu */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowFullscreenMenu(false)}
          />

          {/* Menu Image Container */}
          <div className="relative z-10 max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-black text-gray-900">
                {selectedLocation.label} Menu
              </h2>
              <button
                onClick={() => setShowFullscreenMenu(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <img
                src={selectedLocation.menuImage}
                alt="Fullscreen Menu"
                className="w-full h-auto rounded-xl"
              />
            </div>
            <div className="p-4 bg-gray-50 text-center text-sm text-gray-500 font-medium italic">
              Click anywhere outside to return to map
            </div>
          </div>
        </div>
      )}

      {/* Sidebar UI (Restored top-20 for your request) */}
      <div className="absolute top-20 left-6 w-72 z-[1000] space-y-3 pointer-events-none">
        {locations.map((cat) => (
          <div
            key={cat.id}
            className="pointer-events-auto shadow-lg rounded-xl overflow-hidden bg-white/90 backdrop-blur border border-slate-200"
          >
            <button
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className={`w-full flex items-center justify-between p-4 transition-all ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-50 text-slate-700 font-semibold"
              }`}
            >
              {cat.name} <span>{activeCategory === cat.id ? "−" : "+"}</span>
            </button>

            {activeCategory === cat.id && (
              <div className="p-2 bg-white/50 space-y-1">
                {cat.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleLocationSelect(opt)}
                    className="w-full flex items-center gap-2 p-2.5 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg text-sm transition-all text-left"
                  >
                    <MapPin size={14} className="opacity-50" /> {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setView({ center: initialCenter, zoom: initialZoom });
          setSelectedLocation(null);
        }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl shadow-2xl hover:bg-black transition-all"
      >
        <Crosshair size={18} />{" "}
        <span className="font-bold uppercase tracking-wider text-xs">
          Reset View
        </span>
      </button>
      {/* Back Button */}
      <button
        onClick={() => {
          const user = localStorage.getItem("speaker");
          navigate(user ? "/dashboard" : "/");
        }}
        className="fixed top-8 right-4 pointer-events-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full transition shadow-lg"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>
    </div>
  );
}
