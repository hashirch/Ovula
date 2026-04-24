import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, Stethoscope, Calendar, User } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'PCOS', path: '/pcos-prediction', icon: Stethoscope },
    { name: 'Chat', path: '/chat', icon: MessageCircle },
    { name: 'Cycle', path: '/cycle-tracker', icon: Calendar },
    { name: 'Me', path: '/profile', icon: User },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={isActive ? 'active' : ''}
            aria-label={item.name}
          >
            <item.icon strokeWidth={isActive ? 2.5 : 1.8} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
