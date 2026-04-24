import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Zap, Droplets, Smile, Sparkles, Activity, UtensilsCrossed, Stethoscope, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [cycleInfo, setCycleInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, logsResponse] = await Promise.all([
        axios.get('/logs/stats'),
        axios.get('/logs/?limit=90')
      ]);
      
      setStats(statsResponse.data);
      const logs = logsResponse.data;
      const cycleData = calculateCycleInfo(logs, statsResponse.data);
      setCycleInfo(cycleData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCycleInfo = (logs, stats) => {
    const periodLogs = logs.filter(log => log.period_status === 'period');
    if (periodLogs.length === 0) {
      return { currentDay: 0, daysSincePeriod: stats.days_since_period || 0, hasData: false };
    }
    periodLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastPeriodDate = new Date(periodLogs[0].date);
    const today = new Date();
    const daysSincePeriod = Math.floor((today - lastPeriodDate) / (1000 * 60 * 60 * 24));
    const currentDay = daysSincePeriod + 1;
    return {
      currentDay: currentDay > 35 ? 35 : currentDay,
      daysSincePeriod,
      hasData: true,
      lastPeriodDate
    };
  };

  const userName = user?.name?.split(' ')[0] || 'there';
  const ovDays = cycleInfo ? 14 - cycleInfo.currentDay : 0;
  const ovulationText = ovDays > 0 ? `Estimated Ovulation: ${ovDays} days` : ovDays === 0 ? "Ovulation: Today" : "Past Ovulation phase";
  const progressPercent = cycleInfo ? Math.min(Math.round((cycleInfo.currentDay / 28) * 100), 100) : 0;

  return (
    <div className="p-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Welcome back, {userName}.</h2>
        <p className="text-slate-600 mt-1">It's a beautiful day to nurture yourself.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
            
            <h3 className="text-xl font-bold text-slate-800 w-full text-left mb-8 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              Current Cycle
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-56">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              </div>
            ) : cycleInfo?.hasData ? (
              <div className="flex flex-col items-center">
                <div className="relative size-56 flex items-center justify-center mb-8">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,192,203,0.2)" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="50" cy="50" r="42" 
                      stroke="url(#gradient)" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
                      className="transition-all duration-1500 ease-out drop-shadow-sm"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#FDA4AF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-black text-5xl bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">{progressPercent}%</span>
                  </div>
                </div>
                <div className="bg-pink-50/80 px-6 py-3 rounded-2xl border border-pink-100">
                  <h4 className="font-bold text-pink-900 text-lg text-center">Day {cycleInfo.currentDay}</h4>
                  <p className="text-pink-600 text-sm mt-0.5 font-medium">{ovulationText}</p>
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-56 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                   <Calendar className="w-6 h-6 text-slate-300" />
                 </div>
                 <p className="text-slate-500 mb-4 font-medium">No cycle data recorded yet</p>
                 <Link to="/add-log" className="px-6 py-2.5 bg-pink-500 text-white rounded-full font-bold shadow-md shadow-pink-500/20 hover:bg-pink-600 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                   Log First Period
                 </Link>
               </div>
            )}
          </div>

          <div className="glass-card rounded-[2rem] p-8 bg-gradient-to-br from-[#FFF0F3]/80 to-white/60 relative overflow-hidden border-pink-100/60">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32 text-pink-500 -mb-8 -mr-8" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shadow-md shadow-pink-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">AI Health Insight</h3>
            </div>
            <p className="font-bold text-slate-800 mb-2">Unlock Personalized Intelligence</p>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed max-w-[90%]">
              Chat with your AI Assistant for tailored health recommendations and deeper understanding of your PCOS patterns.
            </p>
            <Link to="/chat" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-pink-600 font-bold text-sm hover:shadow-md hover:bg-pink-50 transition-all border border-pink-100 shadow-sm">
              Start Chatting
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/add-log" className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-md transition-all border border-rose-100/50">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-rose-500">
                  <Smile className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800">Mood</span>
              </Link>
              <Link to="/add-log" className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-md transition-all border border-amber-100/50">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-500">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800">Energy</span>
              </Link>
              <Link to="/add-log" className="bg-gradient-to-br from-sky-50 to-sky-100/50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-md transition-all border border-sky-100/50">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-sky-500">
                  <Droplets className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800">Flow</span>
              </Link>
              <Link to="/add-log" className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-md transition-all border border-purple-100/50">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-purple-500">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800">Symptoms</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 mt-2">Explore Features</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/pcos-prediction" className="glass-card bg-white/60 rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                  <Stethoscope className="w-5 h-5 text-pink-600" />
                </div>
                <span className="font-bold text-slate-700 text-sm">PCOS Care</span>
              </Link>
              <Link to="/insights" className="glass-card bg-white/60 rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                </div>
                <span className="font-bold text-slate-700 text-sm">Insights</span>
              </Link>
              <Link to="/diet-nutrition" className="glass-card bg-white/60 rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-bold text-slate-700 text-sm">Diet Plans</span>
              </Link>
              <Link to="/logs-history" className="glass-card bg-white/60 rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-bold text-slate-700 text-sm">Log History</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
