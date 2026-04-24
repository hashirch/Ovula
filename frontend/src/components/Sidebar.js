import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, MessageCircle, Calendar, User, Activity, UtensilsCrossed, TrendingUp, LogOut, Plus } from 'lucide-react';
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
    <aside className="w-64 bg-white/70 backdrop-blur-2xl border-r flex flex-col p-6 shrink-0 h-screen sticky top-0 border-pink-50/50">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 shadow-sm border border-pink-100/50">
          <img src="/ovula-logo.png" alt="Ovula Logo" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">Ovula</h1>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 tracking-wide">Your Cycle, Simplified</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active 
                  ? "bg-gradient-to-r from-pink-50 to-pink-100/60 text-slate-800 font-semibold shadow-sm" 
                  : "text-slate-500 hover:bg-pink-50/50 hover:text-slate-700 font-medium"
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] transition-colors duration-200 ${active ? "text-pink-500" : "text-slate-400 group-hover:text-pink-400"}`} />
              <span className="text-[13px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Action Buttons */}
      <div className="mt-auto pt-6 space-y-2.5">
        <Link to="/add-log">
          <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all text-white text-sm bg-gradient-to-r from-pink-500 to-rose-400">
            <Plus className="w-4 h-4" />
            Log Symptoms
          </button>
        </Link>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white/80 border border-slate-200 py-3 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all text-slate-500 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
