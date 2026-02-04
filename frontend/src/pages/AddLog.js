import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Calendar } from 'lucide-react';

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
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to save log';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Add Daily Log</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Period Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period Status
            </label>
            <select
              name="period_status"
              value={formData.period_status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="none">None</option>
              <option value="spotting">Spotting</option>
              <option value="period">Period</option>
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mood (1-5 scale)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                name="mood"
                min="1"
                max="5"
                value={formData.mood}
                onChange={handleChange}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-8">
                {formData.mood}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Very Low</span>
              <span>Low</span>
              <span>Neutral</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Acne */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acne Level (0-5 scale)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                name="acne"
                min="0"
                max="5"
                value={formData.acne}
                onChange={handleChange}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-8">
                {formData.acne}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Hair Fall */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hair Fall Level (0-5 scale)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                name="hairfall"
                min="0"
                max="5"
                value={formData.hairfall}
                onChange={handleChange}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-8">
                {formData.hairfall}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg) - Optional
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="input-field"
              placeholder="Enter your weight"
            />
          </div>

          {/* Sleep Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="input-field"
              placeholder="Hours of sleep"
            />
          </div>

          {/* Cravings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cravings Level (0-5 scale)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                name="cravings"
                min="0"
                max="5"
                value={formData.cravings}
                onChange={handleChange}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-8">
                {formData.cravings}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Strong</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Pain Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pain Level (0-5 scale)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                name="pain_level"
                min="0"
                max="5"
                value={formData.pain_level}
                onChange={handleChange}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-8">
                {formData.pain_level}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>None</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
              <span>Extreme</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes - Optional
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="input-field"
              placeholder="Any additional notes about your day..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Log'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLog;