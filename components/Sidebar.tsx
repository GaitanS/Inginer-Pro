import React from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle, Users, 
  ChevronDown, Globe
} from 'lucide-react';
import { ViewType, MenuItem, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  currentUser: string;
  language: Language;
  onToggleLanguage: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onNavigate, 
  currentUser, 
  language, 
  onToggleLanguage 
}) => {
  
  const t = TRANSLATIONS[language];

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
        <div className="font-bold text-lg mb-2 border-2 border-black p-1 flex justify-between items-center cursor-pointer hover:bg-gray-50">
          <span className="truncate">Project Alpha</span>
          <ChevronDown size={16} />
        </div>
        <div className="text-gray-600 font-medium px-1 flex justify-between items-center">
          <span>{currentUser}</span>
          
        </div>
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto py-4">
        
        {/* Main Menu */}
        <div className="mb-6 px-4">
          {mainMenuItems.map((item) => (
            <button
              key={item.id}
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
          ))}
        </div>

        {/* Technical Menu */}
        <div className="px-4">
          {techMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-md mb-1 transition-colors text-left ${
                activeView === item.id 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="font-bold text-gray-500 w-6 text-right">{item.number} #</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer with Language Toggle */}
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-xs text-gray-400">v1.2.4 &copy; 2024</div>
        <button 
          onClick={onToggleLanguage}
          className="flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded hover:bg-gray-100 text-gray-600 border border-gray-200"
        >
          <Globe size={12} />
          <span>{language === 'en' ? 'EN' : 'RO'}</span>
        </button>
      </div>
    </div>
  );
};