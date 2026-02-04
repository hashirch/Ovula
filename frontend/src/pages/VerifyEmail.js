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
  
  // Get email from location state (passed from registration or login)
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
      
      // Redirect to login after successful verification
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
      setOtpCode(''); // Clear the input
      
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary-100 rounded-full">
              <Shield className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          {fromLogin ? (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Your account is not verified yet. Please verify your email to continue.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-character verification code to
            </p>
          )}
          <p className="mt-1 text-sm font-semibold text-primary-600">
            {email || 'your email address'}
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otpCode}
                  onChange={handleOtpChange}
                  maxLength={6}
                  className="input-field pl-10 text-center text-2xl font-mono tracking-widest uppercase"
                  placeholder="000000"
                  autoComplete="off"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Enter the 6-character code from your email
              </p>
            </div>

            {/* Verify Button */}
            <div>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>Verify Email</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Resend Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resending}
                className="btn-secondary flex items-center justify-center space-x-2 w-full disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-primary-600 hover:text-primary-500 flex items-center justify-center space-x-1 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>The code expires in 5 minutes</li>
                  <li>Check your spam folder if you don't see the email</li>
                  <li>You can request a new code if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
