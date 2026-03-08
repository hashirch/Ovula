import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Shield, RefreshCw, ArrowLeft } from 'lucide-react';

const VerifyEmail = () => {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || '';
  const fromLogin = location.state?.fromLogin || false;

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-character code');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/verify-otp', {
        email: email,
        otp_code: otpCode
      });

      toast.success(response.data.message || 'Email verified successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Verification failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address not found. Please register again.');
      return;
    }

    setResending(true);

    try {
      const response = await axios.post('/auth/resend-otp', {
        email: email
      });

      toast.success(response.data.message || 'New code sent to your email!', {
        duration: 8000,
        style: {
          maxWidth: '500px'
        }
      });
      setOtpCode('');
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to resend code. Please try again.';
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^a-fA-F0-9]/g, '').slice(0, 6);
    setOtpCode(value);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-[#FFF0F3] via-[#FFE4E9] to-[#FFD1DC]">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,116,177,0.3)] border border-white/50">
            <img src="/ovula-logo.png" alt="Ovula Logo" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-pink-500 drop-shadow-sm">Verify Email</h2>
        </div>

        {/* Card */}
        <div className="glass-card w-full rounded-[2.5rem] p-8 md:p-10 bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-pink-500/10">
          <div className="text-center mb-8">
            {fromLogin ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl mb-4">
                <p className="text-sm text-yellow-800 font-medium">
                  Your account is not verified yet. Please verify your email to continue.
                </p>
              </div>
            ) : (
              <p className="text-slate-500 text-sm font-medium mb-2">
                We've sent a 6-character verification code to
              </p>
            )}
            <p className="text-sm font-bold text-pink-600">
              {email || 'your email address'}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 ml-4 uppercase tracking-[0.15em]">Verification Code</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={handleOtpChange}
                  maxLength={6}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/50 border border-white focus:bg-white outline-none text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm font-mono text-2xl tracking-widest uppercase text-center font-bold"
                  placeholder="000000"
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                Enter the 6-character code from your email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl shadow-pink-500/30 active:scale-[0.98] transition-all bg-gradient-to-r from-pink-500 to-pink-400 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Verify Email</span>
                </div>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 pt-6 border-t border-pink-100">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-3 font-medium">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full py-3 rounded-2xl font-bold text-pink-600 bg-white/40 hover:bg-white/60 border border-white/60 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {resending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend Code</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-pink-600 hover:text-pink-500 flex items-center justify-center gap-1 mx-auto font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="w-full mt-6 glass-card rounded-2xl p-4 border border-yellow-200/50">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-yellow-800 mb-1">
                Important
              </h3>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• The code expires in 5 minutes</li>
                <li>• Check your spam folder if you don't see the email</li>
                <li>• You can request a new code if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
