import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Bell, Zap, Droplets, Utensils, Smile, Sparkles, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/logs/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="p-8 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {userName}</h2>
          <p className="text-slate-500">It's a beautiful day to nurture yourself.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              className="w-full bg-white border border-pink-100 rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-pink-200 outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-sm text-sm" 
              placeholder="Search insights..." 
              type="text" 
            />
          </div>
          <button className="w-10 h-10 rounded-full bg-white border border-pink-100 flex items-center justify-center relative shadow-sm hover:bg-pink-50 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 size-2 bg-pink-500 rounded-full border border-white"></span>
          </button>
          <div className="h-10 w-10 rounded-full bg-pink-100 border-2 border-pink-200 overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* Cycle Progress Card */}
          <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-pink-500/5 blur-[100px] -z-10"></div>
            <h3 className="text-lg font-semibold text-slate-700 mb-6">Current Cycle Progress</h3>
            
            {/* Progress Wheel */}
            <div className="relative size-64 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[20px] border-white shadow-inner"></div>
              <div 
                className="absolute inset-0 rounded-full border-[20px] border-transparent cycle-ring-thick" 
                style={{ 
                  maskImage: 'radial-gradient(transparent 60%, black 61%)', 
                  WebkitMaskImage: 'radial-gradient(transparent 60%, black 61%)' 
                }}
              ></div>
              
              {/* Indicator Dot */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-pink-500 border-4 border-white shadow-lg z-10"></div>
              
              <div className="flex flex-col items-center z-10 relative">
                <span className="font-black text-6xl text-slate-800">14</span>
                <span className="text-pink-500 font-bold uppercase tracking-widest text-xs mt-1">Day</span>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-pink-100 text-pink-600 shadow-sm">
              <Zap className="w-4 h-4 fill-pink-600" />
              <span className="text-xs font-bold uppercase tracking-wide">Tracking Active</span>
            </div>
            
            <p className="mt-4 text-slate-500 text-sm max-w-xs leading-relaxed">
              Keep logging your symptoms to get personalized insights and predictions.
            </p>
          </div>

          {/* AI Insight Card */}
          <Link to="/chat" className="glass rounded-3xl p-6 flex items-center gap-5 border border-white/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-7 h-7 text-pink-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">AI Health Insight</h3>
              <p className="text-xs mt-1 leading-relaxed text-slate-500">
                Chat with your AI assistant for personalized health insights and recommendations.
              </p>
              <button className="mt-3 text-pink-500 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                Start Chatting <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </Link>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
          {/* Today's Vibe */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
              <Link to="/logs-history" className="text-pink-500 text-xs font-bold hover:underline">View History</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Mood', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-50', path: '/add-log' },
                { label: 'Energy', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-50', path: '/add-log' },
                { label: 'Flow', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-50', path: '/cycle-tracker' },
                { label: 'Symptoms', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-50', path: '/add-log' },
              ].map((item) => (
                <Link 
                  key={item.label} 
                  to={item.path}
                  className="glass rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-white/80 transition-all group border border-white/60"
                >
                  <div className={`size-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${item.bg}`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="font-semibold text-slate-600 text-xs">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          {!loading && stats && (
            <div className="glass rounded-3xl p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Your Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-800">{stats.total_logs || 0}</span>
                  <span className="text-sm text-slate-500 font-medium mt-1">Total Logs</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-800">{stats.avg_mood?.toFixed(1) || 'N/A'}</span>
                  <span className="text-sm text-slate-500 font-medium mt-1">Avg Mood</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-800">{stats.avg_sleep?.toFixed(1) || 'N/A'}h</span>
                  <span className="text-sm text-slate-500 font-medium mt-1">Avg Sleep</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-800">{stats.period_frequency || 0}</span>
                  <span className="text-sm text-slate-500 font-medium mt-1">Period Days</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="glass rounded-3xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800">Explore More</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/pcos-prediction" className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 hover:bg-white transition-all border border-pink-100 group">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">PCOS Care</p>
                  <p className="text-xs text-slate-500">Health insights</p>
                </div>
              </Link>
              <Link to="/insights" className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 hover:bg-white transition-all border border-pink-100 group">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Insights</p>
                  <p className="text-xs text-slate-500">View trends</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
