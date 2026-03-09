import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, TrendingDown, TrendingUp, CheckCircle, Zap, Brain, Download, Search, Bell, Edit } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const PCOSPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [healthProfile, setHealthProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    age_group: 2,
    is_overweight: 0,
    has_weight_fluctuation: 0,
    has_irregular_periods: 0,
    typical_period_length: 5,
    typical_cycle_length: 28,
    difficulty_conceiving: 0,
    hair_chin: 0,
    hair_cheeks: 0,
    hair_breasts: 0,
    hair_upper_lips: 0,
    hair_arms: 0,
    hair_thighs: 0,
    has_acne: 0,
    has_hair_loss: 0,
    has_dark_patches: 0,
    always_tired: 0,
    frequent_mood_swings: 0,
    exercise_per_week: 0,
    eat_outside_per_week: 0,
    consumes_canned_food: 0
  });

  useEffect(() => {
    fetchLogs();
    fetchHealthProfile();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/logs/?limit=30');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchHealthProfile = async () => {
    try {
      const response = await axios.get('/prediction/health-profile');
      setHealthProfile(response.data);
      setProfileData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setShowProfileForm(true);
      }
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/prediction/health-profile', profileData);
      setHealthProfile(response.data);
      setShowProfileForm(false);
      toast.success('Health profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save health profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!healthProfile) {
      toast.error('Please complete your health profile first');
      setShowProfileForm(true);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/prediction/predict');
      setPrediction(response.data);
      toast.success('PCOS prediction generated successfully!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to generate prediction';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from logs
  const chartData = logs.slice(0, 6).reverse().map((log, index) => {
    const date = new Date(log.date);
    return {
      name: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      value: (log.acne + log.hairfall + log.pain_level) * 10 + Math.random() * 20
    };
  });

  return (
    <div className="p-8 pb-20">
      {/* Health Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Health Profile</h3>
              <button 
                onClick={() => setShowProfileForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Age Group</label>
                  <select 
                    value={profileData.age_group}
                    onChange={(e) => setProfileData({...profileData, age_group: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none"
                  >
                    <option value={1}>Under 20</option>
                    <option value={2}>20-30</option>
                    <option value={3}>30-40</option>
                    <option value={4}>Over 40</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Typical Cycle Length (days)</label>
                  <input 
                    type="number"
                    value={profileData.typical_cycle_length}
                    onChange={(e) => setProfileData({...profileData, typical_cycle_length: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none"
                    min="20" max="45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Typical Period Length (days)</label>
                  <input 
                    type="number"
                    value={profileData.typical_period_length}
                    onChange={(e) => setProfileData({...profileData, typical_period_length: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none"
                    min="2" max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Exercise per Week (days)</label>
                  <input 
                    type="number"
                    value={profileData.exercise_per_week}
                    onChange={(e) => setProfileData({...profileData, exercise_per_week: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none"
                    min="0" max="7"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Eat Outside per Week (times)</label>
                  <input 
                    type="number"
                    value={profileData.eat_outside_per_week}
                    onChange={(e) => setProfileData({...profileData, eat_outside_per_week: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-300 outline-none"
                    min="0" max="21"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-800">Health Indicators</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'is_overweight', label: 'Are you overweight?' },
                    { key: 'has_weight_fluctuation', label: 'Weight fluctuations?' },
                    { key: 'has_irregular_periods', label: 'Irregular periods?' },
                    { key: 'difficulty_conceiving', label: 'Difficulty conceiving?' },
                    { key: 'has_acne', label: 'Acne issues?' },
                    { key: 'has_hair_loss', label: 'Hair loss?' },
                    { key: 'has_dark_patches', label: 'Dark skin patches?' },
                    { key: 'always_tired', label: 'Always tired?' },
                    { key: 'frequent_mood_swings', label: 'Frequent mood swings?' },
                    { key: 'consumes_canned_food', label: 'Consume canned food?' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-pink-100 hover:bg-pink-50 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={profileData[item.key] === 1}
                        onChange={(e) => setProfileData({...profileData, [item.key]: e.target.checked ? 1 : 0})}
                        className="w-5 h-5 text-pink-500 rounded focus:ring-pink-300"
                      />
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-800">Excess Hair Growth</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'hair_chin', label: 'Chin' },
                    { key: 'hair_cheeks', label: 'Cheeks' },
                    { key: 'hair_breasts', label: 'Breasts' },
                    { key: 'hair_upper_lips', label: 'Upper Lips' },
                    { key: 'hair_arms', label: 'Arms' },
                    { key: 'hair_thighs', label: 'Thighs' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-pink-100 hover:bg-pink-50 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={profileData[item.key] === 1}
                        onChange={(e) => setProfileData({...profileData, [item.key]: e.target.checked ? 1 : 0})}
                        className="w-5 h-5 text-pink-500 rounded focus:ring-pink-300"
                      />
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowProfileForm(false)}
                  className="px-6 py-3 rounded-xl font-bold border border-pink-200 hover:bg-pink-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-8 sticky top-0 z-10 bg-[#FFF5F7]/90 backdrop-blur-sm py-4 -mx-8 px-8 border-b border-pink-100/50">
        <div className="flex items-center gap-6 flex-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">PCOS Care Overview</h2>
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              className="w-full rounded-xl border border-pink-100 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-pink-200 outline-none" 
              placeholder="Search trends, logs..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {healthProfile && (
            <button 
              onClick={() => setShowProfileForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-pink-100 hover:bg-pink-50 transition-colors text-sm font-medium text-slate-600"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-pink-100 hover:bg-pink-50 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-pink-500 border-2 border-white"></span>
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {/* Hormonal Summary Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-800">Hormonal Summary</h3>
              <p className="text-xs font-bold uppercase tracking-widest mt-1 text-slate-400">Last updated: 2 hours ago from symptom tracking</p>
            </div>
            <button 
              onClick={handlePredict}
              disabled={loading}
              className="flex items-center gap-2 text-pink-600 font-bold text-[11px] uppercase tracking-widest hover:text-pink-700 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-pink-100 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> 
              {loading ? 'Analyzing...' : healthProfile ? 'Generate Report' : 'Create Profile First'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testosterone Card */}
            <div className="glass-card p-6 rounded-3xl flex flex-col gap-4 bg-white/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Symptom Severity</span>
                <Activity className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-800">
                  {prediction ? `${prediction.risk_score}%` : '--'} 
                  <span className="text-sm font-bold text-slate-400 ml-1">Risk</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-emerald-500 text-xs font-bold">
                  <TrendingDown className="w-3 h-3" /> Tracking helps
                </div>
              </div>
              <div className="h-1.5 w-full bg-pink-100 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-pink-500 rounded-full transition-all duration-500" 
                  style={{ width: prediction ? `${prediction.risk_score}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* LH/FSH Ratio Card */}
            <div className="glass-card p-6 rounded-3xl flex flex-col gap-4 bg-white/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Pain Level</span>
                <Activity className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-800">
                  {logs.length > 0 
                    ? (logs.reduce((sum, log) => sum + log.pain_level, 0) / logs.length).toFixed(1)
                    : '0.0'
                  }/5
                </div>
                <div className="mt-1 flex items-center gap-1 text-rose-500 text-xs font-bold">
                  <TrendingUp className="w-3 h-3" /> Monitor closely
                </div>
              </div>
              <div className="h-1.5 w-full bg-pink-100 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-pink-500 rounded-full" 
                  style={{ 
                    width: logs.length > 0 
                      ? `${(logs.reduce((sum, log) => sum + log.pain_level, 0) / logs.length / 5) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>

            {/* Progesterone Card */}
            <div className="glass-card p-6 rounded-3xl flex flex-col gap-4 bg-white/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Mood Score</span>
                <Activity className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-800">
                  {logs.length > 0 
                    ? (logs.reduce((sum, log) => sum + log.mood, 0) / logs.length).toFixed(1)
                    : '0.0'
                  }/5
                </div>
                <div className="mt-1 flex items-center gap-1 text-emerald-500 text-xs font-bold">
                  <CheckCircle className="w-3 h-3" /> Good range
                </div>
              </div>
              <div className="h-1.5 w-full bg-pink-100 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-pink-500 rounded-full" 
                  style={{ 
                    width: logs.length > 0 
                      ? `${(logs.reduce((sum, log) => sum + log.mood, 0) / logs.length / 5) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <section className="lg:col-span-2">
            <div className="glass-card p-8 rounded-3xl h-full bg-white/60 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-extrabold tracking-tight text-slate-800">Symptom Trends</h3>
                <div className="flex items-center gap-1 p-1 rounded-full bg-pink-50 border border-pink-100">
                  <button className="px-4 py-1.5 text-[10px] font-bold bg-pink-500 text-white rounded-full shadow-sm uppercase tracking-wider">6 Months</button>
                  <button className="px-4 py-1.5 text-[10px] font-bold text-slate-400 hover:text-pink-600 uppercase tracking-wider transition-colors">Year</button>
                </div>
              </div>
              
              <div className="flex-1 w-full min-h-[250px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}
                      />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                        dy={10}
                      />
                      <Bar dataKey="value" radius={[20, 20, 0, 0]} barSize={60}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#EC4899' : '#FBCFE8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400 font-medium">No data available. Start logging to see trends.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Symptom Log */}
          <section className="lg:col-span-1">
            <div className="glass-card p-6 rounded-3xl flex flex-col h-full bg-white/60">
              <h3 className="text-xl font-extrabold tracking-tight text-slate-800 mb-6">Recent Symptom Log</h3>
              <div className="flex flex-col gap-4 flex-1">
                {logs.slice(0, 3).map((log, idx) => {
                  const symptoms = [];
                  if (log.acne > 2) symptoms.push({ label: 'Acne', value: log.acne });
                  if (log.hairfall > 2) symptoms.push({ label: 'Hair Fall', value: log.hairfall });
                  if (log.pain_level > 2) symptoms.push({ label: 'Pain', value: log.pain_level });
                  
                  const Icon = idx === 0 ? Zap : idx === 1 ? Activity : Brain;
                  
                  return (
                    <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/50 transition-colors border border-transparent hover:border-pink-100 cursor-pointer group">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-500 border border-pink-100 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">
                          {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          Mood: {log.mood}/5, Pain: {log.pain_level}/5
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {symptoms.map(symptom => (
                            <span key={symptom.label} className="px-2 py-0.5 bg-pink-50 rounded-md text-[9px] font-bold text-pink-600 border border-pink-100">
                              {symptom.label}: {symptom.value}
                            </span>
                          ))}
                          {symptoms.length === 0 && (
                            <span className="px-2 py-0.5 bg-green-50 rounded-md text-[9px] font-bold text-green-600 border border-green-100">
                              Feeling Good
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {logs.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400 text-sm text-center">No logs yet. Start tracking your symptoms!</p>
                  </div>
                )}
              </div>
              <button className="mt-6 w-full py-3 text-[11px] font-black hover:bg-pink-50 rounded-xl transition-colors uppercase tracking-widest text-pink-400 hover:text-pink-600">
                View Full History
              </button>
            </div>
          </section>
        </div>

        {/* Prediction Results */}
        {prediction && (
          <section className="glass-card p-8 rounded-3xl bg-white/60 border border-white/60">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-800 mb-6">PCOS Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Based on your symptom tracking and health data, our AI model has analyzed your PCOS risk factors.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl border border-pink-100">
                    <span className="text-sm font-bold text-slate-700">Risk Score</span>
                    <span className="text-lg font-bold text-pink-600">{prediction.risk_score}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-pink-100">
                    <span className="text-sm font-bold text-slate-700">Confidence</span>
                    <span className="text-lg font-bold text-slate-800">{prediction.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-pink-100">
                    <span className="text-sm font-bold text-slate-700">Classification</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      prediction.prediction === 'PCOS' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {prediction.prediction}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {prediction.recommendations?.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-blue-800">{rec}</p>
                    </div>
                  )) || (
                    <>
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-800">Continue regular symptom tracking for better insights</p>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-800">Maintain a balanced diet and regular exercise routine</p>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-800">Consult with your healthcare provider for personalized advice</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recipe Section */}
        <section className="glass-card p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 bg-white/60 border border-white/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="max-w-xl">
              <h4 className="text-2xl font-extrabold tracking-tight mb-3 text-slate-800">Hormone-Friendly Recipe of the Day</h4>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed font-medium">
                Boost your progesterone naturally with this high-zinc salad featuring pumpkin seeds and roasted kale. Perfect for your current cycle phase.
              </p>
              <div className="flex gap-4">
                <button className="rounded-full bg-pink-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 hover:bg-pink-600 hover:shadow-pink-500/30 transition-all active:scale-95">
                  Get Recipe
                </button>
                <button className="rounded-full px-8 py-3 text-sm font-bold border border-pink-200 bg-white text-pink-600 hover:bg-pink-50 transition-all active:scale-95">
                  Explore more
                </button>
              </div>
            </div>
            <div className="h-48 w-48 rounded-3xl overflow-hidden shrink-0 shadow-2xl border-4 border-white rotate-3 hover:rotate-0 transition-transform duration-500">
              <img 
                alt="Healthy Salad" 
                className="h-full w-full object-cover" 
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PCOSPrediction;
