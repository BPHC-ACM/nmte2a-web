import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User, Phone, LogIn, ArrowLeft, Loader2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ id: '', mobile: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. Basic Validation
    if (!formData.id || !formData.mobile) {
      toast.error('Please fill in both fields.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Verifying credentials...');

    try {
      // 2. Query Supabase
      const { data, error: dbError } = await supabase
        .from('speakers')
        .select('*')
        .eq('speaker_id', formData.id)
        .eq('phone', formData.mobile)
        .maybeSingle();

      // 3. Handle Database Errors
      if (dbError) {
        console.error('Supabase Error:', dbError);
        throw new Error('System error. Please try again later.');
      }

      // 4. Handle Invalid Credentials
      if (!data) {
        throw new Error('Invalid Speaker ID or Mobile Number.');
      }

      // 5. Success
      toast.success(`Welcome back, ${data.name || 'User'}!`, { id: toastId });
      
      localStorage.setItem('speakerAuth', 'true');
      localStorage.setItem('speaker', JSON.stringify(data));

      navigate('/dashboard', { replace: true });

    } catch (err) {
      // 6. Catch & Display Errors
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-100 p-4">
      
      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">

        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          {/* Back Button */}
          <Link
            to="/"
            className="absolute top-4 left-4 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <h1 className="relative z-10 text-2xl font-bold tracking-tight">User Login</h1>
          <p className="relative z-10 text-indigo-100 mt-2 text-sm font-medium">
            NMTE2A Conference Portal
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* ID Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                name="id"
                placeholder="Unique ID"
                value={formData.id}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 pl-11 text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Mobile Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number/Password"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 pl-11 text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-indigo-600 py-4 text-white font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
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

        {/* Footer */}
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