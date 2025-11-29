import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ScraperForm } from './components/ScraperForm';
import { StatsCard } from './components/StatsCard';
import { ResultsTable } from './components/ResultsTable';
import { OutreachModal } from './components/OutreachModal';
import { TasksView } from './components/TasksView';
import { Lead, ScrapeStats, ScrapeStatus, View, Task } from './types';
import { searchLeads, generateOutreachScript } from './services/gemini';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [status, setStatus] = useState<ScrapeStatus>(ScrapeStatus.IDLE);
  
  // State for scraped results (ephemeral)
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // State for saved leads (persistent)
  const [savedLeads, setSavedLeads] = useState<Lead[]>(() => {
    try {
        const saved = localStorage.getItem('gfast_leads');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // State for tasks (persistent)
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
        const saved = localStorage.getItem('gfast_tasks');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [stats, setStats] = useState<ScrapeStats>({
    totalLeads: 0,
    emailsFound: 0,
    phonesFound: 0,
    websitesFound: 0,
  });

  // Outreach Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('gfast_leads', JSON.stringify(savedLeads));
  }, [savedLeads]);

  useEffect(() => {
    localStorage.setItem('gfast_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Stats Effect
  useEffect(() => {
    const targetLeads = currentView === 'leads' ? savedLeads : leads;
    setStats({
      totalLeads: targetLeads.length,
      emailsFound: targetLeads.filter(l => l.website !== 'N/A').length * 0.4, // Estimate
      phonesFound: targetLeads.filter(l => l.phone !== 'N/A').length,
      websitesFound: targetLeads.filter(l => l.website !== 'N/A').length,
    });
  }, [leads, savedLeads, currentView]);

  // Handle Search
  const handleStartScrape = async (keywords: string, location: string) => {
    setStatus(ScrapeStatus.SCRAPING);
    setLeads([]); 
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const result = await searchLeads(keywords, location);
      
      const markedLeads = result.leads.map(l => {
         const isSaved = savedLeads.some(sl => sl.name === l.name && sl.address === l.address);
         return isSaved ? { ...l, isSaved: true } : l;
      });

      if (markedLeads.length > 0) {
        setLeads(markedLeads);
        setStatus(ScrapeStatus.COMPLETED);
      } else {
        setStatus(ScrapeStatus.IDLE);
        alert("No leads found. Try a different query.");
      }
    } catch (error) {
      console.error(error);
      setStatus(ScrapeStatus.ERROR);
      alert("Extraction failed. Please check your API key or try again later.");
    }
  };

  const handleStopScrape = () => {
    setStatus(ScrapeStatus.IDLE);
  };

  // CRM: Save Lead
  const handleSaveLead = (lead: Lead) => {
    if (lead.isSaved) {
        setSavedLeads(prev => prev.filter(l => l.id !== lead.id));
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, isSaved: false } : l));
    } else {
        const leadToSave = { ...lead, isSaved: true };
        setSavedLeads(prev => [...prev, leadToSave]);
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, isSaved: true } : l));
    }
  };

  // CRM: Update Status
  const handleUpdateStatus = (leadId: string, newStatus: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    setSavedLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  // Tasks Logic
  const handleAddTask = (title: string, priority: Task['priority']) => {
    const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        priority,
        completed: false,
        dueDate: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleCreateTaskFromLead = (lead: Lead) => {
    const newTask: Task = {
        id: `task-${Date.now()}`,
        leadId: lead.id,
        leadName: lead.name,
        title: `Follow up with ${lead.name}`,
        priority: 'High',
        completed: false,
        dueDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
    };
    setTasks(prev => [newTask, ...prev]);
    alert(`Task scheduled for ${lead.name}`);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Outreach Logic
  const openOutreachModal = (lead: Lead) => {
    setSelectedLead(lead);
    setGeneratedScript("");
    setIsModalOpen(true);
    const defaultType = (lead.website === 'N/A' || lead.website === '') ? 'web-design' : 'voice-agent';
    handleGenerateScript(lead, defaultType);
  };

  const handleGenerateScript = async (lead: Lead, type: 'web-design' | 'voice-agent') => {
    setIsGeneratingScript(true);
    setGeneratedScript(""); 
    try {
        const script = await generateOutreachScript(lead, type);
        setGeneratedScript(script);
    } catch (e) {
        setGeneratedScript("Error generating script. Please try again.");
    } finally {
        setIsGeneratingScript(false);
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure? This will delete all saved leads and tasks.")) {
        localStorage.removeItem('gfast_leads');
        localStorage.removeItem('gfast_tasks');
        setSavedLeads([]);
        setTasks([]);
        setLeads([]);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Agency Lead Scraper</h1>
                  <p className="text-slate-500">
                      Find businesses without websites or in need of voice agents. 
                      Use the "AI Pitch" tool to generate instant cold call scripts.
                  </p>
              </div>

              <ScraperForm 
                  status={status} 
                  onStart={handleStartScrape} 
                  onStop={handleStopScrape} 
              />

              <StatsCard stats={stats} />

              <ResultsTable 
                leads={leads} 
                onGeneratePitch={openOutreachModal}
                onSaveLead={handleSaveLead}
                onUpdateStatus={handleUpdateStatus}
                onCreateTask={handleCreateTaskFromLead}
                isLibraryView={false}
              />
          </div>
        );
      case 'leads':
        return (
          <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">My Saved Leads</h1>
                  <p className="text-slate-500">
                      Manage your high-value targets. Track status from "New" to "Qualified".
                  </p>
              </div>

              <StatsCard stats={stats} />

              <ResultsTable 
                leads={savedLeads} 
                onGeneratePitch={openOutreachModal}
                onSaveLead={handleSaveLead}
                onUpdateStatus={handleUpdateStatus}
                onCreateTask={handleCreateTaskFromLead}
                isLibraryView={true}
              />
          </div>
        );
      case 'tasks':
        return (
            <TasksView 
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
            />
        );
      case 'settings':
        return (
           <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
              <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Extraction Speed</label>
                   <select className="w-full border border-slate-300 rounded-lg p-2.5">
                     <option>Normal (Recommended)</option>
                     <option>Fast (Lower accuracy)</option>
                     <option>Deep Scan (Slower)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Export Format</label>
                   <div className="flex gap-4">
                     <label className="flex items-center gap-2">
                       <input type="radio" name="format" defaultChecked /> CSV
                     </label>
                     <label className="flex items-center gap-2">
                       <input type="radio" name="format" /> JSON
                     </label>
                     <label className="flex items-center gap-2">
                       <input type="radio" name="format" /> XLSX
                     </label>
                   </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                   <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                     Save Preferences
                   </button>
                   
                   <button onClick={handleClearData} className="text-red-500 text-sm hover:underline">
                     Clear All Data
                   </button>
                </div>
              </div>
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <Sidebar 
        activeView={currentView} 
        onNavigate={setCurrentView} 
        taskCount={tasks.filter(t => !t.completed).length}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-20">
            <h2 className="font-bold text-slate-800 text-lg capitalize">{currentView === 'leads' ? 'My Leads' : currentView}</h2>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                    JD
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
            {renderContent()}
            
            <footer className="mt-12 text-center text-slate-400 text-sm pb-4">
                &copy; {new Date().getFullYear()} G-Fast AI Scraper Clone. All rights reserved. 
                <br />
                <span className="text-xs opacity-75">Data provided via Google Maps Grounding. Verify all leads independently.</span>
            </footer>
        </div>
      </main>

      {selectedLead && (
        <OutreachModal 
            lead={selectedLead}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onGenerate={(type) => handleGenerateScript(selectedLead, type)}
            generatedText={generatedScript}
            isGenerating={isGeneratingScript}
        />
      )}
    </div>
  );
};

export default App;