
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { DashboardView } from './components/views/DashboardView';
import { TaskPrioritizationView } from './components/views/TaskPrioritizationView';
import { BomView, VisualAidsView, DocumentationView, ValidationView, PfmeaView, EquipmentMainView, EquipmentIPsView, EquipmentPhotosView, CapacityView, GenericDocView } from './components/views/TechnicalViews';
import { ViewType, Language, Task, BomItem, DocHistoryItem, VariantDefinition, EquipmentItem, EquipmentIpGroup } from './types';
import { TRANSLATIONS } from './translations';
import { PROJECTS, INITIAL_TASKS, MOCK_BOM, MOCK_HISTORY, DEFAULT_COLORS, MOCK_EQUIPMENT_DATA, MOCK_EQUIPMENT_IPS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [language, setLanguage] = useState<Language>('en');
  const [currentProject, setCurrentProject] = useState<string>(PROJECTS[0]);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Shared BOM State
  const [bomItems, setBomItems] = useState<BomItem[]>(() => {
    return MOCK_BOM.map(item => ({
      ...item,
      visualAidBgColor: item.visualAidBgColor || '#CCFFFF' // Default Light Cyan
    }));
  });
  const [historyItems, setHistoryItems] = useState<DocHistoryItem[]>(MOCK_HISTORY);

  const [variantDefinitions, setVariantDefinitions] = useState<VariantDefinition[]>(() => {
    const uniqueKeys = Array.from(new Set(MOCK_BOM.flatMap(item => Object.keys(item.variants))));
    return uniqueKeys.map((key, index) => ({
      name: key,
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));
  });

  // Shared Equipment State
  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>(MOCK_EQUIPMENT_DATA);
  const [equipmentIPs, setEquipmentIPs] = useState<EquipmentIpGroup[]>(() => {
    // Smart init: try to link mock IPs to mock Equipment
    return MOCK_EQUIPMENT_IPS.map(group => {
      const parent = MOCK_EQUIPMENT_DATA.find(e => e.station.replace(/\s+/g, '') === group.station.replace(/-/g, '').replace(/\s+/g, ''));
      return { ...group, linkedId: parent?.id };
    });
  });

  // Effect: When equipmentItems change (rename/add/delete), sync EquipmentIPs
  useEffect(() => {
    // 1. Add missing groups
    equipmentItems.forEach(item => {
      const exists = equipmentIPs.find(g => g.linkedId === item.id);
      if (!exists) {
        setEquipmentIPs(prev => [...prev, {
          id: `g-${Date.now()}-${item.id}`,
          linkedId: item.id,
          station: item.station,
          devices: [
            { equipment: 'PLC', name: `${item.station}-PLC`, ip: '' }
          ]
        }]);
      }
    });

    // 2. Remove groups linked to deleted items
    setEquipmentIPs(prev => prev.filter(g => {
      if (!g.linkedId) return true; // Keep unlinked (legacy/mock) groups if desired, or remove
      return equipmentItems.some(item => item.id === g.linkedId);
    }));

    // 3. Update station names in IP groups if changed in Main List
    setEquipmentIPs(prev => prev.map(g => {
      if (g.linkedId) {
        const parent = equipmentItems.find(i => i.id === g.linkedId);
        if (parent && parent.station !== g.station) {
          return { ...g, station: parent.station };
        }
      }
      return g;
    }));
  }, [equipmentItems]);

  const handleAddEquipment = () => {
    const newId = (Math.max(...equipmentItems.map(i => parseInt(i.id) || 0)) + 1).toString();
    const newItem: EquipmentItem = {
      id: newId,
      station: `OP ${newId}0`,
      owner: 'Preh',
      eqNumber: '',
      powerSupply: '',
      powerKw: '',
      airSupplyBar: '',
      airSupplyDiam: ''
    };
    setEquipmentItems([...equipmentItems, newItem]);
  };

  const t = TRANSLATIONS[language];

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

  const renderContent = () => {
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <DashboardView language={language} tasks={tasks} isDarkMode={isDarkMode} />;
      case ViewType.TASK_PRIORITIZATION:
        return <TaskPrioritizationView tasks={tasks} onUpdateTasks={setTasks} language={language} />;
      case ViewType.BOM:
        return (
          <BomView
            language={language}
            isDarkMode={isDarkMode}
            bomItems={bomItems}
            setBomItems={setBomItems}
            historyItems={historyItems}
            setHistoryItems={setHistoryItems}
            variantDefinitions={variantDefinitions}
            setVariantDefinitions={setVariantDefinitions}
          />
        );
      case ViewType.VISUAL_AIDS:
        return (
          <VisualAidsView
            language={language}
            isDarkMode={isDarkMode}
            currentProject={currentProject}
            bomItems={bomItems}
            setBomItems={setBomItems}
            variantDefinitions={variantDefinitions}
          />
        );
      case ViewType.DOCUMENTATION:
        return <DocumentationView language={language} isDarkMode={isDarkMode} equipmentItems={equipmentItems} />;
      case ViewType.VALIDATION_PROTOCOL:
        return <ValidationView language={language} isDarkMode={isDarkMode} equipmentItems={equipmentItems} />;
      case ViewType.PFMEA:
        return <PfmeaView language={language} />;
      case ViewType.EQUIPMENT:
        return (
          <EquipmentMainView
            language={language}
            equipmentItems={equipmentItems}
            setEquipmentItems={setEquipmentItems}
            onAddRow={handleAddEquipment}
          />
        );
      case ViewType.EQUIPMENT_IPS:
        return (
          <EquipmentIPsView
            language={language}
            equipmentIPs={equipmentIPs}
            setEquipmentIPs={setEquipmentIPs}
          />
        );
      case ViewType.EQUIPMENT_PHOTOS:
        return <EquipmentPhotosView language={language} equipmentItems={equipmentItems} setEquipmentItems={setEquipmentItems} />;
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
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-black/20">
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
          <div className="flex-1 overflow-auto p-6 custom-scrollbar">
            {renderContent()}
          </div>
        </main>
        <RightPanel activeView={activeView} language={language} />
      </div>
    </div>
  );
};

export default App;
