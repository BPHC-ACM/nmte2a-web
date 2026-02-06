import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, Loader2, CheckCircle2, PlusCircle, Briefcase, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Schedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedSessions, setSavedSessions] = useState([]);

  useEffect(() => {
    fetchSchedule();
    // Load saved sessions from local storage
    const saved = localStorage.getItem('guest_schedule');
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved schedule", e);
      }
    }
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (id) => {
    const newSaved = savedSessions.includes(id)
      ? savedSessions.filter(sid => sid !== id)
      : [...savedSessions, id];
    
    setSavedSessions(newSaved);
    localStorage.setItem('guest_schedule', JSON.stringify(newSaved));
    
    if (savedSessions.includes(id)) {
      toast.success('Session removed from saved list');
    } else {
      toast.success('Session saved locally');
    }
  };

  const groupedSchedule = schedule.reduce((acc, session) => {
    const day = session.day || "Other Events"; 
    if (!acc[day]) acc[day] = [];
    acc[day].push(session);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <Calendar className="w-6 h-6 text-indigo-600" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-800">Event Schedule</h1>
                <p className="text-sm text-gray-500">Conference Timeline</p>
             </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
             <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : schedule.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sessions scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedule).map(([day, sessions]) => (
                <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50/50 p-4 border-b border-gray-100 sticky top-0 backdrop-blur-sm z-10 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        {day}
                    </h2>
                    <span className="text-xs font-medium text-gray-500">{sessions.length} Sessions</span>
                  </div>
                  <div className="space-y-3 p-4">
                    {sessions.map((session) => {
                      const isSaved = savedSessions.includes(session.id);
                      return (
                        <div key={session.id} onClick={() => toggleSession(session.id)} className={`flex justify-between p-4 rounded-xl border cursor-pointer transition ${isSaved ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <div className="flex-1">
                          <div className="flex gap-2 mb-1"><span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 rounded-full">{session.time}</span><span className="text-xs text-gray-400">{session.type}</span></div>
                          <h4 className={`font-semibold ${isSaved ? 'text-indigo-900' : 'text-gray-700'}`}>{session.title}</h4>
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
                        <div className="pl-4">{isSaved ? <CheckCircle2 className="w-6 h-6 text-indigo-600"/> : <PlusCircle className="w-6 h-6 text-gray-300"/>}</div>
                      </div>
                      );
                    })}
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
