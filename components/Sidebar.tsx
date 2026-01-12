
import React from 'react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  user: User | null;
  onOpenRegisterModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onOpenRegisterModal }) => {
  const menuItems = [
    { id: 'dashboard' as View, icon: 'fa-chart-pie', label: 'Admin Panel' },
    { id: 'catalog' as View, icon: 'fa-book-open', label: 'Master Catalog' },
    { id: 'loans' as View, icon: 'fa-hand-holding', label: 'Lending Queue' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8 flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fas fa-book-medical text-xl"></i>
        </div>
        <span className="text-xl font-bold tracking-tight">LuminaLib</span>
      </div>

      <nav className="flex-1 px-4 mt-4">
        <div className="mb-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Library Operations
        </div>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <i className={`fas ${item.icon} w-5 text-sm`}></i>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            </li>
          ))}
          <li className="pt-2 px-2">
            <button 
              onClick={onOpenRegisterModal}
              className="w-full px-4 py-3 bg-[#0088cc] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-[#0077bb] transition-all flex items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                <i className="fas fa-plus text-[8px]"></i>
              </div>
              Register Book
            </button>
          </li>
        </ul>
      </nav>

      <div className="p-6 mt-auto border-t border-slate-800/50">
        <button 
          onClick={() => setView('profile')}
          className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all ${
            currentView === 'profile' ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-800/50'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-xs font-bold overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'L'
            )}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold truncate max-w-[120px]">{user?.name || 'Staff Access'}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'Terminal #01'}</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
