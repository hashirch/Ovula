import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Bell, ChevronRight, Edit3, User, Heart, Settings, Shield, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const [logsResponse, insightsResponse] = await Promise.all([
        axios.get('/logs/?limit=1'),
        axios.get('/insights/')
      ]);
      
      const lastLog = logsResponse.data[0];
      const insights = insightsResponse.data;
      
      setUserStats({
        lastPeriod: lastLog?.period_status === 'period' ? lastLog.date : null,
        avgCycle: insights.avg_cycle_length || 28,
        totalLogs: insights.total_logs || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="p-8 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-medium">Settings</span>
          <ChevronRight className="w-4 h-4" />
          <h2 className="text-slate-900 font-bold">User Profile</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-white/50 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 size-2 bg-pink-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-slate-900 font-bold text-sm">{user?.email || 'User'}</p>
              <p className="text-[10px] text-pink-500 uppercase font-black tracking-wider">Member</p>
            </div>
            <div className="relative">
              <div className="size-10 rounded-full border-2 border-pink-500 bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        {/* User Intro Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-400 to-pink-600 p-8 text-white shadow-xl shadow-pink-500/20">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="size-28 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner text-4xl font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-center md:text-left space-y-2 flex-1">
              <h3 className="text-3xl font-bold">Hello, {user?.email?.split('@')[0] || 'User'}!</h3>
              <p className="text-white/90 max-w-md font-medium leading-relaxed">
                Manage your reproductive health journey, track cycles, and customize your experience here.
              </p>
            </div>
            <div className="md:ml-auto">
              <button className="bg-white text-pink-600 px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-pink-50 active:scale-95 transition-all flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Account
              </button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 size-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 size-48 bg-pink-300/20 rounded-full blur-3xl"></div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Details */}
          <section className="glass-card rounded-[2rem] p-8 bg-white/60 border border-white/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-500">
                <User className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Personal Details</h4>
            </div>
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1">Email Address</label>
                <div className="px-5 py-3.5 bg-white rounded-xl text-sm font-semibold border border-pink-50 text-slate-700 shadow-sm">
                  {user?.email || 'user@ovula.health'}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1">Member Since</label>
                <div className="px-5 py-3.5 bg-white rounded-xl text-sm font-semibold border border-pink-50 text-slate-700 shadow-sm">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1">Account Status</label>
                <div className="px-5 py-3.5 bg-white rounded-xl text-sm font-medium border border-pink-50 text-slate-700 shadow-sm flex items-center justify-between">
                  <span className="font-semibold">Active</span>
                  <span className="flex items-center gap-2 text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-md uppercase tracking-wide">
                    Verified
                    <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Health Profile */}
          <section className="glass-card rounded-[2rem] p-8 bg-white/60 border border-white/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-500">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Health Profile</h4>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1">Avg. Cycle</label>
                  <div className="px-5 py-3.5 bg-pink-50 border border-pink-100 rounded-xl text-sm font-bold text-pink-600 shadow-sm">
                    {loading ? '...' : `${userStats?.avgCycle || 28} Days`}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1">Total Logs</label>
                  <div className="px-5 py-3.5 bg-white rounded-xl text-sm font-semibold border border-pink-50 text-slate-700 shadow-sm">
                    {loading ? '...' : userStats?.totalLogs || 0}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1">Last Period</label>
                <div className="px-5 py-3.5 bg-white rounded-xl text-sm font-semibold border border-pink-50 text-slate-700 shadow-sm">
                  {loading ? '...' : userStats?.lastPeriod 
                    ? new Date(userStats.lastPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Not tracked yet'
                  }
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-1">Health Goals</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-4 py-1.5 bg-white border border-pink-100 text-pink-600 rounded-full text-xs font-bold shadow-sm">Track Cycle</span>
                  <span className="px-4 py-1.5 bg-white border border-pink-100 text-pink-600 rounded-full text-xs font-bold shadow-sm">Wellness</span>
                  <span className="px-4 py-1.5 bg-white border border-pink-100 text-pink-600 rounded-full text-xs font-bold shadow-sm">PCOS Care</span>
                </div>
              </div>
            </div>
          </section>

          {/* App Settings */}
          <section className="glass-card rounded-[2rem] p-8 bg-white/60 border border-white/60 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-500">
                <Settings className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">App Settings</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: 'Notifications', sub: 'Daily reminders enabled', active: true },
                { title: 'Smart Alerts', sub: 'Predicted ovulation', active: true },
                { title: 'Data Privacy', sub: 'Secure & encrypted', verified: true }
              ].map((item, idx) => (
                <div key={idx} className="px-5 py-4 bg-white rounded-2xl border border-pink-50 shadow-sm flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{item.title}</span>
                    <span className="text-xs text-slate-400 font-medium mt-0.5">{item.sub}</span>
                  </div>
                  {item.verified ? (
                     <Shield className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <div className={`w-11 h-6 rounded-full relative transition-colors ${item.active ? 'bg-pink-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 size-4 bg-white rounded-full shadow-md transition-all ${item.active ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
          
          {/* Account Actions */}
          <section className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50/50 border border-slate-200 rounded-[2rem]">
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
              <h4 className="text-slate-700 font-bold flex items-center gap-2 justify-center sm:justify-start">
                <Shield className="w-4 h-4" /> Account Management
              </h4>
              <p className="text-slate-500 text-xs mt-1 font-medium">Manage your account settings and data.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleLogout}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button className="px-5 py-2.5 bg-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-500/20 hover:bg-pink-600 transition-colors">
                Save Changes
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
