import React, { useState } from 'react';
import { ScrapeStatus } from '../types';
import { PlayIcon, SearchIcon } from './Icons';

interface Props {
  status: ScrapeStatus;
  onStart: (keywords: string, location: string) => void;
  onStop: () => void;
}

export const ScraperForm: React.FC<Props> = ({ status, onStart, onStop }) => {
  const [keywords, setKeywords] = useState('Italian Restaurants');
  const [location, setLocation] = useState('New York, NY');

  const isLoading = status === ScrapeStatus.SCRAPING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      onStop();
    } else {
      onStart(keywords, location);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Keywords</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="e.g. Plumbers, Real Estate Agents"
                    required
                />
            </div>
        </div>

        <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Location</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    placeholder="e.g. Chicago, IL"
                    required
                />
            </div>
        </div>

        <button 
            type="submit"
            disabled={isLoading && status === ScrapeStatus.IDLE}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-md active:scale-95 ${
                isLoading 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-200'
            }`}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Stop Extraction
                </>
            ) : (
                <>
                   <PlayIcon className="h-5 w-5" />
                   Start Extraction
                </>
            )}
        </button>
      </div>
      
      {/* Simulation Progress Bar */}
      {isLoading && (
        <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Connecting to Google Maps...</span>
                <span>Processing...</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full animate-progress-indeterminate"></div>
            </div>
            <style>{`
                @keyframes progress-indeterminate {
                    0% { width: 30%; margin-left: -30%; }
                    50% { width: 50%; margin-left: 25%; }
                    100% { width: 30%; margin-left: 100%; }
                }
                .animate-progress-indeterminate {
                    animation: progress-indeterminate 1.5s infinite linear;
                }
            `}</style>
        </div>
      )}
    </form>
  );
};