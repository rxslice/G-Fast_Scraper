import React, { useState, useMemo } from 'react';
import { Lead } from '../types';
import { DownloadIcon, GlobeIcon, MapIcon, PhoneIcon, BookmarkIcon, FacebookIcon, InstagramIcon, CalendarIcon } from './Icons';

interface Props {
  leads: Lead[];
  onGeneratePitch: (lead: Lead) => void;
  onSaveLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
  onCreateTask?: (lead: Lead) => void; // New optional prop
  isLibraryView?: boolean;
}

type FilterMode = 'all' | 'no-website' | 'low-rating';

export const ResultsTable: React.FC<Props> = ({ leads, onGeneratePitch, onSaveLead, onUpdateStatus, onCreateTask, isLibraryView = false }) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // Filter Logic
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
        if (filterMode === 'no-website') {
            return lead.website === 'N/A' || lead.website === '';
        }
        if (filterMode === 'low-rating') {
            return lead.rating < 4.0;
        }
        return true;
    });
  }, [leads, filterMode]);

  const exportToCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Name", "Category", "Address", "Phone", "Website", "Socials", "Rating", "Status", "Google Maps URL"];
    const rows = leads.map(l => [
        `"${l.name}"`, 
        `"${l.category}"`, 
        `"${l.address}"`, 
        `"${l.phone}"`, 
        `"${l.website}"`, 
        `"${l.socials?.join(', ')}"` || "",
        l.rating, 
        l.status,
        `"${l.mapUrl || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gfast_leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'Contacted': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'Qualified': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  if (leads.length === 0) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <MapIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-800">
                {isLibraryView ? "No saved leads yet" : "No leads extracted yet"}
            </h3>
            <p className="text-slate-500 max-w-sm mt-2">
                {isLibraryView ? "Save leads from your search results to see them here." : "Enter your target keywords and location above to start the AI extraction engine."}
            </p>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Table Header / Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-4">
        <div className="flex items-center gap-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isLibraryView ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                {isLibraryView ? "Saved Leads" : "Search Results"} ({filteredLeads.length})
            </h3>
            <div className="flex p-1 bg-slate-200 rounded-lg">
                <button 
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterMode === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilterMode('no-website')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${filterMode === 'no-website' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    No Website
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                </button>
                <button 
                    onClick={() => setFilterMode('low-rating')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterMode === 'low-rating' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Needs Reputation
                </button>
            </div>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors">
            <DownloadIcon className="w-4 h-4" />
            Export CSV
        </button>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-10"></th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Business Name</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Contact</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Website</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Rating</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4">
                            <button 
                                onClick={() => onSaveLead(lead)}
                                title={lead.isSaved ? "Saved to My Leads" : "Save Lead"}
                                className={`p-1.5 rounded-full transition-all ${lead.isSaved ? 'text-purple-600 bg-purple-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                            >
                                <BookmarkIcon className="w-5 h-5" filled={lead.isSaved} />
                            </button>
                        </td>
                        <td className="p-4">
                            <div className="font-medium text-slate-900">{lead.name}</div>
                            <div className="text-xs text-slate-500">{lead.category}</div>
                            <div className="flex gap-2 mt-1">
                                {lead.socials?.map((link, i) => (
                                    <a key={i} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600">
                                        {link.includes('facebook') ? <FacebookIcon className="w-3.5 h-3.5" /> : 
                                         link.includes('instagram') ? <InstagramIcon className="w-3.5 h-3.5" /> :
                                         <GlobeIcon className="w-3.5 h-3.5" />}
                                    </a>
                                ))}
                            </div>
                        </td>
                        <td className="p-4">
                             <select 
                                value={lead.status}
                                onChange={(e) => onUpdateStatus(lead.id, e.target.value as any)}
                                className={`text-xs font-medium px-2 py-1 rounded-full border outline-none cursor-pointer appearance-none pr-6 relative ${getStatusColor(lead.status)}`}
                                style={{backgroundImage: 'none'}}
                             >
                                <option value="New">New Lead</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Closed">Closed</option>
                             </select>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col gap-1">
                                {lead.phone && lead.phone !== 'N/A' ? (
                                    <span className="text-sm text-slate-600 flex items-center gap-1.5">
                                        <PhoneIcon className="w-3 h-3 text-slate-400" />
                                        {lead.phone}
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">No Phone</span>
                                )}
                            </div>
                        </td>
                        <td className="p-4 max-w-xs">
                            {lead.website && lead.website !== 'N/A' ? (
                                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate">
                                    <GlobeIcon className="w-3 h-3 flex-shrink-0" />
                                    {lead.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')}
                                </a>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                    Missing Website
                                </span>
                            )}
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-1">
                                <span className={`font-semibold ${lead.rating < 4.0 ? 'text-orange-600' : 'text-slate-700'}`}>{lead.rating}</span>
                                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <span className="text-xs text-slate-400">({lead.reviewCount})</span>
                            </div>
                        </td>
                        <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                                {onCreateTask && (
                                    <button 
                                        onClick={() => onCreateTask(lead)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                        title="Schedule Task"
                                    >
                                        <CalendarIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => onGeneratePitch(lead)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-200 transition-all active:scale-95"
                                >
                                    AI Pitch
                                </button>
                                {lead.mapUrl && (
                                    <a href={lead.mapUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="View on Google Maps">
                                        <MapIcon className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};