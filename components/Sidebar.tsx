import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle, Users, 
  ChevronDown, Globe, ListOrdered, Moon, Sun, Cpu, ChevronRight
} from 'lucide-react';
import { ViewType, MenuItem, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { PROJECTS } from '../constants';

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  currentUser: string;
  language: Language;
  onToggleLanguage: () => void;
  currentProject: string;
  onProjectChange: (project: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onNavigate, 
  currentUser, 
  language, 
  onToggleLanguage,
  currentProject,
  onProjectChange,
  isDarkMode,
  toggleDarkMode
}) => {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isBomExpanded, setIsBomExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS[language];

  useEffect(() => {
    // Auto-expand BOM if Visual Aids is active
    if (activeView === ViewType.VISUAL_AIDS) {
      setIsBomExpanded(true);
    }
  }, [activeView]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const mainMenuItems: MenuItem[] = [
    { id: ViewType.DASHBOARD, label: t[ViewType.DASHBOARD], icon: <LayoutDashboard size={18} />, category: 'main' },
    { id: ViewType.CALENDAR, label: t[ViewType.CALENDAR], icon: <Calendar size={18} />, category: 'main' },
    { id: ViewType.STATUS, label: t[ViewType.STATUS], icon: <CheckCircle size={18} />, category: 'main' },
    { id: ViewType.TEAM, label: t[ViewType.TEAM], icon: <Users size={18} />, category: 'main' },
  ];

  const techMenuItems: MenuItem[] = [
    { id: ViewType.WORK_INSTRUCTIONS, label: t[ViewType.WORK_INSTRUCTIONS], number: 1, category: 'technical' },
    { id: ViewType.BOM, label: t[ViewType.BOM], number: 2, category: 'technical' },
    { id: ViewType.DOCUMENTATION, label: t[ViewType.DOCUMENTATION], number: 3, category: 'technical' },
    { id: ViewType.EQUIPMENT, label: t[ViewType.EQUIPMENT], number: 4, category: 'technical' },
    { id: ViewType.PROCESS_FLOW, label: t[ViewType.PROCESS_FLOW], number: 5, category: 'technical' },
    { id: ViewType.CAPABILITIES, label: t[ViewType.CAPABILITIES], number: 6, category: 'technical' },
    { id: ViewType.PFMEA, label: t[ViewType.PFMEA], number: 7, category: 'technical' },
    { id: ViewType.MSA, label: t[ViewType.MSA], number: 8, category: 'technical' },
    { id: ViewType.FAILURE_CODES, label: t[ViewType.FAILURE_CODES], number: 9, category: 'technical' },
    { id: ViewType.EOLT, label: t[ViewType.EOLT], number: 10, category: 'technical' },
    { id: ViewType.CAPACITY, label: t[ViewType.CAPACITY], number: 11, category: 'technical' },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.id === ViewType.BOM) {
      setIsBomExpanded(!isBomExpanded);
      onNavigate(ViewType.BOM);
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <div className="h-screen w-64 bg-white dark:bg-preh-dark-surface border-r border-gray-200 dark:border-preh-dark-border flex flex-col flex-shrink-0 shadow-xl text-sm font-sans transition-colors duration-200 z-20">
      {/* Brand Area with Dynamic Logos */}
      <div className="px-6 pt-6 pb-4">
        {/* Light Mode Logo */}
        <div className="dark:hidden flex items-center gap-2.5">
           <div className="bg-preh-petrol text-white p-1.5 rounded shadow-sm">
             <Cpu size={22} strokeWidth={2.5} />
           </div>
           <div className="flex flex-col leading-none">
             <span className="font-bold text-xl text-gray-800 tracking-tight">Inginer</span>
             <span className="font-extrabold text-xl text-preh-petrol tracking-widest -mt-1">PRO</span>
           </div>
        </div>
        
        {/* Dark Mode Logo */}
        <div className="hidden dark:flex items-center gap-2.5">
           <div className="bg-preh-light-blue text-gray-900 p-1.5 rounded shadow-sm shadow-preh-light-blue/20">
             <Cpu size={22} strokeWidth={2.5} />
           </div>
           <div className="flex flex-col leading-none">
             <span className="font-bold text-xl text-white tracking-tight">Inginer</span>
             <span className="font-extrabold text-xl text-preh-light-blue tracking-widest -mt-1">PRO</span>
           </div>
        </div>
      </div>

      {/* Project Selector */}
      <div className="px-4 pb-4 border-b border-gray-200 dark:border-preh-dark-border">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            className="w-full font-medium text-sm text-preh-petrol dark:text-preh-light-blue border border-preh-light-grey/30 dark:border-gray-600 rounded-md p-2.5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-preh-dark-surface-hover transition-colors"
          >
            <span className="truncate">{currentProject}</span>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${isProjectMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isProjectMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-xl rounded-md z-50 max-h-60 overflow-y-auto mt-1">
              {PROJECTS.map((proj) => (
                <div 
                  key={proj}
                  onClick={() => {
                    onProjectChange(proj);
                    setIsProjectMenuOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer text-sm truncate transition-colors ${
                    currentProject === proj 
                      ? 'text-preh-petrol font-medium bg-preh-light-blue/10 dark:bg-preh-petrol/20' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {proj}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="text-preh-grey dark:text-gray-400 mt-4 px-1 flex justify-between items-center">
          <span className="text-xs font-medium flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-preh-petrol text-white flex items-center justify-center text-[10px]">AE</div>
            <span className="truncate max-w-[80px]">{currentUser.split(' ')[0]}</span>
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleLanguage} 
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-preh-petrol dark:hover:text-preh-light-blue transition-colors"
              title="Switch Language"
            >
              <Globe size={16} />
              <span className="sr-only">Language</span>
            </button>
            <button 
              onClick={toggleDarkMode} 
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-preh-petrol dark:hover:text-preh-light-blue transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span className="sr-only">Theme</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        
        {/* Main Menu */}
        <div className="mb-6 px-3">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">Main</h3>
          {mainMenuItems.map((item) => (
            <React.Fragment key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md mb-1 transition-all duration-200 ${
                  activeView === item.id 
                    ? 'bg-preh-petrol text-white shadow-md' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-preh-dark-surface-hover hover:text-preh-petrol dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
              
              {/* Sub-item for Status Project */}
              {item.id === ViewType.STATUS && (
                 <button
                 onClick={() => onNavigate(ViewType.TASK_PRIORITIZATION)}
                 className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md mb-1 ml-4 mt-1 transition-colors border-l-2 ${
                   activeView === ViewType.TASK_PRIORITIZATION
                     ? 'border-preh-petrol text-preh-petrol dark:text-preh-light-blue font-medium bg-gray-50 dark:bg-gray-800' 
                     : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-preh-petrol dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                 }`}
               >
                 <ListOrdered size={16} />
                 <span>{t[ViewType.TASK_PRIORITIZATION]}</span>
               </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-preh-dark-border mx-4 mb-4"></div>

        {/* Technical Menu */}
        <div className="px-3">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">Technical</h3>
          {techMenuItems.map((item) => (
            <React.Fragment key={item.id}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center justify-between space-x-3 px-2 py-2 rounded-md mb-1 transition-colors group ${
                  activeView === item.id 
                    ? 'bg-gray-100 dark:bg-preh-dark-surface-hover text-preh-petrol dark:text-preh-light-blue font-bold' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-preh-dark-surface-hover hover:text-preh-petrol dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className={`flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold transition-colors flex-shrink-0 ${
                    activeView === item.id 
                      ? 'bg-preh-petrol text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
                  }`}>
                    {item.number}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.id === ViewType.BOM && (
                  <ChevronRight size={14} className={`transition-transform duration-200 ${isBomExpanded ? 'rotate-90' : ''}`} />
                )}
              </button>

              {/* Sub-item for BOM -> Visual Aids */}
              {item.id === ViewType.BOM && isBomExpanded && (
                <button
                  onClick={() => onNavigate(ViewType.VISUAL_AIDS)}
                  className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md mb-1 ml-4 mt-[-4px] transition-colors group relative ${
                    activeView === ViewType.VISUAL_AIDS 
                      ? 'bg-gray-50 dark:bg-preh-dark-surface-hover/50 text-preh-petrol dark:text-preh-light-blue font-bold' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-preh-petrol dark:hover:text-white'
                  }`}
                >
                  {/* Indentation line */}
                  <div className="absolute left-[-10px] top-[-10px] bottom-[50%] w-[12px] border-l-2 border-b-2 border-gray-200 dark:border-gray-600 rounded-bl-md"></div>
                  
                  <span className={`flex items-center justify-center min-w-[28px] h-5 rounded px-1 text-[10px] font-bold transition-colors flex-shrink-0 ${
                    activeView === ViewType.VISUAL_AIDS 
                      ? 'bg-preh-light-blue/20 text-preh-petrol dark:text-preh-light-blue' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                  }`}>
                    2.1
                  </span>
                  <span className="truncate text-xs">{t[ViewType.VISUAL_AIDS]}</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-preh-dark-border text-[10px] text-gray-400 dark:text-gray-500 text-center">
        Inginer PRO v1.0
      </div>
    </div>
  );
};