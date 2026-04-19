import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, TrendingDown, TrendingUp, CheckCircle, Zap, Brain, 
  Download, Search, Bell, Edit, ChevronRight, ChevronLeft, 
  AlertCircle, Info, Clipboard, Heart, Shield, Apple
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

const PCOSPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [healthProfile, setHealthProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
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
    fetchLatestPrediction();
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

  const fetchLatestPrediction = async () => {
    try {
      const response = await axios.get('/prediction/predictions/latest');
      setPrediction(response.data);
    } catch (error) {
      console.log('No previous prediction found');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/prediction/health-profile', profileData);
      setHealthProfile(response.data);
      setShowProfileForm(false);
      toast.success('Health profile updated successfully!');
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
      toast.success('PCOS assessment generated!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to generate assessment';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));

  // Prepare chart data
  const chartData = logs.slice(0, 6).reverse().map(log => ({
    name: new Date(log.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    value: (log.acne + log.hairfall + log.pain_level) * 10
  }));

  return (
    <div className="p-8 pb-24 bg-[#FFF9FA] min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Multi-Step Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] max-w-2xl w-full p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Health Profile</h3>
                <p className="text-slate-400 font-medium text-sm mt-1">Step {activeStep} of 4</p>
              </div>
              <button onClick={() => setShowProfileForm(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
            </div>

            {/* Step Progress Bar */}
            <div className="flex gap-2 mb-10">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= activeStep ? 'bg-pink-500' : 'bg-slate-100'}`} />
              ))}
            </div>
            
            <div className="min-h-[400px]">
              {activeStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clipboard className="w-5 h-5 text-pink-500" /> Basic Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">What is your age group?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Under 20', '20-30', '30-40', 'Over 40'].map((label, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setProfileData({...profileData, age_group: i + 1})}
                            className={`px-4 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${profileData.age_group === i + 1 ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-100 hover:border-pink-200 text-slate-500'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cycle Length (Days)</label>
                        <input type="number" value={profileData.typical_cycle_length} onChange={e => setProfileData({...profileData, typical_cycle_length: parseInt(e.target.value)})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-pink-300 outline-none transition-all font-bold" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Period Length (Days)</label>
                        <input type="number" value={profileData.typical_period_length} onChange={e => setProfileData({...profileData, typical_period_length: parseInt(e.target.value)})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-pink-300 outline-none transition-all font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" /> Key Health Indicators
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: 'has_irregular_periods', label: 'Do you have irregular periods?', icon: '📅' },
                      { key: 'is_overweight', label: 'Do you consider yourself overweight?', icon: '⚖️' },
                      { key: 'has_weight_fluctuation', label: 'Frequent weight fluctuations?', icon: '🔄' },
                      { key: 'difficulty_conceiving', label: 'Any difficulty conceiving?', icon: '👶' },
                      { key: 'always_tired', label: 'Do you feel tired most of the time?', icon: '😴' }
                    ].map(item => (
                      <label key={item.key} className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${profileData[item.key] === 1 ? 'border-pink-500 bg-pink-50' : 'border-slate-50 hover:border-pink-100'}`}>
                        <div className="flex items-center gap-4">
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-bold text-slate-700">{item.label}</span>
                        </div>
                        <input type="checkbox" checked={profileData[item.key] === 1} onChange={e => setProfileData({...profileData, [item.key]: e.target.checked ? 1 : 0})} className="w-6 h-6 rounded-lg border-2 border-slate-200 text-pink-500 focus:ring-pink-200" />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-pink-500" /> Physical Symptoms
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'has_acne', label: 'Skin Acne', icon: '✨' },
                      { key: 'has_hair_loss', label: 'Hair Thinning', icon: '💇' },
                      { key: 'has_dark_patches', label: 'Dark Patches', icon: '🌑' },
                      { key: 'hair_chin', label: 'Chin Hair', icon: '🧔' },
                      { key: 'hair_upper_lips', label: 'Upper Lip Hair', icon: '👄' },
                      { key: 'hair_arms', label: 'Arm Hair', icon: '💪' }
                    ].map(item => (
                      <label key={item.key} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${profileData[item.key] === 1 ? 'border-pink-500 bg-pink-50' : 'border-slate-50 hover:border-pink-100'}`}>
                        <input type="checkbox" checked={profileData[item.key] === 1} onChange={e => setProfileData({...profileData, [item.key]: e.target.checked ? 1 : 0})} className="w-6 h-6 rounded-lg border-2 border-slate-200 text-pink-500 focus:ring-pink-200" />
                        <span className="font-bold text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-pink-500" /> Lifestyle Patterns
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Exercise per week (days)</label>
                      <input type="range" min="0" max="7" value={profileData.exercise_per_week} onChange={e => setProfileData({...profileData, exercise_per_week: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                      <div className="flex justify-between mt-2 text-xs font-bold text-slate-400"><span>0 days</span><span>{profileData.exercise_per_week} days</span><span>7 days</span></div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Eating outside per week (times)</label>
                      <input type="range" min="0" max="14" value={profileData.eat_outside_per_week} onChange={e => setProfileData({...profileData, eat_outside_per_week: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                      <div className="flex justify-between mt-2 text-xs font-bold text-slate-400"><span>0 times</span><span>{profileData.eat_outside_per_week} times</span><span>14+ times</span></div>
                    </div>
                    <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${profileData.consumes_canned_food === 1 ? 'border-pink-500 bg-pink-50' : 'border-slate-50 hover:border-pink-100'}`}>
                      <input type="checkbox" checked={profileData.consumes_canned_food === 1} onChange={e => setProfileData({...profileData, consumes_canned_food: e.target.checked ? 1 : 0})} className="w-6 h-6 rounded-lg border-2 border-slate-200 text-pink-500 focus:ring-pink-200" />
                      <span className="font-bold text-slate-700">Frequent Canned Food Consumption?</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-10">
              {activeStep > 1 && (
                <button onClick={prevStep} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              )}
              {activeStep < 4 ? (
                <button onClick={nextStep} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all">
                  Next Step <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={handleProfileSubmit} disabled={loading} className="flex-1 bg-pink-500 text-white py-4 rounded-2xl font-bold hover:bg-pink-600 shadow-xl shadow-pink-500/20 disabled:opacity-50 transition-all">
                  {loading ? 'Saving...' : 'Finish & Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern Header */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">PCOS Analysis</h2>
          <p className="text-slate-400 font-medium mt-1 uppercase tracking-widest text-[10px]">Medical Grade Intelligence Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 hover:border-pink-200 shadow-sm transition-all text-sm font-bold text-slate-600">
            <Edit className="w-4 h-4 text-pink-500" /> Edit Health Profile
          </button>
          <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-pink-500 border-2 border-white"></span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Dashboard */}
        <div className="lg:col-span-8 space-y-8">
          {/* Risk Gauge Card */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50 relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 h-64 w-64 bg-pink-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="relative h-48 w-56 shrink-0 flex items-end justify-center">
                <svg className="absolute w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="xMidYMax meet">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" stroke="#f1f5f9" strokeWidth="8" fill="transparent" strokeLinecap="round" />
                  <path 
                    className="transition-all duration-1000 ease-out" 
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    stroke={prediction?.risk_color || '#10b981'} 
                    strokeWidth="8" 
                    strokeDasharray="125.6" 
                    strokeDashoffset={prediction ? `${125.6 * (1 - prediction.risk_score / 100)}` : '100'}
                    strokeLinecap="round" 
                    fill="transparent" 
                  />
                </svg>
                <div className="relative flex flex-col items-center justify-end pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Assessment</span>
                  <span className="text-5xl font-black text-slate-800">{prediction ? `${Math.round(prediction.risk_score)}%` : '--'}</span>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Health Assessment</h3>
                    {prediction && (
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: `${prediction.risk_color}15`, color: prediction.risk_color }}>
                        {prediction.risk_level} Risk
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Based on your biological markers and hormonal indicators, our AI has calculated your PCOS probability.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                    <span className="text-sm font-black text-slate-700">{prediction?.prediction || 'Pending Analysis'}</span>
                  </div>
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</span>
                    <span className="text-sm font-black text-slate-700">{prediction ? `${Math.round(prediction.confidence)}%` : '--'}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3"
                >
                  <Brain className="w-5 h-5" /> {loading ? 'Analyzing Data...' : 'Run New AI Prediction'}
                </button>
              </div>
            </div>
          </div>

          {/* Contributing Factors & Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
              <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Key Risk Factors
              </h4>
              <div className="space-y-3">
                {prediction?.contributing_factors?.length > 0 ? (
                  prediction.contributing_factors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <div className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="text-sm font-bold text-amber-800">{factor}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm font-medium italic p-4 text-center">Complete a prediction to see insights.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
              <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center justify-between">
                <span>Symptom Trends</span>
                <TrendingUp className="w-5 h-5 text-pink-500" />
              </h4>
              <div className="h-40 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#a2a9b3" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} dot={{ r: 4, fill: "white", stroke: "#a2a9b3", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">No Log Data</div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations Tabs */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50">
            <h4 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <Shield className="w-7 h-7 text-pink-500" /> Personalized Strategy
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lifestyle */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-500">
                  <Activity className="w-5 h-5" />
                  <span className="font-black text-xs uppercase tracking-widest">Lifestyle</span>
                </div>
                <div className="space-y-2">
                  {(prediction?.recommendations?.lifestyle || ['Track symptoms daily', 'Ensure 8h sleep']).map((rec, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-800 leading-relaxed">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dietary */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Apple className="w-5 h-5" />
                  <span className="font-black text-xs uppercase tracking-widest">Dietary</span>
                </div>
                <div className="space-y-2">
                  {(prediction?.recommendations?.dietary || ['Low GI Foods', 'Increase Fiber']).map((rec, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-800 leading-relaxed">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-500">
                  <Info className="w-5 h-5" />
                  <span className="font-black text-xs uppercase tracking-widest">Medical</span>
                </div>
                <div className="space-y-2">
                  {(prediction?.recommendations?.medical || ['Regular checkups', 'Hormonal profile']).map((rec, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-[11px] font-bold text-rose-800 leading-relaxed">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Logs & Tips */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
            <h4 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Recent Logs</h4>
            <div className="space-y-4">
              {logs.slice(0, 4).map((log, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="h-10 w-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-slate-800">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="text-[10px] font-bold text-slate-400">Mood: {log.mood}/5 • Pain: {log.pain_level}/5</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-center text-slate-300 text-sm py-10 font-bold uppercase tracking-widest">No Logs Yet</p>}
            </div>
            <button className="w-full mt-6 py-4 rounded-2xl border-2 border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-pink-500 hover:border-pink-50 transition-all">View All History</button>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-40 w-40 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-lg bg-pink-500/20 text-pink-400 text-[9px] font-black uppercase tracking-widest mb-4">Daily Wellness</span>
              <h5 className="text-xl font-black text-white mb-3 tracking-tight">Hormone-Friendly Recipe</h5>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                Zinc-rich salad with roasted kale and pumpkin seeds to support your luteal phase.
              </p>
              <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold hover:bg-pink-50 transition-all text-xs">View Recipe</button>
            </div>
          </div>
          
          <div className="bg-pink-500 rounded-[40px] p-8 shadow-lg shadow-pink-500/20 text-white">
            <Download className="w-8 h-8 mb-4 opacity-50" />
            <h5 className="text-xl font-black mb-2 tracking-tight">Health Report</h5>
            <p className="text-pink-100 text-sm font-medium mb-6 opacity-80">Download your comprehensive risk assessment PDF for your doctor.</p>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md py-4 rounded-2xl font-bold transition-all text-xs">Generate PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCOSPrediction;
