import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Activity, AlertCircle, CheckCircle, TrendingUp, Save, RefreshCw } from 'lucide-react';

const PCOSPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    age_group: '',
    typical_period_length: '',
    typical_cycle_length: '',
    is_overweight: 0,
    has_weight_fluctuation: 0,
    has_irregular_periods: 0,
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
    checkExistingProfile();
    fetchLatestPrediction();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const response = await axios.get('/prediction/health-profile');
      setFormData(response.data);
      setHasProfile(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setHasProfile(false);
        setShowForm(true);
      }
    }
  };

  const fetchLatestPrediction = async () => {
    try {
      const response = await axios.get('/prediction/predictions/latest');
      setPrediction(response.data);
    } catch (error) {
      // No predictions yet
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/prediction/health-profile', formData);
      toast.success('Health profile saved successfully!');
      setHasProfile(true);
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save health profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!hasProfile) {
      toast.error('Please create your health profile first');
      setShowForm(true);
      return;
    }

    setPredicting(true);
    try {
      const response = await axios.post('/prediction/predict');
      setPrediction(response.data);
      toast.success('Prediction completed!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  const ageGroups = [
    { value: 1, label: 'Under 18' },
    { value: 2, label: '18-25' },
    { value: 3, label: '26-30' },
    { value: 4, label: '31-35' },
    { value: 5, label: '36-40' },
    { value: 6, label: '41-45' },
    { value: 7, label: '45+' }
  ];

  const getRiskColor = (score) => {
    if (score < 0.3) return 'text-green-600 bg-green-100';
    if (score < 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskLevel = (score) => {
    if (score < 0.3) return 'Low Risk';
    if (score < 0.7) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PCOS Risk Assessment</h1>
          <p className="text-gray-600">AI-powered prediction based on your health profile</p>
        </div>
        {hasProfile && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Update Profile</span>
          </button>
        )}
      </div>

      {/* Prediction Result */}
      {prediction && !showForm && (
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              {prediction.prediction === 'PCOS' ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{prediction.prediction}</h2>
                <p className="text-gray-600">
                  Assessed on {new Date(prediction.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={handlePredict}
              disabled={predicting}
              className="btn-primary flex items-center space-x-2"
            >
              {predicting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  <span>Re-assess</span>
                </>
              )}
            </button>
          </div>

          {/* Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Risk Score</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-900">
                  {(prediction.risk_score * 100).toFixed(1)}%
                </p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(prediction.risk_score)}`}>
                  {getRiskLevel(prediction.risk_score)}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    prediction.risk_score < 0.3 ? 'bg-green-600' :
                    prediction.risk_score < 0.7 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${prediction.risk_score * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Model Confidence</p>
              <p className="text-3xl font-bold text-gray-900">
                {(prediction.confidence * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Based on Decision Tree ML model trained on 267 cases
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
              Personalized Recommendations
            </h3>
            <div className="space-y-2">
              {prediction.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 mr-2 mt-0.5">•</span>
                  <p className="text-gray-700 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> This is an AI-powered assessment tool and not a medical diagnosis. 
              Please consult with a qualified healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      )}

      {/* Health Profile Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {hasProfile ? 'Update Health Profile' : 'Create Health Profile'}
            </h2>
            {hasProfile && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Demographics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Group *
                  </label>
                  <select
                    name="age_group"
                    value={formData.age_group}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select age group</option>
                    {ageGroups.map(group => (
                      <option key={group.value} value={group.value}>{group.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Menstrual History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Menstrual History</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typical Period Length (days)
                  </label>
                  <input
                    type="number"
                    name="typical_period_length"
                    value={formData.typical_period_length}
                    onChange={handleInputChange}
                    min="1"
                    max="15"
                    className="input-field"
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typical Cycle Length (days)
                  </label>
                  <input
                    type="number"
                    name="typical_cycle_length"
                    value={formData.typical_cycle_length}
                    onChange={handleInputChange}
                    min="15"
                    max="60"
                    className="input-field"
                    placeholder="e.g., 28"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Irregular Periods?
                  </label>
                  <select
                    name="has_irregular_periods"
                    value={formData.has_irregular_periods}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Physical Characteristics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Physical Characteristics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overweight?
                  </label>
                  <select
                    name="is_overweight"
                    value={formData.is_overweight}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight Fluctuation?
                  </label>
                  <select
                    name="has_weight_fluctuation"
                    value={formData.has_weight_fluctuation}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Conceiving?
                  </label>
                  <select
                    name="difficulty_conceiving"
                    value={formData.difficulty_conceiving}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hair Growth */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Excess Hair Growth (Hirsutism)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'hair_chin', label: 'Chin' },
                  { name: 'hair_cheeks', label: 'Cheeks' },
                  { name: 'hair_breasts', label: 'Between Breasts' },
                  { name: 'hair_upper_lips', label: 'Upper Lips' },
                  { name: 'hair_arms', label: 'Arms' },
                  { name: 'hair_thighs', label: 'Inner Thighs' }
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Skin Conditions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Skin & Hair Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acne or Skin Tags?
                  </label>
                  <select
                    name="has_acne"
                    value={formData.has_acne}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hair Thinning/Loss?
                  </label>
                  <select
                    name="has_hair_loss"
                    value={formData.has_hair_loss}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dark Patches (Acanthosis)?
                  </label>
                  <select
                    name="has_dark_patches"
                    value={formData.has_dark_patches}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* General Symptoms */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">General Symptoms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Always Tired?
                  </label>
                  <select
                    name="always_tired"
                    value={formData.always_tired}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequent Mood Swings?
                  </label>
                  <select
                    name="frequent_mood_swings"
                    value={formData.frequent_mood_swings}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise (days/week)
                  </label>
                  <input
                    type="number"
                    name="exercise_per_week"
                    value={formData.exercise_per_week}
                    onChange={handleInputChange}
                    min="0"
                    max="7"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eat Outside (days/week)
                  </label>
                  <input
                    type="number"
                    name="eat_outside_per_week"
                    value={formData.eat_outside_per_week}
                    onChange={handleInputChange}
                    min="0"
                    max="7"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consume Canned Food?
                  </label>
                  <select
                    name="consumes_canned_food"
                    value={formData.consumes_canned_food}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
            {hasProfile && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  handlePredict();
                }}
                className="btn-secondary"
              >
                Save & Predict
              </button>
            )}
          </div>
        </form>
      )}

      {/* Call to Action */}
      {!showForm && !prediction && hasProfile && (
        <div className="card text-center">
          <Activity className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready for Assessment</h2>
          <p className="text-gray-600 mb-6">
            Your health profile is complete. Click below to get your PCOS risk assessment.
          </p>
          <button
            onClick={handlePredict}
            disabled={predicting}
            className="btn-primary mx-auto flex items-center space-x-2"
          >
            {predicting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                <span>Get Assessment</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PCOSPrediction;
