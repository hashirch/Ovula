import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { History, Filter, Trash2, Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const LogsHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    periodStatus: ''
  });

useEffect(() => {
  fetchLogs();
}, [fetchLogs]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      
      const response = await axios.get(`/logs/?${params.toString()}`);
      let filteredLogs = response.data;
      
      if (filters.periodStatus) {
        filteredLogs = filteredLogs.filter(log => log.period_status === filters.periodStatus);
      }
      
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      periodStatus: ''
    });
  };

  const deleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this log?')) {
      return;
    }

    try {
      await axios.delete(`/logs/${logId}`);
      setLogs(logs.filter(log => log.id !== logId));
      toast.success('Log deleted successfully');
    } catch (error) {
      toast.error('Failed to delete log');
    }
  };

  const getPeriodStatusBadge = (status) => {
    const badges = {
      none: 'bg-slate-100 text-slate-600',
      spotting: 'bg-orange-100 text-orange-600 border-orange-200',
      period: 'bg-red-100 text-red-600 border-red-200'
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badges[status] || badges.none}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMoodEmoji = (mood) => {
    const emojis = ['😢', '😞', '😐', '😊', '😄'];
    return emojis[mood - 1] || '😐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500">
            <History className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Logs History</h1>
        </div>
        <Link to="/add-log" className="rounded-full bg-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 hover:bg-pink-600 hover:shadow-pink-500/30 transition-all active:scale-95 flex items-center gap-2">
          <span>Log Symptoms</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 rounded-3xl mb-8 bg-white/60 border border-white/60">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-bold text-slate-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 bg-white rounded-xl text-sm font-semibold border border-pink-100 text-slate-700 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 bg-white rounded-xl text-sm font-semibold border border-pink-100 text-slate-700 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
              Period Status
            </label>
            <select
              name="periodStatus"
              value={filters.periodStatus}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 bg-white rounded-xl text-sm font-semibold border border-pink-100 text-slate-700 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
            >
              <option value="">All</option>
              <option value="none">None</option>
              <option value="spotting">Spotting</option>
              <option value="period">Period</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-bold border border-pink-200 bg-white text-pink-600 hover:bg-pink-50 transition-all active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Display */}
      <div className="glass-card p-8 rounded-3xl bg-white/60 border border-white/60">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">
            Your Logs ({logs.length} entries)
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-20">
            <div className="size-32 rounded-[2.5rem] bg-pink-50/80 flex items-center justify-center text-pink-300 mx-auto mb-8 shadow-inner border border-white">
              <History className="w-16 h-16" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">No logs found</h2>
            <p className="text-slate-500 mb-8 text-lg">Start tracking your symptoms to see your history here</p>
            <Link to="/add-log" className="rounded-full bg-pink-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-pink-500/20 hover:bg-pink-600 hover:shadow-pink-500/30 hover:-translate-y-1 transition-all active:scale-95 inline-flex items-center">
              Add First Log
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="p-6 bg-white rounded-2xl border border-pink-100 hover:shadow-lg hover:shadow-pink-500/10 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {new Date(log.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getPeriodStatusBadge(log.period_status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMoodEmoji(log.mood)}</span>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mood</p>
                        <p className="text-sm font-bold text-slate-700">{log.mood}/5</p>
                      </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sleep</p>
                      <p className="text-sm font-bold text-slate-700">{log.sleep_hours ? `${log.sleep_hours}h` : 'N/A'}</p>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pain</p>
                      <p className="text-sm font-bold text-slate-700">{log.pain_level}/5</p>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div className="flex flex-wrap gap-2">
                      {log.acne > 0 && (
                        <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-full border border-yellow-100">
                          Acne: {log.acne}
                        </span>
                      )}
                      {log.hairfall > 0 && (
                        <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full border border-purple-100">
                          Hair: {log.hairfall}
                        </span>
                      )}
                      {log.cravings > 0 && (
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100">
                          Cravings: {log.cravings}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => deleteLog(log.id)}
                      className="size-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {log.notes && (
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-slate-600">{log.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsHistory;
