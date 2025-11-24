import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { DashboardView } from './components/views/DashboardView';
import { TaskPrioritizationView } from './components/views/TaskPrioritizationView';
import { BomView, PfmeaView, EquipmentView, CapacityView, GenericDocView } from './components/views/TechnicalViews';
import { ViewType, Language, Task } from './types';
import { TRANSLATIONS } from './translations';
import { PROJECTS, INITIAL_TASKS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [language, setLanguage] = useState<Language>('en');
  const [currentProject, setCurrentProject] = useState<string>(PROJECTS[0]);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = TRANSLATIONS[language];

  // Check system preference on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ro' : 'en');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Render the central content based on the active view
  const renderContent = () => {
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <DashboardView language={language} tasks={tasks} isDarkMode={isDarkMode} />;
      case ViewType.TASK_PRIORITIZATION:
        return <TaskPrioritizationView tasks={tasks} onUpdateTasks={setTasks} language={language} />;
      case ViewType.BOM:
        return <BomView language={language} />;
      case ViewType.PFMEA:
        return <PfmeaView language={language} />;
      case ViewType.EQUIPMENT:
        return <EquipmentView language={language} />;
      case ViewType.CAPACITY:
        return <CapacityView language={language} isDarkMode={isDarkMode} />;
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
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400">{t.viewUnderConstruction}</div>;
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-white dark:bg-preh-dark-bg overflow-hidden font-sans text-gray-800 dark:text-gray-100 transition-colors duration-200">
        {/* Left Sidebar */}
        <Sidebar 
          activeView={activeView} 
          onNavigate={setActiveView} 
          currentUser="Alex Engineer"
          language={language}
          onToggleLanguage={toggleLanguage}
          currentProject={currentProject}
          onProjectChange={setCurrentProject}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-black/20">
          {/* Top Bar / Breadcrumb area */}
          <header className="bg-white dark:bg-preh-dark-surface border-b border-gray-200 dark:border-preh-dark-border h-16 flex items-center justify-between px-8 shadow-sm flex-shrink-0 transition-colors duration-200">
            <h1 className="text-xl font-semibold text-preh-petrol dark:text-preh-light-blue">
              {t[activeView]}
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                  <span className="h-2 w-2 bg-preh-pastel-green rounded-full animate-pulse"></span>
                  <span className="text-xs text-gray-500 dark:text-gray-300 font-medium">{t.systemOnline}</span>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto p-6 custom-scrollbar">
            {renderContent()}
          </div>
        </main>

        {/* Right Sidebar (Guides) */}
        <RightPanel activeView={activeView} language={language} />
      </div>
    </div>
  );
};

export default App;