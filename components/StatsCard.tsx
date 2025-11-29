import React from 'react';
import { ScrapeStats } from '../types';

export const StatsCard: React.FC<{ stats: ScrapeStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium mb-1">Total Leads</div>
        <div className="text-2xl font-bold text-slate-800">{stats.totalLeads}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium mb-1">Emails Found</div>
        <div className="text-2xl font-bold text-emerald-600">{stats.emailsFound}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium mb-1">Phones Found</div>
        <div className="text-2xl font-bold text-blue-600">{stats.phonesFound}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="text-slate-500 text-sm font-medium mb-1">Websites</div>
        <div className="text-2xl font-bold text-indigo-600">{stats.websitesFound}</div>
      </div>
    </div>
  );
};