import React, { useState } from 'react';
import { Lead } from '../types';

interface Props {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: 'web-design' | 'voice-agent') => Promise<void>;
  generatedText: string;
  isGenerating: boolean;
}

export const OutreachModal: React.FC<Props> = ({ lead, isOpen, onClose, onGenerate, generatedText, isGenerating }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'web-design' | 'voice-agent'>('web-design');

  const handleGenerate = (type: 'web-design' | 'voice-agent') => {
    setActiveTab(type);
    onGenerate(type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">AI Outreach Generator</h3>
            <p className="text-sm text-slate-500">Targeting: <span className="font-medium text-slate-700">{lead.name}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-4">
             <button 
                onClick={() => handleGenerate('web-design')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${activeTab === 'web-design' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
             >
                Website Offer
             </button>
             <button 
                onClick={() => handleGenerate('voice-agent')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${activeTab === 'voice-agent' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
             >
                Voice Agent Offer
             </button>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 min-h-[200px] border border-slate-200 relative">
             {isGenerating ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-xs text-slate-500 font-medium">Drafting script...</span>
                    </div>
                </div>
             ) : generatedText ? (
                <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {generatedText}
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <p>Select an offer type to generate a pitch.</p>
                </div>
             )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
          <button 
             onClick={() => {navigator.clipboard.writeText(generatedText); alert("Copied!");}}
             disabled={!generatedText}
             className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
             Copy Script
          </button>
        </div>
      </div>
    </div>
  );
};