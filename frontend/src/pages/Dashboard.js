import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, Calendar, MessageCircle, TrendingUp, Activity, Moon, Heart } from 'lucide-react';

const Dashboard = () => {
  const [summaryStats, setSummaryStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryResponse, logsResponse] = await Promise.all([
        axios.get('/insights/summary'),
        axios.get('/logs/latest?days=7')
      ]);
      
      setSummaryStats(summaryResponse.data);
      setRecentLogs(logsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = recentLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: log.mood,
    sleep: log.sleep_hours || 0,
    pain: log.pain_level
  })).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your PCOS journey and get insights</p>
        </div>
        <Link to="/add-log" className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Today's Log</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Activity className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Logs This Week</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats?.logs_this_week || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Heart className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Mood</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats?.avg_mood_week || 0}/5</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Moon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Sleep</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats?.avg_sleep_week || 0}h</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Calendar className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Period Days</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats?.period_days_month || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Mood Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available. Start logging to see trends!</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep & Pain Levels</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sleep" fill="#0ea5e9" name="Sleep (hours)" />
                <Bar dataKey="pain" fill="#f59e0b" name="Pain Level" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available. Start logging to see trends!</p>
          )}
        </div>
      </div>

      {/* Recent Logs & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Logs</h3>
            <Link to="/logs" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(log.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Mood: {log.mood}/5 • Sleep: {log.sleep_hours || 'N/A'}h • Pain: {log.pain_level}/5
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {log.period_status === 'period' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Period</span>
                    )}
                    {log.period_status === 'spotting' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Spotting</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No logs yet. Start tracking your symptoms!</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/add-log" className="w-full btn-primary flex items-center justify-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Daily Log</span>
            </Link>
            
            <Link to="/cycle-tracker" className="w-full btn-secondary flex items-center justify-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Track Cycle</span>
            </Link>
            
            <Link to="/chat" className="w-full btn-secondary flex items-center justify-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Ask AI Assistant</span>
            </Link>
            
            <Link to="/insights" className="w-full btn-secondary flex items-center justify-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>View Insights</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;