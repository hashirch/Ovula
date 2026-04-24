import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, TrendingUp, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const CycleTracker = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycleStats, setCycleStats] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchCycleData();
  }, []);

  const fetchCycleData = async () => {
    try {
      const response = await axios.get('/logs/?limit=90'); // Last 90 days
      const logsData = response.data;
      setLogs(logsData);
      calculateCycleStats(logsData);
    } catch (error) {
      console.error('Error fetching cycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCycleStats = (logsData) => {
    const periodLogs = logsData.filter(log => log.period_status === 'period');
    
    if (periodLogs.length === 0) {
      setCycleStats({
        lastPeriod: null,
        avgCycleLength: null,
        nextPredicted: null,
        totalPeriods: 0
      });
      return;
    }

    periodLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const cycleStarts = [];
    let currentPeriodStart = null;
    
    periodLogs.forEach(log => {
      const logDate = new Date(log.date);
      
      if (!currentPeriodStart) {
        currentPeriodStart = logDate;
        cycleStarts.push(logDate);
      } else {
        const daysDiff = (logDate - currentPeriodStart) / (1000 * 60 * 60 * 24);
        if (daysDiff > 7) {
          currentPeriodStart = logDate;
          cycleStarts.push(logDate);
        }
      }
    });

    let avgCycleLength = null;
    if (cycleStarts.length > 1) {
      const cycleLengths = [];
      for (let i = 1; i < cycleStarts.length; i++) {
        const length = (cycleStarts[i] - cycleStarts[i - 1]) / (1000 * 60 * 60 * 24);
        cycleLengths.push(length);
      }
      avgCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
    }

    let nextPredicted = null;
    if (cycleStarts.length > 0 && avgCycleLength) {
      const lastPeriod = cycleStarts[cycleStarts.length - 1];
      nextPredicted = new Date(lastPeriod.getTime() + (avgCycleLength * 24 * 60 * 60 * 1000));
    }

    setCycleStats({
      lastPeriod: cycleStarts[cycleStarts.length - 1],
      avgCycleLength,
      nextPredicted,
      totalPeriods: cycleStarts.length
    });
  };

  const getDaysUntilNext = () => {
    if (!cycleStats?.nextPredicted) return null;
    const today = new Date();
    const daysUntil = Math.ceil((cycleStats.nextPredicted - today) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const getDaysSinceLast = () => {
    if (!cycleStats?.lastPeriod) return null;
    const today = new Date();
    const daysSince = Math.floor((today - cycleStats.lastPeriod) / (1000 * 60 * 60 * 24));
    return daysSince;
  };

  const generateCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }
    
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      const dayLog = logs.find(log => log.date.split('T')[0] === dateString);
      
      calendar.push({
        day,
        date,
        log: dayLog,
        isToday: date.toDateString() === today.toDateString(),
        isPredictedPeriod: cycleStats?.nextPredicted && 
          Math.abs(date - cycleStats.nextPredicted) < (7 * 24 * 60 * 60 * 1000)
      });
    }

    return calendar;
  };

  const getDayClass = (dayData) => {
    if (!dayData) return '';
    
    let classes = 'size-12 flex items-center justify-center text-sm font-bold rounded-xl cursor-pointer transition-all ';
    
    if (dayData.log?.period_status === 'period') {
      classes += 'bg-red-500 text-white shadow-lg shadow-red-500/20 ';
    } else if (dayData.log?.period_status === 'spotting') {
      classes += 'bg-orange-400 text-white shadow-lg shadow-orange-400/20 ';
    } else if (dayData.isPredictedPeriod) {
      classes += 'bg-pink-200 text-pink-700 border-2 border-pink-400 ';
    } else if (dayData.log) {
      classes += 'bg-blue-100 text-blue-700 border border-blue-200 ';
    } else {
      classes += 'hover:bg-pink-50 text-slate-600 ';
    }
    
    if (dayData.isToday) {
      classes += 'ring-2 ring-pink-500 ring-offset-2 ';
    }
    
    return classes;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const calendar = generateCalendar();
  const daysUntilNext = getDaysUntilNext();
  const daysSinceLast = getDaysSinceLast();

  return (
    <div className="p-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500">
          <Calendar className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Cycle Calendar</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-3xl bg-white/60 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Last Period</p>
              <p className="text-2xl font-bold text-slate-800">
                {cycleStats?.lastPeriod 
                  ? `${daysSinceLast} days ago`
                  : 'No data'
                }
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl bg-white/60 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Next Predicted</p>
              <p className="text-2xl font-bold text-slate-800">
                {daysUntilNext !== null 
                  ? daysUntilNext > 0 
                    ? `In ${daysUntilNext} days`
                    : daysUntilNext === 0 
                      ? 'Today'
                      : `${Math.abs(daysUntilNext)}d overdue`
                  : 'Unknown'
                }
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl bg-white/60 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Avg Cycle</p>
              <p className="text-2xl font-bold text-slate-800">
                {cycleStats?.avgCycleLength 
                  ? `${cycleStats.avgCycleLength} days`
                  : 'Calculating...'
                }
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-500">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl bg-white/60 border border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Periods</p>
              <p className="text-2xl font-bold text-slate-800">
                {cycleStats?.totalPeriods || 0}
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-500">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="glass-card p-8 rounded-3xl bg-white/60 border border-white/60">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="size-10 rounded-xl bg-white border border-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="size-10 rounded-xl bg-white border border-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm mb-6 pb-6 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <div className="size-4 bg-red-500 rounded-md shadow-sm"></div>
            <span className="text-slate-600 font-medium">Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 bg-orange-400 rounded-md shadow-sm"></div>
            <span className="text-slate-600 font-medium">Spotting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 bg-pink-200 border-2 border-pink-400 rounded-md"></div>
            <span className="text-slate-600 font-medium">Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 bg-blue-100 border border-blue-200 rounded-md"></div>
            <span className="text-slate-600 font-medium">Logged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 ring-2 ring-pink-500 rounded-md"></div>
            <span className="text-slate-600 font-medium">Today</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
          
          {calendar.map((dayData, index) => (
            <div key={index} className="flex justify-center">
              {dayData ? (
                <div 
                  className={getDayClass(dayData)}
                  title={dayData.log ? `Mood: ${dayData.log.mood}/5, Pain: ${dayData.log.pain_level}/5` : ''}
                >
                  {dayData.day}
                </div>
              ) : (
                <div className="size-12"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card p-8 rounded-3xl mt-8 bg-white/60 border border-white/60">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Cycle Insights</h3>
        <div className="space-y-3 text-sm text-slate-600">
          {cycleStats?.avgCycleLength ? (
            <>
              <p className="flex items-start gap-2">
                <span className="text-pink-500 mt-0.5">•</span>
                <span>Your average cycle length is <strong className="text-slate-800">{cycleStats.avgCycleLength} days</strong>
                {cycleStats.avgCycleLength < 21 && ' (shorter than typical)'}
                {cycleStats.avgCycleLength > 35 && ' (longer than typical)'}</span>
              </p>
              {daysUntilNext !== null && (
                <p className="flex items-start gap-2">
                  <span className="text-pink-500 mt-0.5">•</span>
                  <span>Your next period is predicted 
                  {daysUntilNext > 0 && ` in ${daysUntilNext} days`}
                  {daysUntilNext === 0 && ' today'}
                  {daysUntilNext < 0 && ` to be ${Math.abs(daysUntilNext)} days overdue`}</span>
                </p>
              )}
            </>
          ) : (
            <p className="flex items-start gap-2">
              <span className="text-pink-500 mt-0.5">•</span>
              <span>Track more periods to get personalized cycle insights and predictions</span>
            </p>
          )}
          <p className="flex items-start gap-2">
            <span className="text-pink-500 mt-0.5">•</span>
            <span>Regular tracking helps identify patterns and irregularities in your cycle</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-pink-500 mt-0.5">•</span>
            <span>PCOS can cause irregular periods - consult your healthcare provider if you notice significant changes</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CycleTracker;
