import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LogOut, Map, Navigation, MapPin, Calendar, CheckCircle2, PlusCircle, User, Loader2, FileText, Briefcase, Users } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [speaker, setSpeaker] = useState(null);
  const [mySessions, setMySessions] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedSpeaker = localStorage.getItem('speaker');
        if (!storedSpeaker) {
          navigate('/login');
          return;
        }
        const parsedSpeaker = JSON.parse(storedSpeaker);
        setSpeaker(parsedSpeaker);

        const savedSchedule = localStorage.getItem(`schedule_${parsedSpeaker.speaker_id}`);
        if (savedSchedule) setAttending(JSON.parse(savedSchedule));

        const { data: scheduleData } = await supabase
          .from('schedule')
          .select('*')
          .order('id', { ascending: true });
        setSchedule(scheduleData || []);

        const { data: myData } = await supabase
          .from('personal_sessions')
          .select('*')
          .eq('speaker_id', parsedSpeaker.speaker_id);
        setMySessions(myData || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const toggleSession = (id) => {
    const newAttending = attending.includes(id) 
      ? attending.filter(sid => sid !== id) 
      : [...attending, id];
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

  const groupedSchedule = schedule.reduce((acc, session) => {
    const day = session.day || "Other Events"; 
    if (!acc[day]) acc[day] = [];
    acc[day].push(session);
    return acc;
  }, {});

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600"/></div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40">
          <div className="flex items-center gap-4"> 
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><User /></div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Welcome, <span className="text-indigo-600">{speaker?.name}</span></h1>
              <p className="text-sm text-gray-400">ID: {speaker?.speaker_id}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* PERSONAL SESSIONS */}
        {mySessions.length > 0 && (
          <div className={`grid grid-cols-1 ${mySessions.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
            {mySessions.map((session, i) => (
              <div key={i} className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-indigo-200 mb-2 text-xs font-bold uppercase"><Calendar className="w-3 h-3"/> My Session</div>
                  <h2 className="text-xl font-bold mb-4">{session.title}</h2>
                  <div className="flex gap-4">
                    <div className="bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <p className="text-[10px] text-indigo-200 uppercase">Time</p>
                      <p className="font-semibold text-sm">{session.time}</p>
                    </div>
                    <div className="bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <p className="text-[10px] text-indigo-200 uppercase">Venue</p>
                      <p className="font-semibold text-sm">{session.venue}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* SIDEBAR */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-8 space-y-4">
            
            {/* BROCHURE CARD */}
            <a href="/brochure.pdf" target="_blank" rel="noopener noreferrer" className="block bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:-translate-y-1 transition cursor-pointer relative overflow-hidden group h-32">
              <FileText className="w-8 h-8 mb-2 z-10 relative"/>
              <div className="relative z-10"><h4 className="font-bold">Conference Brochure</h4><p className="text-xs text-blue-100">View Full PDF</p></div>
              <FileText className="absolute -bottom-4 -right-4 w-20 h-20 text-blue-500 opacity-50 group-hover:scale-110 transition"/>
            </a>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div onClick={() => navigate('/acads-map')} className="bg-green-600 text-white p-4 rounded-2xl shadow-lg hover:-translate-y-1 transition cursor-pointer relative overflow-hidden group h-32">
                <Map className="w-8 h-8 mb-2 z-10 relative"/>
                <div className="relative z-10"><h4 className="font-bold">Academic Map</h4><p className="text-xs text-green-100">Classrooms</p></div>
                <Map className="absolute -bottom-4 -right-4 w-20 h-20 text-green-500 opacity-50 group-hover:scale-110 transition"/>
              </div>
              <div onClick={() => navigate('/campus-map')} className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg hover:-translate-y-1 transition cursor-pointer relative overflow-hidden group h-32">
                <Navigation className="w-8 h-8 mb-2 z-10 relative"/>
                <div className="relative z-10"><h4 className="font-bold">Campus Map</h4><p className="text-xs text-purple-100">Hostels & Food</p></div>
                <Navigation className="absolute -bottom-4 -right-4 w-20 h-20 text-purple-500 opacity-50 group-hover:scale-110 transition"/>
              </div>
            </div>
          </div>

          {/* SCHEDULE */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
            {schedule.length === 0 ? <div className="bg-white/80 p-8 rounded-2xl text-center text-gray-400">No events found.</div> : 
              Object.entries(groupedSchedule).map(([day, sessions]) => (
                <div key={day} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-6">
                  <h4 className="text-lg font-bold text-indigo-900 mb-4 pb-2 border-b sticky top-0 bg-white/50 backdrop-blur-sm">{day}</h4>
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} onClick={() => toggleSession(session.id)} className={`flex justify-between p-4 rounded-xl border cursor-pointer transition ${attending.includes(session.id) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <div className="flex-1">
                          <div className="flex gap-2 mb-1"><span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 rounded-full">{session.time}</span><span className="text-xs text-gray-400">{session.type}</span></div>
                          <h4 className={`font-semibold ${attending.includes(session.id) ? 'text-indigo-900' : 'text-gray-700'}`}>{session.title}</h4>
                          <div className="flex flex-col gap-1 mt-1">
                            {session.session_chair && (
                                <p className="text-xs text-indigo-500 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3"/> Chair: {session.session_chair}
                                </p>
                            )}
                            {session.session_coordinator && (
                                <p className="text-xs text-indigo-500 flex items-center gap-1">
                                    <Users className="w-3 h-3"/> Coord: {session.session_coordinator}
                                </p>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-1 flex gap-1"><MapPin className="w-3 h-3"/> {session.venue}</p>
                        </div>
                        <div className="pl-4">{attending.includes(session.id) ? <CheckCircle2 className="w-6 h-6 text-indigo-600"/> : <PlusCircle className="w-6 h-6 text-gray-300"/>}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;