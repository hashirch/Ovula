import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, MessageCircle, Calendar, User, Activity, UtensilsCrossed, TrendingUp } from 'lucide-react';
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
    <aside className="w-64 bg-white/60 backdrop-blur-xl border-r flex flex-col p-6 shrink-0 h-screen sticky top-0 border-pink-50/50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 flex items-center justify-center">
          <img src="/ovula-logo.png" alt="Ovula Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-none text-slate-900">Ovula</h1>
          <p className="text-[10px] font-medium text-slate-500 mt-1">Your Cycle, Simplified</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active 
                  ? "bg-pink-100/60 text-slate-800 font-medium" 
                  : "text-slate-500 hover:bg-pink-50/50 hover:text-slate-700 font-medium"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-pink-500" : "text-slate-400"}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 space-y-3">
        <Link to="/add-log">
          <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all text-white text-sm ${location.pathname === '/pcos-prediction' ? 'bg-[#1e293b]' : 'bg-[#d88998]'}`}>
            Log Symptoms
          </button>
        </Link>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white border border-[#d88998] py-3 rounded-xl font-semibold hover:bg-slate-50 active:scale-95 transition-all text-slate-700 text-sm"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
