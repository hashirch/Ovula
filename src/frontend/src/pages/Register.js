import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      toast.success(response.data.message || 'Registration successful! Check your email.', {
        duration: 8000,
        style: {
          maxWidth: '500px'
        }
      });
      
      navigate('/verify-email', { state: { email: formData.email } });
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-[#FFF0F3] via-[#FFE4E9] to-[#FFD1DC]">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,116,177,0.3)] border border-white/50">
            <img src="/ovula-logo.png" alt="Ovula Logo" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-pink-500 drop-shadow-sm">Ovula</h2>
        </div>

        {/* Card */}
        <div className="glass-card w-full rounded-[2.5rem] p-8 md:p-10 bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-pink-500/10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Join Ovula</h1>
            <p className="text-slate-500 text-sm font-medium">Start your PCOS tracking journey</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 ml-4 uppercase tracking-[0.15em]">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
                <input 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/50 border border-white focus:bg-white outline-none text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm font-medium" 
                  placeholder="Enter your full name" 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 ml-4 uppercase tracking-[0.15em]">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
                <input 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/50 border border-white focus:bg-white outline-none text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm font-medium" 
                  placeholder="hello@example.com" 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 ml-4 uppercase tracking-[0.15em]">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
                <input 
                  className="w-full pl-14 pr-14 py-4 rounded-2xl bg-white/50 border border-white focus:bg-white outline-none text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm font-medium" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 ml-4 uppercase tracking-[0.15em]">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
                <input 
                  className="w-full pl-14 pr-14 py-4 rounded-2xl bg-white/50 border border-white focus:bg-white outline-none text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm font-medium" 
                  placeholder="••••••••" 
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all mt-4 bg-gradient-to-r from-pink-500 to-pink-400 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center pt-6">
            <p className="text-slate-500 text-sm font-medium">
              Already have an account? <Link to="/login" className="font-bold text-pink-500 hover:underline">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Social Login */}
        <div className="w-full mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="flex-grow border-t border-pink-200/60"></div>
            <span className="mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Quick Access</span>
            <div className="flex-grow border-t border-pink-200/60"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/60 transition-all shadow-sm active:scale-95">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              <span className="text-sm font-bold text-slate-700">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/60 transition-all shadow-sm active:scale-95">
              <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-5 h-5" alt="Apple" />
              <span className="text-sm font-bold text-slate-700">Apple</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
