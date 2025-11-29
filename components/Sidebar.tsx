import React from 'react';
import { View } from '../types';

interface Props {
  activeView: View;
  onNavigate: (view: View) => void;
  taskCount?: number;
}

export const Sidebar: React.FC<Props> = ({ activeView, onNavigate, taskCount = 0 }) => {
  const getLinkClass = (view: View) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer w-full text-left justify-between";
    if (activeView === view) {
      return `${baseClass} bg-blue-600 text-white font-medium shadow-lg shadow-blue-900/50 hover:bg-blue-500`;
    }
    return `${baseClass} text-slate-300 hover:bg-slate-800`;
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen flex-shrink-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-500 text-2xl">⚡</span>
            G-Fast AI
        </h1>
        <p className="text-xs text-slate-400 mt-1">Maps Extractor v2.5</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <button onClick={() => onNavigate('dashboard')} className={getLinkClass('dashboard')}>
            <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Dashboard
            </div>
        </button>
        <button onClick={() => onNavigate('leads')} className={getLinkClass('leads')}>
            <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                My Leads
            </div>
        </button>
        <button onClick={() => onNavigate('tasks')} className={getLinkClass('tasks')}>
            <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 0116 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6" /></svg>
                Tasks
            </div>
            {taskCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {taskCount}
                </span>
            )}
        </button>
        <button onClick={() => onNavigate('settings')} className={getLinkClass('settings')}>
            <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
            </div>
        </button>
      </nav>

      <div className="p-4 bg-slate-800 m-4 rounded-xl">
        <p className="text-xs text-slate-400 mb-2">Usage Credits</p>
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-blue-500 h-full w-3/4"></div>
        </div>
        <p className="text-xs text-white flex justify-between">
            <span>750 used</span>
            <span>1000 total</span>
        </p>
      </div>
    </div>
  );
};