import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, LogIn, ArrowLeft, Loader2, Heart } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Handle Input */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
    if (error) setError('');
  };

  /* Handle Login */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.id || !formData.mobile) {
        throw new Error('Please fill in both fields.');
      }
// --- DEV MODE START ---
  // If user enters "test" and "123", let them in without checking Supabase
  if (formData.id === 'test' && formData.mobile === '123') {
     const mockUser = { 
       speaker_id: 'test', 
       name: 'Developer Mode', 
       mobile_number: '123' 
     };
     localStorage.setItem('speaker', JSON.stringify(mockUser));
     navigate('/dashboard');
     return; // Stop here so we don't call Supabase
  }
// --- DEV MODE END ---
      const { data, error: dbError } = await supabase
        .from('speakers')
        .select('*')
        .eq('speaker_id', formData.id)
        .eq('mobile_number', formData.mobile)
        .limit(1);

      if (dbError) throw dbError;
      if (!data || data.length === 0) {
        throw new Error('Invalid Speaker ID or Mobile Number.');
      }

      /* Save auth + speaker data */
      localStorage.setItem('speakerAuth', 'true');
      localStorage.setItem('speaker', JSON.stringify(data[0]));

      navigate('/dashboard', { replace: true });

    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-100 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center text-white relative">
          <Link
            to="/"
            className="absolute top-4 left-4 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <h1 className="text-2xl font-bold">Speaker Login</h1>
          <p className="text-indigo-100 mt-2 text-sm">
            NMTE2A Conference
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Speaker ID */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="id"
                placeholder="Speaker ID"
                value={formData.id}
                onChange={handleChange}
                className="w-full pl-11 py-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Mobile */}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full pl-11 py-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>
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

export default Login;
