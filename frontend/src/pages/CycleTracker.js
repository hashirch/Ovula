import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const CycleTracker = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycleStats, setCycleStats] = useState(null);

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

    // Sort by date
    periodLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Find cycle starts (first day of each period)
    const cycleStarts = [];
    let currentPeriodStart = null;
    
    periodLogs.forEach(log => {
      const logDate = new Date(log.date);
      
      if (!currentPeriodStart) {
        currentPeriodStart = logDate;
        cycleStarts.push(logDate);
      } else {
        const daysDiff = (logDate - currentPeriodStart) / (1000 * 60 * 60 * 24);
        if (daysDiff > 7) { // New cycle if more than 7 days gap
          currentPeriodStart = logDate;
          cycleStarts.push(logDate);
        }
      }
    });

    // Calculate average cycle length
    let avgCycleLength = null;
    if (cycleStarts.length > 1) {
      const cycleLengths = [];
      for (let i = 1; i < cycleStarts.length; i++) {
        const length = (cycleStarts[i] - cycleStarts[i - 1]) / (1000 * 60 * 60 * 24);
        cycleLengths.push(length);
      }
      avgCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
    }

    // Predict next period
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
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find log for this date
      const dayLog = logs.find(log => log.date.split('T')[0] === dateString);
      
      calendar.push({
        day,
        date,
        log: dayLog,
        isToday: date.toDateString() === today.toDateString(),
        isPredictedPeriod: cycleStats?.nextPredicted && 
          Math.abs(date - cycleStats.nextPredicted) < (7 * 24 * 60 * 60 * 1000) // Within 7 days
      });
    }

    return calendar;
  };

  const getDayClass = (dayData) => {
    if (!dayData) return '';
    
    let classes = 'w-10 h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer ';
    
    if (dayData.isToday) {
      classes += 'ring-2 ring-primary-500 ';
    }
    
    if (dayData.log?.period_status === 'period') {
      classes += 'bg-red-500 text-white ';
    } else if (dayData.log?.period_status === 'spotting') {
      classes += 'bg-orange-300 text-white ';
    } else if (dayData.isPredictedPeriod) {
      classes += 'bg-pink-200 text-pink-800 border border-pink-400 ';
    } else if (dayData.log) {
      classes += 'bg-blue-100 text-blue-800 ';
    } else {
      classes += 'hover:bg-gray-100 ';
    }
    
    return classes;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const calendar = generateCalendar();
  const daysUntilNext = getDaysUntilNext();
  const daysSinceLast = getDaysSinceLast();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Cycle Tracker</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Period</p>
              <p className="text-lg font-bold text-gray-900">
                {cycleStats?.lastPeriod 
                  ? `${daysSinceLast} days ago`
                  : 'No data'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Next Predicted</p>
              <p className="text-lg font-bold text-gray-900">
                {daysUntilNext !== null 
                  ? daysUntilNext > 0 
                    ? `In ${daysUntilNext} days`
                    : daysUntilNext === 0 
                      ? 'Today'
                      : `${Math.abs(daysUntilNext)} days overdue`
                  : 'Unknown'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Cycle</p>
              <p className="text-lg font-bold text-gray-900">
                {cycleStats?.avgCycleLength 
                  ? `${cycleStats.avgCycleLength} days`
                  : 'Calculating...'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Periods</p>
              <p className="text-lg font-bold text-gray-900">
                {cycleStats?.totalPeriods || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Period</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-300 rounded"></div>
              <span>Spotting</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-pink-200 border border-pink-400 rounded"></div>
              <span>Predicted</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span>Logged</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 ring-2 ring-primary-500 rounded"></div>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendar.map((dayData, index) => (
            <div key={index} className="p-1">
              {dayData ? (
                <div 
                  className={getDayClass(dayData)}
                  title={dayData.log ? `Mood: ${dayData.log.mood}/5, Pain: ${dayData.log.pain_level}/5` : ''}
                >
                  {dayData.day}
                </div>
              ) : (
                <div className="w-10 h-10"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cycle Insights</h3>
        <div className="space-y-3 text-sm text-gray-600">
          {cycleStats?.avgCycleLength ? (
            <>
              <p>
                • Your average cycle length is <strong>{cycleStats.avgCycleLength} days</strong>
                {cycleStats.avgCycleLength < 21 && ' (shorter than typical)'}
                {cycleStats.avgCycleLength > 35 && ' (longer than typical)'}
              </p>
              {daysUntilNext !== null && (
                <p>
                  • Your next period is predicted 
                  {daysUntilNext > 0 && ` in ${daysUntilNext} days`}
                  {daysUntilNext === 0 && ' today'}
                  {daysUntilNext < 0 && ` to be ${Math.abs(daysUntilNext)} days overdue`}
                </p>
              )}
            </>
          ) : (
            <p>• Track more periods to get personalized cycle insights and predictions</p>
          )}
          <p>• Regular tracking helps identify patterns and irregularities in your cycle</p>
          <p>• PCOS can cause irregular periods - consult your healthcare provider if you notice significant changes</p>
        </div>
      </div>
    </div>
  );
};

export default CycleTracker;