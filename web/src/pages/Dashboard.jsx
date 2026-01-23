import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LogOut, Map, Navigation, Clock, MapPin, Calendar, CheckCircle2, PlusCircle, User, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [speaker, setSpeaker] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState([]); 

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get Speaker from Local Storage
        const storedSpeaker = localStorage.getItem('speaker');
        if (!storedSpeaker) {
          navigate('/login');
          return;
        }
        const parsedSpeaker = JSON.parse(storedSpeaker);
        setSpeaker(parsedSpeaker);

        // Load Saved Schedule Preferences
        const savedSchedule = localStorage.getItem(`schedule_${parsedSpeaker.speaker_id}`);
        if (savedSchedule) {
          setAttending(JSON.parse(savedSchedule));
        }

        // Fetch Schedule from Supabase
        const { data, error } = await supabase
          .from('schedule')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        setSchedule(data);

      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Toggle session & Save
  const toggleSession = (id) => {
    let newAttending;
    if (attending.includes(id)) {
      newAttending = attending.filter(sid => sid !== id);
    } else {
      newAttending = [...attending, id];
    }
    
    setAttending(newAttending);
    
    if (speaker?.speaker_id) {
      localStorage.setItem(`schedule_${speaker.speaker_id}`, JSON.stringify(newAttending));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('speaker');
    localStorage.removeItem('speakerAuth');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Helper to check if user has a session
  const hasSession = speaker?.session_title && speaker.session_title.trim() !== "";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-100 p-4 md:p-8">
      
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40">
          
          {/* User Info Block */}
          <div className="flex items-center gap-4 w-full md:w-auto pr-24 md:pr-0"> 
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                <span className="block md:inline text-gray-500 md:text-gray-800 font-medium md:font-bold">Welcome,</span>
                <span className="block md:inline md:ml-2 text-indigo-600">{speaker?.name}</span>
              </h1>
              <p className="text-sm text-gray-400 mt-1 md:mt-0">ID: {speaker?.speaker_id}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="absolute top-6 right-6 md:static flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> 
            <span>Logout</span>
          </button>
        </div>

        {/* YOUR ASSIGNED SESSION (Conditional Rendering) */}
        {hasSession && (
          <div className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-200 mb-2 text-sm font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Your Session Details
              </div>
              
              <h2 className="text-3xl font-bold mb-6">
                {speaker?.session_title}
              </h2>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                  <Clock className="w-5 h-5 text-indigo-200" />
                  <div>
                    <p className="text-xs text-indigo-200">Time</p>
                    <p className="font-semibold">{speaker?.session_time || "TBA"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                  <MapPin className="w-5 h-5 text-indigo-200" />
                  <div>
                    <p className="text-xs text-indigo-200">Venue</p>
                    <p className="font-semibold">{speaker?.session_venue || "TBA"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COLUMNS: Schedule & Maps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* SESSION SELECTOR */}
          <div className="md:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Conference Schedule
            </h3>
            <p className="text-sm text-gray-500 mb-6">Select sessions you wish to attend.</p>

            <div className="space-y-3">
              {schedule.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No schedule available yet.</p>
              ) : (
                schedule.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => toggleSession(session.id)}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      attending.includes(session.id) 
                        ? 'border-indigo-500 bg-indigo-50/50' 
                        : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                          {session.time}
                        </span>
                        <span className="text-xs text-gray-400">{session.type}</span>
                      </div>
                      <h4 className={`font-semibold ${attending.includes(session.id) ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {session.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {session.venue}
                      </p>
                    </div>

                    <div className="pl-4">
                      {attending.includes(session.id) ? (
                        <CheckCircle2 className="w-6 h-6 text-indigo-600 fill-indigo-100" />
                      ) : (
                        <PlusCircle className="w-6 h-6 text-gray-300 group-hover:text-indigo-400" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MAPS */}
          <div className="space-y-4">
             <div 
               onClick={() => navigate('/acads-map')}
               className="bg-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition cursor-pointer flex flex-col items-start justify-between h-40 relative overflow-hidden group"
             >
               <Map className="w-8 h-8 mb-2 z-10" />
               <div className="z-10">
                 <h4 className="font-bold text-lg">Academic Map</h4>
                 <p className="text-green-100 text-xs">Find classrooms & auditorium</p>
               </div>
               <Map className="absolute -bottom-4 -right-4 w-24 h-24 text-green-500 opacity-50 group-hover:scale-110 transition-transform" />
             </div>

             <div 
               onClick={() => navigate('/campus-map')}
               className="bg-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition cursor-pointer flex flex-col items-start justify-between h-40 relative overflow-hidden group"
             >
               <Navigation className="w-8 h-8 mb-2 z-10" />
               <div className="z-10">
                 <h4 className="font-bold text-lg">Campus Map</h4>
                 <p className="text-purple-100 text-xs">Hostels, Food & CP</p>
               </div>
               <Navigation className="absolute -bottom-4 -right-4 w-24 h-24 text-purple-500 opacity-50 group-hover:scale-110 transition-transform" />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;