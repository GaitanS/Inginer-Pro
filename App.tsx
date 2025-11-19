import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { DashboardView } from './components/views/DashboardView';
import { BomView, PfmeaView, EquipmentView, CapacityView, GenericDocView } from './components/views/TechnicalViews';
import { ViewType, Language } from './types';
import { TRANSLATIONS } from './translations';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [language, setLanguage] = useState<Language>('en');

  const t = TRANSLATIONS[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ro' : 'en');
  };

  // Render the central content based on the active view
  const renderContent = () => {
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <DashboardView language={language} />;
      case ViewType.BOM:
        return <BomView language={language} />;
      case ViewType.PFMEA:
        return <PfmeaView language={language} />;
      case ViewType.EQUIPMENT:
        return <EquipmentView language={language} />;
      case ViewType.CAPACITY:
        return <CapacityView language={language} />;
      case ViewType.CALENDAR:
        return <GenericDocView title={t[ViewType.CALENDAR]} language={language} />;
      case ViewType.STATUS:
        return <GenericDocView title={t[ViewType.STATUS]} language={language} />;
      case ViewType.TEAM:
        return <GenericDocView title={t[ViewType.TEAM]} language={language} />;
      case ViewType.WORK_INSTRUCTIONS:
        return <GenericDocView title={t[ViewType.WORK_INSTRUCTIONS]} language={language} />;
      case ViewType.DOCUMENTATION:
        return <GenericDocView title={t[ViewType.DOCUMENTATION]} language={language} />;
      case ViewType.PROCESS_FLOW:
        return <GenericDocView title={t[ViewType.PROCESS_FLOW]} language={language} />;
      case ViewType.CAPABILITIES:
        return <GenericDocView title={t[ViewType.CAPABILITIES]} language={language} />;
      case ViewType.MSA:
        return <GenericDocView title={t[ViewType.MSA]} language={language} />;
      case ViewType.FAILURE_CODES:
        return <GenericDocView title={t[ViewType.FAILURE_CODES]} language={language} />;
      case ViewType.EOLT:
        return <GenericDocView title={t[ViewType.EOLT]} language={language} />;
      default:
        return <div className="p-8 text-center text-gray-500">{t.viewUnderConstruction}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      {/* Left Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        currentUser="Alex Engineer"
        language={language}
        onToggleLanguage={toggleLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        {/* Top Bar / Breadcrumb area */}
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 shadow-sm flex-shrink-0">
           <h1 className="text-lg font-semibold text-gray-800">
             {t[activeView]}
           </h1>
           <div className="ml-auto flex items-center space-x-4">
             <span className="h-2 w-2 bg-green-500 rounded-full"></span>
             <span className="text-xs text-gray-500">{t.systemOnline}</span>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>

      {/* Right Sidebar (Guides) */}
      <RightPanel activeView={activeView} language={language} />
    </div>
  );
};

export default App;