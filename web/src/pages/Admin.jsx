import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, UserPlus, Lock, Loader2, Edit2, Plus, X, Search, LogOut, Calendar, Users, Clock, MapPin, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Admin = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); 

  // --- AUTH STATE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- USERS STATE ---
  const [speakers, setSpeakers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userForm, setUserForm] = useState({ id: null, speaker_id: '', name: '', phone: '1234567890' });
  const [userSessions, setUserSessions] = useState([]);

  // --- SCHEDULE STATE ---
  const [schedule, setSchedule] = useState([]);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    id: null,
    day: 'Day 1 (Feb 7)',
    time: '',
    type: 'Session',
    title: '',
    venue: '',
    session_chair: '',
    session_coordinator: '' // <--- ADDED COORDINATOR
  });

  // ==========================================
  // 1. AUTH & INITIALIZATION
  // ==========================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAllData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchAllData();
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = () => {
    fetchSpeakers();
    fetchSchedule();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else toast.success("Logged In Successfully");
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged Out");
  };

  // ==========================================
  // 2. USER MANAGEMENT FUNCTIONS
  // ==========================================
  const fetchSpeakers = async () => {
    const { data, error } = await supabase.from('speakers').select('*, personal_sessions(*)').order('id', { ascending: false });
    if (!error) setSpeakers(data || []);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.speaker_id || !userForm.name) return toast.error("ID and Name required");
    setLoading(true);
    
    try {
      const payload = { ...userForm };
      if (!payload.id) delete payload.id;

      const { data: spk, error: spkErr } = await supabase
        .from('speakers')
        .upsert(payload)
        .select()
        .single();
        
      if (spkErr) throw spkErr;

      await supabase.from('personal_sessions').delete().eq('speaker_id', spk.speaker_id);
      if (userSessions.length > 0) {
        const { error: sessErr } = await supabase.from('personal_sessions').insert(
          userSessions.map(s => ({ ...s, speaker_id: spk.speaker_id }))
        );
        if (sessErr) throw sessErr;
      }
      
      toast.success(isEditingUser ? "User Updated" : "User Added");
      resetUserForm();
      fetchSpeakers();
    } catch (err) { 
      toast.error(err.message); 
    }
    setLoading(false);
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await supabase.from('speakers').delete().eq('id', id);
    toast.success("User Deleted");
    fetchSpeakers();
  };

  const editUser = (user) => {
    setIsEditingUser(true);
    setUserForm({ id: user.id, speaker_id: user.speaker_id, name: user.name, phone: user.phone });
    setUserSessions(user.personal_sessions.map(({ title, time, venue }) => ({ title, time, venue })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetUserForm = () => {
    setIsEditingUser(false);
    setUserForm({ id: null, speaker_id: '', name: '', phone: '1234567890' });
    setUserSessions([]);
  };

  const addUserSessionRow = () => setUserSessions([...userSessions, { title: '', time: '', venue: '' }]);
  const removeUserSessionRow = (i) => { const s = [...userSessions]; s.splice(i, 1); setUserSessions(s); };
  const updateUserSessionRow = (i, f, v) => { const s = [...userSessions]; s[i][f] = v; setUserSessions(s); };


  // ==========================================
  // 3. SCHEDULE MANAGEMENT FUNCTIONS
  // ==========================================
  const fetchSchedule = async () => {
    const { data, error } = await supabase.from('schedule').select('*').order('id', { ascending: true });
    if (!error) setSchedule(data || []);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...scheduleForm };
      if (!payload.id) delete payload.id;

      const { error } = await supabase.from('schedule').upsert(payload);
      if (error) throw error;

      toast.success(isEditingSchedule ? "Event Updated" : "Event Added");
      resetScheduleForm();
      fetchSchedule();
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const deleteScheduleItem = async (id) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from('schedule').delete().eq('id', id);
    toast.success("Event Deleted");
    fetchSchedule();
  };

  const editScheduleItem = (item) => {
    setIsEditingSchedule(true);
    setScheduleForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetScheduleForm = () => {
    setIsEditingSchedule(false);
    setScheduleForm({ 
      id: null, 
      day: 'Day 1 (Feb 7)', 
      time: '', 
      type: 'Session', 
      title: '', 
      venue: '', 
      session_chair: '', 
      session_coordinator: ''
    });
  };


  // ==========================================
  // RENDER: LOGIN
  // ==========================================
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Login</h2>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg mb-3" placeholder="admin@email.com" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg mb-4" placeholder="Password" />
          <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // RENDER: DASHBOARD
  // ==========================================
  const filteredSpeakers = speakers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.speaker_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER & TABS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('users')} 
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Manage Users</div>
            </button>
            <button 
              onClick={() => setActiveTab('schedule')} 
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Master Schedule</div>
            </button>
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
            <LogOut className="w-4 h-4"/> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* TAB 1: MANAGE USERS */}
          {activeTab === 'users' && (
            <>
              {/* USER FORM */}
              <div className="lg:col-span-5 h-fit lg:sticky lg:top-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                  <h2 className="text-xl font-bold text-indigo-700 mb-6 flex gap-2">
                    {isEditingUser ? <Edit2 className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>} 
                    {isEditingUser ? 'Edit User' : 'Add Attendee'}
                  </h2>
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">ID (Unique)</label>
                        <input className="w-full p-2 border rounded font-mono text-sm" value={userForm.speaker_id} onChange={e => setUserForm({...userForm, speaker_id: e.target.value})} disabled={isEditingUser} placeholder="NM-001" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                        <input className="w-full p-2 border rounded text-sm" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                      <input className="w-full p-2 border rounded text-sm" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between mb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Personal Sessions</label>
                        <button type="button" onClick={addUserSessionRow} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold flex gap-1"><Plus className="w-3 h-3"/> Add</button>
                      </div>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {userSessions.map((s, i) => (
                          <div key={i} className="bg-gray-50 p-2 rounded border relative">
                            <button type="button" onClick={() => removeUserSessionRow(i)} className="absolute top-1 right-1 text-gray-400 hover:text-red-500"><X className="w-3 h-3"/></button>
                            <input className="w-full p-1 mb-1 text-sm border rounded" placeholder="Title" value={s.title} onChange={e => updateUserSessionRow(i, 'title', e.target.value)} />
                            <div className="grid grid-cols-2 gap-1">
                              <input className="p-1 text-xs border rounded" placeholder="Time" value={s.time} onChange={e => updateUserSessionRow(i, 'time', e.target.value)} />
                              <input className="p-1 text-xs border rounded" placeholder="Venue" value={s.venue} onChange={e => updateUserSessionRow(i, 'venue', e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                      {loading ? <Loader2 className="animate-spin mx-auto"/> : (isEditingUser ? "Save Changes" : "Create User")}
                    </button>
                    {isEditingUser && <button type="button" onClick={resetUserForm} className="w-full text-gray-400 text-xs py-2 hover:text-gray-600">Cancel Edit</button>}
                  </form>
                </div>
              </div>

              {/* USER LIST */}
              <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[80vh]">
                <div className="p-4 border-b bg-gray-50 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input className="w-full pl-9 p-2 border rounded-lg text-sm" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <button onClick={fetchSpeakers} className="text-indigo-600 text-sm font-bold">Refresh</button>
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 sticky top-0 text-xs font-bold text-gray-500 uppercase">
                      <tr><th className="p-3">User</th><th className="p-3 hidden sm:table-cell">Role</th><th className="p-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredSpeakers.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 w-fit px-1 rounded">{s.speaker_id}</div>
                            <div className="font-medium text-sm">{s.name}</div>
                          </td>
                          <td className="p-3 hidden sm:table-cell">
                            {s.personal_sessions?.length > 0 ? 
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{s.personal_sessions.length} Session(s)</span> 
                              : <span className="text-xs text-gray-400">Attendee</span>}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button onClick={() => editUser(s)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded mr-1"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => deleteUser(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MASTER SCHEDULE */}
          {activeTab === 'schedule' && (
            <>
              {/* SCHEDULE FORM */}
              <div className="lg:col-span-4 h-fit lg:sticky lg:top-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                  <h2 className="text-xl font-bold text-indigo-700 mb-6 flex gap-2">
                    {isEditingSchedule ? <Edit2 className="w-5 h-5"/> : <Calendar className="w-5 h-5"/>} 
                    {isEditingSchedule ? 'Edit Event' : 'Add Event'}
                  </h2>
                  <form onSubmit={handleScheduleSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Day</label>
                      <select 
                        className="w-full p-2 border rounded text-sm bg-white"
                        value={scheduleForm.day} 
                        onChange={e => setScheduleForm({...scheduleForm, day: e.target.value})}
                      >
                        <option>Day 1 (Feb 7)</option>
                        <option>Day 2 (Feb 8)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Time</label>
                        <input className="w-full p-2 border rounded text-sm" placeholder="e.g. 10:00 AM" value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Type</label>
                        <select 
                          className="w-full p-2 border rounded text-sm bg-white"
                          value={scheduleForm.type} 
                          onChange={e => setScheduleForm({...scheduleForm, type: e.target.value})}
                        >
                          <option>Session</option>
                          <option>Keynote</option>
                          <option>Break</option>
                          <option>Event</option>
                          <option>Sponsor</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
                      <input className="w-full p-2 border rounded text-sm" placeholder="Event Name" value={scheduleForm.title} onChange={e => setScheduleForm({...scheduleForm, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Venue</label>
                        <input className="w-full p-2 border rounded text-sm" placeholder="Room/Hall" value={scheduleForm.venue} onChange={e => setScheduleForm({...scheduleForm, venue: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Chair</label>
                        <input className="w-full p-2 border rounded text-sm" placeholder="Dr. Name" value={scheduleForm.session_chair} onChange={e => setScheduleForm({...scheduleForm, session_chair: e.target.value})} />
                      </div>
                    </div>

                    {/* COORDINATOR */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Coordinator</label>
                      <input className="w-full p-2 border rounded text-sm" placeholder="Prof. Name" value={scheduleForm.session_coordinator} onChange={e => setScheduleForm({...scheduleForm, session_coordinator: e.target.value})} />
                    </div>

                    <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                      {loading ? <Loader2 className="animate-spin mx-auto"/> : (isEditingSchedule ? "Save Event" : "Add to Schedule")}
                    </button>
                    {isEditingSchedule && <button type="button" onClick={resetScheduleForm} className="w-full text-gray-400 text-xs py-2 hover:text-gray-600">Cancel Edit</button>}
                  </form>
                </div>
              </div>

              {/* SCHEDULE LIST */}
              <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[80vh]">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">All Events</h3>
                  <button onClick={fetchSchedule} className="text-indigo-600 text-sm font-bold">Refresh</button>
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 sticky top-0 text-xs font-bold text-gray-500 uppercase">
                      <tr><th className="p-3">Time / Venue</th><th className="p-3">Event Details</th><th className="p-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {schedule.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-3 align-top w-1/4">
                             <div className="text-xs font-bold text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3"/> {item.time}</div>
                             <div className="text-xs text-indigo-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {item.venue}</div>
                             <div className="text-[10px] text-gray-400 mt-1">{item.day}</div>
                          </td>
                          <td className="p-3 align-top">
                            <div className="text-xs font-bold uppercase text-gray-400 mb-1">{item.type}</div>
                            <div className="font-medium text-sm text-gray-800">{item.title}</div>
                            
                            {/* DISPLAY CHAIR AND COORDINATOR */}
                            <div className="flex flex-col gap-1 mt-1">
                                {item.session_chair && <div className="text-xs text-indigo-600 flex items-center gap-1"><Briefcase className="w-3 h-3"/> Chair: {item.session_chair}</div>}
                                {item.session_coordinator && <div className="text-xs text-indigo-600 flex items-center gap-1"><Users className="w-3 h-3"/> Coord: {item.session_coordinator}</div>}
                            </div>
                          </td>
                          <td className="p-3 text-right align-top whitespace-nowrap">
                            <button onClick={() => editScheduleItem(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded mr-1"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => deleteScheduleItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admin;