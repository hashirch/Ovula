import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Lightbulb, Activity, AlertTriangle } from 'lucide-react';

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
        axios.get('/logs/?limit=30') // Last 30 days for charts
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
    if (value >= thresholds.high) return { level: 'high', color: 'red' };
    if (value >= thresholds.medium) return { level: 'medium', color: 'yellow' };
    return { level: 'low', color: 'green' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!insights || insights.total_logs === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Insights Available</h2>
        <p className="text-gray-600 mb-4">Start logging your daily symptoms to get personalized insights</p>
        <a href="/add-log" className="btn-primary">Add Your First Log</a>
      </div>
    );
  }

  const chartData = prepareChartData();
  const periodData = preparePeriodData();
  
  const moodInsight = getInsightLevel(insights.avg_mood, { high: 4, medium: 3 });
  const sleepInsight = getInsightLevel(insights.avg_sleep, { high: 8, medium: 7 });
  const painInsight = getInsightLevel(insights.avg_pain, { high: 3, medium: 2 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-6 w-6 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Insights & Analytics</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{insights.total_logs}</p>
            </div>
            <Activity className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Mood</p>
              <p className="text-2xl font-bold text-gray-900">{insights.avg_mood}/5</p>
              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 bg-${moodInsight.color}-100 text-${moodInsight.color}-800`}>
                {moodInsight.level}
              </div>
            </div>
            <div className="text-2xl">
              {insights.avg_mood >= 4 ? '😊' : insights.avg_mood >= 3 ? '😐' : '😞'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Sleep</p>
              <p className="text-2xl font-bold text-gray-900">{insights.avg_sleep}h</p>
              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 bg-${sleepInsight.color}-100 text-${sleepInsight.color}-800`}>
                {sleepInsight.level}
              </div>
            </div>
            <div className="text-2xl">🌙</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Pain</p>
              <p className="text-2xl font-bold text-gray-900">{insights.avg_pain}/5</p>
              <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 bg-${painInsight.color}-100 text-${painInsight.color}-800`}>
                {painInsight.level}
              </div>
            </div>
            <div className="text-2xl">
              {insights.avg_pain >= 3 ? '😣' : insights.avg_pain >= 1 ? '😐' : '😌'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood & Sleep Trends</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} name="Mood" />
                <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} name="Sleep (hours)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Levels</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pain" fill="#ef4444" name="Pain" />
                <Bar dataKey="acne" fill="#f59e0b" name="Acne" />
                <Bar dataKey="hairfall" fill="#8b5cf6" name="Hair Fall" />
                <Bar dataKey="cravings" fill="#10b981" name="Cravings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Period Distribution */}
      {periodData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Status Distribution</h3>
          <div className="flex flex-col lg:flex-row items-center">
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
            <div className="w-full lg:w-1/2 space-y-2">
              {periodData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {item.name}: {item.value} days ({((item.value / insights.total_logs) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
        </div>
        
        <div className="space-y-3">
          {insights.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Health Alerts */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Health Alerts</h3>
        </div>
        
        <div className="space-y-3">
          {insights.avg_pain > 3 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>High Pain Levels:</strong> Your average pain level is {insights.avg_pain}/5. 
                Consider consulting your healthcare provider if pain persists.
              </p>
            </div>
          )}
          
          {insights.avg_sleep < 6 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Insufficient Sleep:</strong> You're averaging {insights.avg_sleep} hours of sleep. 
                Aim for 7-9 hours for better PCOS management.
              </p>
            </div>
          )}
          
          {insights.avg_mood < 2.5 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Low Mood Pattern:</strong> Your mood has been consistently low. 
                Consider speaking with a mental health professional.
              </p>
            </div>
          )}
          
          {insights.period_frequency === 0 && insights.total_logs > 30 && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>No Period Recorded:</strong> You haven't logged any periods in the last month. 
                This could be normal for PCOS, but consider consulting your healthcare provider.
              </p>
            </div>
          )}
          
          {insights.avg_pain < 1 && insights.avg_mood > 4 && insights.avg_sleep > 7 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Great Progress:</strong> Your symptoms are well-managed! 
                Keep up the good work with your current routine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;