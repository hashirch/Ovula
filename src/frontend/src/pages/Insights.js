import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Lightbulb, Activity, AlertTriangle, Brain } from 'lucide-react';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [insightsResponse, logsResponse] = await Promise.all([
        axios.get('/insights/'),
        axios.get('/logs/?limit=30')
      ]);
      
      setInsights(insightsResponse.data);
      setLogs(logsResponse.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    const sortedLogs = logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return sortedLogs.map(log => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: log.mood,
      sleep: log.sleep_hours || 0,
      pain: log.pain_level,
      acne: log.acne,
      hairfall: log.hairfall,
      cravings: log.cravings
    }));
  };

  const preparePeriodData = () => {
    const periodCounts = logs.reduce((acc, log) => {
      acc[log.period_status] = (acc[log.period_status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(periodCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: status === 'period' ? '#ef4444' : status === 'spotting' ? '#f97316' : '#6b7280'
    }));
  };

  const getInsightLevel = (value, thresholds) => {
    if (value >= thresholds.high) return { level: 'high', color: 'emerald' };
    if (value >= thresholds.medium) return { level: 'medium', color: 'yellow' };
    return { level: 'low', color: 'red' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!insights || insights.total_logs === 0) {
    return (
      <div className="p-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-2xl text-center">
          <div className="relative mb-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-blue-200 blur-[100px] opacity-60 rounded-full w-80 h-80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute w-full h-full opacity-60 mix-blend-multiply">
                <path d="M10,50 Q30,10 50,50 T90,50 M20,60 Q50,20 80,60 M30,70 Q50,40 70,70" stroke="url(#lineGrad)" strokeWidth="0.5" fill="none" className="opacity-50" />
                <circle cx="20" cy="50" r="1.5" fill="#f472b6" />
                <circle cx="80" cy="50" r="1.5" fill="#60a5fa" />
                <circle cx="40" cy="30" r="1.5" fill="#a78bfa" />
                <circle cx="60" cy="70" r="1.5" fill="#f472b6" />
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
              <Brain className="w-32 h-32 text-pink-400 drop-shadow-2xl relative z-10" strokeWidth={1} />
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Your Personalized Insights Await.</h2>
          <p className="text-slate-600 mb-10 text-base leading-relaxed max-w-xl mx-auto">
            Start logging your daily symptoms, cycle data, and wellness factors. Ovula's advanced AI will analyze your unique patterns to unlock personalized health trends and actionable recommendations.
          </p>
          <a href="/add-log" className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-10 py-4 text-base font-bold text-white shadow-xl shadow-pink-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 inline-block">
            Add Your First Log
          </a>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const periodData = preparePeriodData();
  
  const moodInsight = getInsightLevel(insights.avg_mood, { high: 4, medium: 3 });
  const sleepInsight = getInsightLevel(insights.avg_sleep, { high: 8, medium: 7 });
  const painInsight = getInsightLevel(insights.avg_pain, { high: 1, medium: 3 });

  return (
    <div className="p-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Insights & Analytics</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-3xl bg-white/60 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Logs</p>
              <p className="text-3xl font-bold text-slate-800">{insights.total_logs}</p>
            </div>
            <div className="size-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl bg-white/60 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Avg Mood</p>
              <p className="text-3xl font-bold text-slate-800">{insights.avg_mood}/5</p>
              <div className={`text-xs px-3 py-1 rounded-full inline-block mt-2 bg-${moodInsight.color}-100 text-${moodInsight.color}-600 font-bold border border-${moodInsight.color}-200`}>
                {moodInsight.level}
              </div>
            </div>
            <div className="text-4xl">
              {insights.avg_mood >= 4 ? '😊' : insights.avg_mood >= 3 ? '😐' : '😞'}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl bg-white/60 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Avg Sleep</p>
              <p className="text-3xl font-bold text-slate-800">{insights.avg_sleep}h</p>
              <div className={`text-xs px-3 py-1 rounded-full inline-block mt-2 bg-${sleepInsight.color}-100 text-${sleepInsight.color}-600 font-bold border border-${sleepInsight.color}-200`}>
                {sleepInsight.level}
              </div>
            </div>
            <div className="text-4xl">🌙</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl bg-white/60 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Avg Pain</p>
              <p className="text-3xl font-bold text-slate-800">{insights.avg_pain}/5</p>
              <div className={`text-xs px-3 py-1 rounded-full inline-block mt-2 bg-${painInsight.color}-100 text-${painInsight.color}-600 font-bold border border-${painInsight.color}-200`}>
                {painInsight.level}
              </div>
            </div>
            <div className="text-4xl">
              {insights.avg_pain >= 3 ? '😣' : insights.avg_pain >= 1 ? '😐' : '😌'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-card p-8 rounded-3xl bg-white/60 border border-white/60">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Mood & Sleep Trends</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                    backgroundColor: 'white'
                  }}
                />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={3} name="Mood" dot={{ fill: '#ec4899', r: 4 }} />
                <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={3} name="Sleep (hours)" dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-8">No data available</p>
          )}
        </div>

        <div className="glass-card p-8 rounded-3xl bg-white/60 border border-white/60">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Symptom Levels</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                    backgroundColor: 'white'
                  }}
                />
                <Bar dataKey="pain" fill="#ef4444" name="Pain" radius={[8, 8, 0, 0]} />
                <Bar dataKey="acne" fill="#f59e0b" name="Acne" radius={[8, 8, 0, 0]} />
                <Bar dataKey="hairfall" fill="#8b5cf6" name="Hair Fall" radius={[8, 8, 0, 0]} />
                <Bar dataKey="cravings" fill="#10b981" name="Cravings" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Period Distribution */}
      {periodData.length > 0 && (
        <div className="glass-card p-8 rounded-3xl mb-8 bg-white/60 border border-white/60">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Period Status Distribution</h3>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={periodData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {periodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-3">
              {periodData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-pink-100">
                  <div 
                    className="size-4 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-slate-700 font-semibold">
                    {item.name}: {item.value} days ({((item.value / insights.total_logs) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="glass-card p-8 rounded-3xl mb-8 bg-white/60 border border-white/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Personalized Recommendations</h3>
        </div>
        
        <div className="space-y-3">
          {insights.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800 font-medium">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Health Alerts */}
      <div className="glass-card p-8 rounded-3xl bg-white/60 border border-white/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Health Alerts</h3>
        </div>
        
        <div className="space-y-3">
          {insights.avg_pain > 3 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm text-red-800 font-medium">
                <strong className="font-bold">High Pain Levels:</strong> Your average pain level is {insights.avg_pain}/5. 
                Consider consulting your healthcare provider if pain persists.
              </p>
            </div>
          )}
          
          {insights.avg_sleep < 6 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
              <p className="text-sm text-orange-800 font-medium">
                <strong className="font-bold">Insufficient Sleep:</strong> You're averaging {insights.avg_sleep} hours of sleep. 
                Aim for 7-9 hours for better PCOS management.
              </p>
            </div>
          )}
          
          {insights.avg_mood < 2.5 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-sm text-yellow-800 font-medium">
                <strong className="font-bold">Low Mood Pattern:</strong> Your mood has been consistently low. 
                Consider speaking with a mental health professional.
              </p>
            </div>
          )}
          
          {insights.period_frequency === 0 && insights.total_logs > 30 && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
              <p className="text-sm text-purple-800 font-medium">
                <strong className="font-bold">No Period Recorded:</strong> You haven't logged any periods in the last month. 
                This could be normal for PCOS, but consider consulting your healthcare provider.
              </p>
            </div>
          )}
          
          {insights.avg_pain < 1 && insights.avg_mood > 4 && insights.avg_sleep > 7 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
              <p className="text-sm text-green-800 font-medium">
                <strong className="font-bold">Great Progress:</strong> Your symptoms are well-managed! 
                Keep up the good work with your current routine.
              </p>
            </div>
          )}
          
          {!insights.avg_pain && !insights.avg_sleep && !insights.avg_mood && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-sm text-slate-600 font-medium">
                No health alerts at this time. Keep tracking your symptoms regularly!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
