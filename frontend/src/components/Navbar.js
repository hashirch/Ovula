import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Heart, MessageCircle, Calendar, BarChart3, Plus, History } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  if (!user) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-800">PCOS Tracker</span>
            </Link>
            <div className="flex space-x-4">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">PCOS Tracker</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'nav-link-active' : 'nav-link'}
            >
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Dashboard
            </Link>
            <Link 
              to="/add-log" 
              className={isActive('/add-log') ? 'nav-link-active' : 'nav-link'}
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Add Log
            </Link>
            <Link 
              to="/logs" 
              className={isActive('/logs') ? 'nav-link-active' : 'nav-link'}
            >
              <History className="h-4 w-4 inline mr-1" />
              History
            </Link>
            <Link 
              to="/cycle-tracker" 
              className={isActive('/cycle-tracker') ? 'nav-link-active' : 'nav-link'}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Cycle
            </Link>
            <Link 
              to="/insights" 
              className={isActive('/insights') ? 'nav-link-active' : 'nav-link'}
            >
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Insights
            </Link>
            <Link 
              to="/chat" 
              className={isActive('/chat') ? 'nav-link-active' : 'nav-link'}
            >
              <MessageCircle className="h-4 w-4 inline mr-1" />
              AI Chat
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Hello, {user.name}</span>
            <button 
              onClick={logout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            <Link 
              to="/dashboard" 
              className={`text-xs px-2 py-1 rounded ${isActive('/dashboard') ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/add-log" 
              className={`text-xs px-2 py-1 rounded ${isActive('/add-log') ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
            >
              Add Log
            </Link>
            <Link 
              to="/logs" 
              className={`text-xs px-2 py-1 rounded ${isActive('/logs') ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
            >
              History
            </Link>
            <Link 
              to="/cycle-tracker" 
              className={`text-xs px-2 py-1 rounded ${isActive('/cycle-tracker') ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
            >
              Cycle
            </Link>
            <Link 
              to="/insights" 
              className={`text-xs px-2 py-1 rounded ${isActive('/insights') ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
            >
              Insights
            </Link>
            <Link 
              to="/chat" 
              className={`text-xs px-2 py-1 rounded ${isActive('/chat') ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
            >
              AI Chat
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;