import React from 'react';
import { Briefcase, LogOut, Hexagon } from 'lucide-react';
import { Page, User } from '../types';

interface SidebarProps {
  activePage: Page;
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, user, onNavigate, onLogout }) => {
  const navItems = [
    { id: Page.WORKSPACE, label: 'Screening Workspace', icon: Briefcase },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 hidden md:flex z-50">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-primary-600 p-2 rounded-lg">
          <Hexagon className="w-6 h-6 text-white fill-current" />
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">TalentAI</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.company}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;