import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle, Users, 
  ChevronDown, Globe, ListOrdered
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
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onNavigate, 
  currentUser, 
  language, 
  onToggleLanguage,
  currentProject,
  onProjectChange
}) => {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS[language];

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

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm text-sm">
      {/* Header / Project Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            className="font-bold text-lg mb-2 border-2 border-black p-1 flex justify-between items-center cursor-pointer hover:bg-gray-50 select-none"
          >
            <span className="truncate">{currentProject}</span>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${isProjectMenuOpen ? 'rotate-180' : ''}`} 
            />
          </div>
          
          {isProjectMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-md z-50 max-h-60 overflow-y-auto mt-1">
              {PROJECTS.map((proj) => (
                <div 
                  key={proj}
                  onClick={() => {
                    onProjectChange(proj);
                    setIsProjectMenuOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm truncate ${
                    currentProject === proj ? 'text-blue-700 font-medium bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  {proj}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-gray-600 font-medium px-1 flex justify-between items-center">
          <span>{currentUser}</span>
          <button onClick={onToggleLanguage} className="flex items-center gap-1 hover:text-blue-600">
            <Globe size={14} />
            <span className="text-xs uppercase">{language}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto py-4">
        
        {/* Main Menu */}
        <div className="mb-6 px-4">
          {mainMenuItems.map((item) => (
            <React.Fragment key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md mb-1 transition-colors ${
                  activeView === item.id 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
              
              {/* Sub-item for Status Project */}
              {item.id === ViewType.STATUS && (
                 <button
                 onClick={() => onNavigate(ViewType.TASK_PRIORITIZATION)}
                 className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md mb-1 ml-4 transition-colors border-l-2 border-gray-100 ${
                   activeView === ViewType.TASK_PRIORITIZATION
                     ? 'bg-blue-50 text-blue-700 font-semibold border-blue-300' 
                     : 'text-gray-600 hover:bg-gray-100'
                 }`}
               >
                 <ListOrdered size={16} />
                 <span>{t[ViewType.TASK_PRIORITIZATION]}</span>
               </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="border-t border-gray-200 my-2"></div>

        {/* Technical Menu */}
        <div className="px-4 mt-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Technical Modules</h3>
          {techMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-2 py-1.5 rounded-md mb-1 transition-colors ${
                activeView === item.id 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">
                {item.number}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        ProMan System v2.4.1
      </div>
    </div>
  );
};