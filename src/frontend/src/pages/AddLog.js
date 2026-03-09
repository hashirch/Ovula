import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Calendar, X } from 'lucide-react';

const AddLog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    period_status: 'none',
    mood: 3,
    acne: 0,
    hairfall: 0,
    weight: '',
    sleep_hours: '',
    cravings: 0,
    pain_level: 0,
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        mood: parseInt(formData.mood),
        acne: parseInt(formData.acne),
        hairfall: parseInt(formData.hairfall),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        sleep_hours: formData.sleep_hours ? parseFloat(formData.sleep_hours) : null,
        cravings: parseInt(formData.cravings),
        pain_level: parseInt(formData.pain_level)
      };

      await axios.post('/logs/', submitData);
      toast.success('Daily log saved successfully!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to save log';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 pb-20 max-w-4xl mx-auto">
      <div className="glass-card p-8 rounded-3xl bg-white/60 border border-white/60">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500">
              <Calendar className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Add Daily Log</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-white rounded-xl text-sm font-semibold border border-pink-100 text-slate-700 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              required
            />
          </div>

          {/* Period Status */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Period Status
            </label>
            <select
              name="period_status"
              value={formData.period_status}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-white rounded-xl text-sm font-semibold border border-pink-100 text-slate-700 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
            >
              <option value="none">None</option>
              <option value="spotting">Spotting</option>
              <option value="period">Period</option>
            </select>
          </div>

          {/* Mood */}
          <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">
              Mood (1-5 scale)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="mood"
                min="1"
                max="5"
                value={formData.mood}
                onChange={handleChange}
                className="flex-1 h-2 bg-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
              />
              <span className="text-2xl font-bold text-pink-600 w-12 text-center">
                {formData.mood}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
              <span>Very Low</span>
              <span>Low</span>
              <span>Neutral</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Acne */}
          <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">
              Acne Level (0-5 scale)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="acne"
                min="0"
                max="5"
                value={formData.acne}
                onChange={handleChange}
                className="flex-1 h-2 bg-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
              />
              <span className="text-2xl font-bold text-pink-600 w-12 text-center">
                {formData.acne}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Hair Fall */}
          <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">
              Hair Fall Level (0-5 scale)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="hairfall"
                min="0"
                max="5"
                value={formData.hairfall}
                onChange={handleChange}
                className="flex-1 h-2 bg-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
              />
              <span className="text-2xl font-bold text-pink-600 w-12 text-center">
                {formData.hairfall}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight */}
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                Weight (kg) - Optional
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-5 py-3.5 bg-white rounded-xl text-sm font-semibold border border-pink-100 text-slate-700 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all placeholder-slate-400"
                placeholder="Enter your weight"
              />
            </div>

            {/* Sleep Hours */}
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                Sleep Hours - Optional
              </label>
              <input
                type="number"
                name="sleep_hours"
                value={formData.sleep_hours}
                onChange={handleChange}
                step="0.5"
                min="0"
                max="24"
                className="w-full px-5 py-3.5 bg-white rounded-xl text-sm font-semibold border border-pink-100 text-slate-700 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all placeholder-slate-400"
                placeholder="Hours of sleep"
              />
            </div>
          </div>

          {/* Cravings */}
          <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">
              Cravings Level (0-5 scale)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="cravings"
                min="0"
                max="5"
                value={formData.cravings}
                onChange={handleChange}
                className="flex-1 h-2 bg-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
              />
              <span className="text-2xl font-bold text-pink-600 w-12 text-center">
                {formData.cravings}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Strong</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Pain Level */}
          <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">
              Pain Level (0-5 scale)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="pain_level"
                min="0"
                max="5"
                value={formData.pain_level}
                onChange={handleChange}
                className="flex-1 h-2 bg-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
              />
              <span className="text-2xl font-bold text-pink-600 w-12 text-center">
                {formData.pain_level}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
              <span>Extreme</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Notes - Optional
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-5 py-3.5 bg-white rounded-xl text-sm font-semibold border border-pink-100 text-slate-700 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all placeholder-slate-400 resize-none"
              placeholder="Any additional notes about your day..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-pink-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-pink-500/20 hover:bg-pink-600 hover:shadow-pink-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Log'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-full px-8 py-4 text-sm font-bold border border-pink-200 bg-white text-pink-600 hover:bg-pink-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLog;