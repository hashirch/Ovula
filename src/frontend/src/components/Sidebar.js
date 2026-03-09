import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, MessageCircle, Calendar, User, LogOut, PlusCircle, TrendingUp, Activity, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'PCOS Care', path: '/pcos-prediction', icon: Stethoscope },
    { name: 'AI Assistant', path: '/chat', icon: MessageCircle },
    { name: 'Cycle Tracker', path: '/cycle-tracker', icon: Calendar },
    { name: 'Diet & Nutrition', path: '/diet-nutrition', icon: UtensilsCrossed },
    { name: 'Insights', path: '/insights', icon: TrendingUp },
    { name: 'Logs History', path: '/logs-history', icon: Activity },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 glass border-r flex flex-col p-6 shrink-0 h-screen sticky top-0 border-pink-100">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
          <img src="/ovula-logo.png" alt="Ovula Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight leading-none text-slate-900">Ovula</h1>
          <p className="text-xs font-medium text-pink-400">Your Cycle, Simplified</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active 
                  ? "bg-pink-50 text-pink-600 font-semibold shadow-sm" 
                  : "text-slate-500 hover:bg-pink-50/50 hover:text-pink-500"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-pink-500" : "text-slate-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-pink-100 space-y-3">
        <Link to="/add-log">
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-400 py-3 rounded-2xl font-bold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 active:scale-95 transition-all text-white">
            <PlusCircle className="w-5 h-5" />
            Log Symptoms
          </button>
        </Link>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white/40 backdrop-blur-xl border border-white/50 py-3 rounded-2xl font-bold shadow-sm hover:bg-white/60 active:scale-95 transition-all text-slate-600"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
