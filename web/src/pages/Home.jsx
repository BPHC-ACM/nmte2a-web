import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Map, Navigation, CalendarDays, Heart, FileText } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-100 p-4">
      
      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        
        {/* Header Section */}
        <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
            {/* Decorative circle in background */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <h1 className="relative z-10 text-2xl md:text-3xl font-bold tracking-tight">
              NMTE2A Conference
            </h1>
            <p className="relative z-10 text-indigo-100 mt-2 font-medium flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" />
              User Portal
            </p>
        </div>

        {/* Content Section */}
        <div className="p-8 flex flex-col gap-5">
          
          {/* Primary Action: Login */}
          <div className="relative group">
            <Link
              to="/login"
              className="flex items-center justify-center gap-3 w-full rounded-xl bg-indigo-600 py-4 text-white font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <LogIn className="w-5 h-5" />
              Speaker Login
            </Link>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Navigate</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Secondary Actions: Maps */}
          <div className="space-y-3">
             <a
              href="https://drive.google.com/drive/folders/1lBDxUFDHklpL7Ez2OVkSDn8zpr8Pu0pv?usp=sharing"
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center justify-between w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-700 hover:border-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <span className="flex items-center gap-3 font-medium">
                <FileText className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                Conference Brochure
              </span>
              <span className="text-gray-400 group-hover:text-red-600 transition-colors">→</span>
            </a>

            <Link
              to="/schedule"
              className="group flex items-center justify-between w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <span className="flex items-center gap-3 font-medium">
                <CalendarDays className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                Event Schedule
              </span>
              <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
            </Link>

            <Link
              to="/acads-map"
              className="group flex items-center justify-between w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-700 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
            >
              <span className="flex items-center gap-3 font-medium">
                <Map className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                Academic Block Map
              </span>
              <span className="text-gray-400 group-hover:text-green-600 transition-colors">→</span>
            </Link>

            <Link
              to="/campus-map"
              className="group flex items-center justify-between w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-700 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
            >
              <span className="flex items-center gap-3 font-medium">
                <Navigation className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                Campus Map
              </span>
              <span className="text-gray-400 group-hover:text-purple-600 transition-colors">→</span>
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              © 2026 Conference Team | Made with 
              <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> 
              by <a href="https://acmbphc.in/" target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">ACM</a>
            </p>
        </div>

      </div>
    </div>
  );
};

export default Home;