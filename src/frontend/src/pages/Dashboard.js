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
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 w-full text-left mb-6">Current Cycle Progress</h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
              </div>
            ) : cycleInfo?.hasData ? (
              <div className="flex flex-col items-center">
                <div className="relative size-48 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="#e5989b" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-bold text-4xl text-slate-800">{progressPercent}%</span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Day {cycleInfo.currentDay} of Cycle</h4>
                <p className="text-slate-500 text-sm mt-1">{ovulationText}</p>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-48">
                 <p className="text-slate-500 mb-4">No cycle data available</p>
                 <Link to="/add-log" className="px-6 py-2 bg-pink-100 text-pink-600 rounded-full font-semibold">Log Period</Link>
               </div>
            )}
          </div>

          <div className="bg-[#fff5f7] rounded-3xl p-6 shadow-sm border border-pink-50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#d88998]" />
              <h3 className="font-bold text-slate-800">AI Health Insight</h3>
            </div>
            <p className="font-semibold text-slate-800 text-sm mb-1">Unlock Personalized Insights:</p>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Chat with your AI Assistant for tailored health recommendations based on your tracking.
            </p>
            <Link to="/chat" className="inline-block px-5 py-2 rounded-xl border border-[#d88998] text-[#d88998] font-semibold text-sm hover:bg-pink-50 transition-colors">
              Start Chatting
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/add-log" className="bg-[#ffe4e6] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-sm">
                <Smile className="w-8 h-8 text-[#fb7185]" />
                <span className="font-semibold text-slate-800">Mood</span>
              </Link>
              <Link to="/add-log" className="bg-[#fef3c7] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-sm">
                <Zap className="w-8 h-8 text-[#fbbf24]" />
                <span className="font-semibold text-slate-800">Energy</span>
              </Link>
              <Link to="/cycle-tracker" className="bg-[#e0f2fe] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-sm">
                <Droplets className="w-8 h-8 text-[#38bdf8]" />
                <span className="font-semibold text-slate-800">Flow</span>
              </Link>
              <Link to="/add-log" className="bg-[#f3e8ff] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-sm">
                <Activity className="w-8 h-8 text-[#a855f7]" />
                <span className="font-semibold text-slate-800">Symptoms</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 mt-2">Explore More</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/pcos-prediction" className="bg-white rounded-2xl py-3 px-4 border border-slate-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-pink-500" />
                </div>
                <span className="font-semibold text-slate-700 text-sm">PCOS Care</span>
              </Link>
              <Link to="/insights" className="bg-white rounded-2xl py-3 px-4 border border-slate-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                </div>
                <span className="font-semibold text-slate-700 text-sm">Insights</span>
              </Link>
              <Link to="/diet-nutrition" className="bg-white rounded-2xl py-3 px-4 border border-slate-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-pink-500" />
                </div>
                <span className="font-semibold text-slate-700 text-sm">Diet Plans</span>
              </Link>
              <Link to="/cycle-tracker" className="bg-white rounded-2xl py-3 px-4 border border-slate-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-pink-500" />
                </div>
                <span className="font-semibold text-slate-700 text-sm">Cycle Tracker</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
