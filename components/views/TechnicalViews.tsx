
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_EQUIPMENT_DATA, MOCK_EQUIPMENT_IPS, MOCK_PFMEA, DEFAULT_COLORS } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Language, BomItem, DocHistoryItem, VisualAidMetadata, VariantDefinition, EquipmentItem, EquipmentIpGroup } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { Download, Upload, FileSpreadsheet, Image as ImageIcon, Search, Plus, Trash2, Minus, FileText, FileCheck, CheckSquare, Square, Check, X as XIcon, ShieldCheck, Network, FolderOpen, ChevronDown, ChevronRight, CheckCircle2, FileType, Circle } from 'lucide-react';

declare global {
  interface Window {
    ExcelJS: any;
    Papa: any;
    docx: any;
    jspdf: any;
    saveAs: any;
  }
}

interface ViewProps {
  language: Language;
  isDarkMode?: boolean;
}

interface BomViewProps extends ViewProps {
  currentProject?: string;
  bomItems: BomItem[];
  setBomItems: React.Dispatch<React.SetStateAction<BomItem[]>>;
  historyItems: DocHistoryItem[];
  setHistoryItems: React.Dispatch<React.SetStateAction<DocHistoryItem[]>>;
  variantDefinitions: VariantDefinition[];
  setVariantDefinitions: React.Dispatch<React.SetStateAction<VariantDefinition[]>>;
}

interface VisualAidsViewProps extends ViewProps {
  currentProject?: string;
  bomItems: BomItem[];
  setBomItems: React.Dispatch<React.SetStateAction<BomItem[]>>;
  variantDefinitions: VariantDefinition[];
}

interface DocumentationViewProps extends ViewProps {
  equipmentItems: EquipmentItem[];
}

interface EquipmentPhotosViewProps extends ViewProps {
  equipmentItems: EquipmentItem[];
  setEquipmentItems: React.Dispatch<React.SetStateAction<EquipmentItem[]>>;
  onAddRow?: () => void;
}

interface EquipmentIPsViewProps extends ViewProps {
  equipmentIPs: EquipmentIpGroup[];
  setEquipmentIPs: React.Dispatch<React.SetStateAction<EquipmentIpGroup[]>>;
}

// DOCX Helper
function base64DataURLToArrayBuffer(dataURL: string) {
  const base64Regex = /^data:image\/(png|jpg|jpeg|svg\+xml);base64,/;
  if (!base64Regex.test(dataURL)) {
    return new Uint8Array(0);
  }
  const stringBase64 = dataURL.replace(base64Regex, "");
  const binaryString = window.atob(stringBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes.buffer;
}

// PDF Helper
function getImageDimensions(base64: string): Promise<{ w: number, h: number, ratio: number }> {
  return new Promise((resolve) => {
    const i = new Image();
    i.onload = () => {
      resolve({ w: i.width, h: i.height, ratio: i.width / i.height });
    };
    i.src = base64;
  });
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

function getContrastColor(hexColor: string) {
  const rgb = hexToRgb(hexColor);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

// --- 1# Documentation (IATF Checklist) ---
export const DocumentationView: React.FC<DocumentationViewProps> = ({ language, equipmentItems }) => {
  const t = TRANSLATIONS[language];
  // Stores checklist state as: { "stationId": { "docKey": true, ... } }
  const [checklistMap, setChecklistMap] = useState<Record<string, Record<string, boolean>>>({});
  const [selectedStationId, setSelectedStationId] = useState<string>(equipmentItems[0]?.id || 'general');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    electrical: false,
    maintenance: false,
    quality: false,
    safety: false,
    training: false,
    iatf2025: true
  });

  // Checklist Structure mapped to Translation Keys
  const sections = [
    {
      id: 'general',
      title: 'docGeneral',
      desc: 'docGeneralDesc',
      items: ['docUserManual', 'docLayout', 'docTechSpecs']
    },
    {
      id: 'electrical',
      title: 'docElectrical',
      desc: 'docElectricalDesc',
      items: ['docEPlan', 'docPneumatic', 'docIOList', 'docBackup', 'docAlarmList']
    },
    {
      id: 'maintenance',
      title: 'docMaintenance',
      desc: 'docMaintenanceDesc',
      items: ['docPMPlan', 'docSpareParts', 'docMechDrawings']
    },
    {
      id: 'quality',
      title: 'docQuality',
      desc: 'docQualityDesc',
      items: ['docCE', 'docRisk', 'docCapability', 'docMSA', 'docParams']
    },
    {
      id: 'safety',
      title: 'docSafety',
      desc: 'docSafetyDesc',
      items: ['docSafetyVal', 'docLOTO']
    },
    {
      id: 'training',
      title: 'docTraining',
      desc: 'docTrainingDesc',
      items: ['docTrainingMat', 'docTrainingReg']
    },
    {
      id: 'iatf2025',
      title: 'iatf2025',
      desc: '', // Special highlight
      items: ['docTraceability', 'docCybersecurity']
    }
  ];

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('inginer_pro_doc_checklist_v2');
    if (saved) {
      try {
        setChecklistMap(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load checklist", e);
      }
    }
  }, []);

  // Sync selected station if items change
  useEffect(() => {
    if (equipmentItems.length > 0 && !equipmentItems.find(e => e.id === selectedStationId)) {
      setSelectedStationId(equipmentItems[0].id);
    }
  }, [equipmentItems]);

  const toggleItem = (itemKey: string) => {
    const stationChecklist = checklistMap[selectedStationId] || {};
    const newStationChecklist = { ...stationChecklist, [itemKey]: !stationChecklist[itemKey] };
    const newMap = { ...checklistMap, [selectedStationId]: newStationChecklist };

    setChecklistMap(newMap);
    localStorage.setItem('inginer_pro_doc_checklist_v2', JSON.stringify(newMap));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStationProgress = (stationId: string) => {
    const stationChecks = checklistMap[stationId] || {};
    const totalItems = sections.reduce((acc, sec) => acc + sec.items.length, 0);
    const checkedItems = Object.values(stationChecks).filter(Boolean).length;
    return Math.round((checkedItems / totalItems) * 100);
  };

  const currentStationProgress = getStationProgress(selectedStationId);

  return (
    <div className="flex h-full gap-6 pb-10">
      {/* Sidebar - Equipment Tabs */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
        <h3 className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">Select Station</h3>
        <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-200px)] overflow-y-auto">
          {equipmentItems.map(equip => {
            const progress = getStationProgress(equip.id);
            return (
              <button
                key={equip.id}
                onClick={() => setSelectedStationId(equip.id)}
                className={`text-left px-4 py-3 text-sm font-medium border-l-4 transition-all flex justify-between items-center ${selectedStationId === equip.id
                  ? 'bg-blue-50 dark:bg-gray-700/50 border-preh-petrol text-preh-petrol dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <span className="truncate">{equip.station}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${progress === 100 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {progress}%
                </span>
              </button>
            );
          })}
          {equipmentItems.length === 0 && (
            <div className="p-4 text-xs text-gray-400 text-center">No equipment defined. Add items in Equipment List.</div>
          )}
        </div>
      </div>

      {/* Main Checklist Area */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {/* Header Card */}
        <div className="bg-white dark:bg-preh-dark-surface p-6 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FolderOpen className="text-preh-petrol" />
                {equipmentItems.find(e => e.id === selectedStationId)?.station || "General"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">IATF 16949:2016 & 2025 Compliance Tracker</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-preh-petrol dark:text-preh-light-blue">{currentStationProgress}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">{t.docComplete}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-preh-petrol dark:bg-preh-light-blue h-2.5 rounded-full transition-all duration-500" style={{ width: `${currentStationProgress}%` }}></div>
          </div>
        </div>

        {/* Checklist Sections */}
        <div className="grid grid-cols-1 gap-4">
          {sections.map(section => (
            <div key={section.id} className={`bg-white dark:bg-preh-dark-surface rounded-lg border ${section.id === 'iatf2025' ? 'border-preh-petrol dark:border-preh-light-blue ring-1 ring-preh-petrol dark:ring-preh-light-blue' : 'border-gray-200 dark:border-preh-dark-border'} shadow-sm overflow-hidden transition-all`}>
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full p-4 flex items-center justify-between transition-colors ${section.id === 'iatf2025' ? 'bg-preh-petrol/5 dark:bg-preh-petrol/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <div className="flex items-center gap-3">
                  {section.id === 'iatf2025' ? <ShieldCheck className="text-preh-petrol dark:text-preh-light-blue" /> : <FileText size={20} className="text-gray-400 dark:text-gray-500" />}
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{t[section.title]}</h3>
                    {section.desc && <p className="text-xs text-gray-500 dark:text-gray-400">{t[section.desc]}</p>}
                  </div>
                </div>
                <ChevronDown className={`text-gray-400 transition-transform ${expandedSections[section.id] ? 'rotate-180' : ''}`} />
              </button>

              {expandedSections[section.id] && (
                <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-black/10">
                  <div className="space-y-3 mt-3">
                    {section.items.map(itemKey => {
                      const isChecked = checklistMap[selectedStationId]?.[itemKey] || false;
                      return (
                        <div
                          key={itemKey}
                          className="flex items-center gap-3 p-2 rounded hover:bg-white dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                          onClick={() => toggleItem(itemKey)}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800'}`}>
                            {isChecked && <Check size={14} strokeWidth={3} />}
                          </div>
                          <span className={`text-sm ${isChecked ? 'text-gray-500 line-through dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                            {t[itemKey]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 3# BOM View ---

export const BomView: React.FC<BomViewProps> = ({
  language,
  bomItems,
  setBomItems,
  historyItems,
  setHistoryItems,
  variantDefinitions,
  setVariantDefinitions
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'bom' | 'history'>('bom');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const addColumnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingColumn && addColumnInputRef.current) {
      addColumnInputRef.current.focus();
    }
  }, [isAddingColumn]);

  const addBomRow = () => {
    const newId = (Math.max(...bomItems.map(i => parseInt(i.id) || 0)) + 1).toString();
    const newRow: BomItem = {
      id: newId,
      station: '',
      partNumber: '',
      description: '',
      quantity: 0,
      variants: {},
      visualAidBgColor: '#CCFFFF'
    };
    variantDefinitions.forEach(v => newRow.variants[v.name] = false);
    setBomItems([...bomItems, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    setBomItems(bomItems.filter(item => item.id !== id));
  };

  const handleBomChange = (id: string, field: keyof BomItem, value: any) => {
    setBomItems(bomItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const toggleVariant = (itemId: string, variantName: string) => {
    setBomItems(bomItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          variants: {
            ...item.variants,
            [variantName]: !item.variants[variantName]
          }
        };
      }
      return item;
    }));
  };

  const handleStartAddColumn = () => {
    setIsAddingColumn(true);
    setNewColumnName('');
  };

  const handleConfirmAddColumn = () => {
    if (!newColumnName.trim()) {
      setIsAddingColumn(false);
      return;
    }
    if (variantDefinitions.some(v => v.name === newColumnName)) {
      alert('Variant already exists!');
      return;
    }

    const randomColor = DEFAULT_COLORS[variantDefinitions.length % DEFAULT_COLORS.length];
    const newVariant: VariantDefinition = {
      name: newColumnName,
      color: randomColor
    };

    setVariantDefinitions([...variantDefinitions, newVariant]);
    setBomItems(prevItems => prevItems.map(item => ({
      ...item,
      variants: { ...item.variants, [newColumnName]: false }
    })));
    setIsAddingColumn(false);
  };

  const handleCancelAddColumn = () => {
    setIsAddingColumn(false);
  };

  const handleColumnColorChange = (name: string, color: string) => {
    setVariantDefinitions(prev => prev.map(v => v.name === name ? { ...v, color } : v));
  };

  const renderBomTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 font-semibold sticky top-0 shadow-sm z-20">
          <tr>
            <th className="p-3 border-b dark:border-gray-700 min-w-[150px] sticky left-0 bg-gray-100 dark:bg-gray-800 z-10">{t.station}</th>
            <th className="p-3 border-b dark:border-gray-700 min-w-[180px]">{t.material}</th>
            <th className="p-3 border-b dark:border-gray-700 min-w-[280px]">{t.desc}</th>
            <th className="p-3 border-b dark:border-gray-700 w-16 text-center">{t.qty}</th>
            {variantDefinitions.map(v => {
              const contrast = getContrastColor(v.color);
              return (
                <th key={v.name} className="p-2 border-b dark:border-gray-700 min-w-[120px] text-center text-xs relative group" style={{ backgroundColor: v.color, color: contrast }}>
                  <div className="flex flex-col items-center">
                    <input
                      type="color"
                      value={v.color}
                      onChange={(e) => handleColumnColorChange(v.name, e.target.value)}
                      className="absolute top-1 right-1 w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer"
                    />
                    <span className="truncate max-w-[110px] font-bold block w-full">{v.name}</span>
                  </div>
                </th>
              );
            })}
            <th className="p-3 border-b dark:border-gray-700 min-w-[140px] bg-gray-50 dark:bg-gray-800">
              {isAddingColumn ? (
                <div className="flex items-center space-x-1">
                  <input
                    ref={addColumnInputRef}
                    value={newColumnName}
                    onChange={e => setNewColumnName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleConfirmAddColumn();
                      if (e.key === 'Escape') handleCancelAddColumn();
                    }}
                    className="w-full text-xs px-1 py-1 border rounded dark:bg-gray-700 dark:text-white"
                    placeholder="Name"
                  />
                  <button onClick={handleConfirmAddColumn} className="text-green-600 hover:text-green-800"><Check size={16} /></button>
                  <button onClick={handleCancelAddColumn} className="text-red-600 hover:text-red-800"><XIcon size={16} /></button>
                </div>
              ) : (
                <button onClick={handleStartAddColumn} className="flex items-center justify-center w-full h-full text-gray-400 hover:text-preh-petrol">
                  <Plus size={18} />
                </button>
              )}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {bomItems.map((item, idx) => (
            <tr key={item.id} className={`group ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors`}>
              <td className="p-1 sticky left-0 bg-inherit z-10 border-r dark:border-gray-700">
                <input
                  value={item.station}
                  onChange={(e) => handleBomChange(item.id, 'station', e.target.value)}
                  className="w-full bg-transparent p-2 focus:outline-none dark:text-white font-medium"
                />
              </td>
              <td className="p-1 border-r dark:border-gray-700">
                <input
                  value={item.partNumber}
                  onChange={(e) => handleBomChange(item.id, 'partNumber', e.target.value)}
                  className="w-full bg-transparent p-2 focus:outline-none dark:text-white font-mono"
                />
              </td>
              <td className="p-1 border-r dark:border-gray-700">
                <input
                  value={item.description}
                  onChange={(e) => handleBomChange(item.id, 'description', e.target.value)}
                  className="w-full bg-transparent p-2 focus:outline-none dark:text-white"
                />
              </td>
              <td className="p-1 border-r dark:border-gray-700">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleBomChange(item.id, 'quantity', parseInt(e.target.value))}
                  className="w-full bg-transparent p-2 text-center focus:outline-none dark:text-white"
                />
              </td>
              {variantDefinitions.map(v => {
                const contrast = getContrastColor(v.color);
                return (
                  <td key={v.name} className="p-1 text-center cursor-pointer border-r border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: v.color }}
                    onClick={() => toggleVariant(item.id, v.name)}>
                    <div className="flex items-center justify-center h-full">
                      {item.variants[v.name] && <span className="font-bold text-lg select-none" style={{ color: contrast }}>X</span>}
                    </div>
                  </td>
                );
              })}
              <td className="p-1 text-center">
                <button onClick={() => handleDeleteRow(item.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab('bom')} className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'bom' ? 'border-preh-petrol text-preh-petrol dark:text-preh-light-blue' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>{t.sheetBom}</button>
        <button onClick={() => setActiveTab('history')} className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'history' ? 'border-preh-petrol text-preh-petrol dark:text-preh-light-blue' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>{t.sheetHistory}</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-0">
        {activeTab === 'bom' ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <div className="flex gap-2">
                <button onClick={addBomRow} className="flex items-center gap-1 px-3 py-1.5 bg-preh-petrol text-white rounded hover:bg-preh-grey-blue text-xs font-medium transition-colors">
                  <Plus size={14} /> {t.addRow}
                </button>
              </div>
            </div>
            {renderBomTable()}
          </div>
        ) : (
          <div className="p-6">History Table (Placeholder)</div>
        )}
      </div>
    </div>
  );
};

// --- 2.1 Visual Aids ---

export const VisualAidsView: React.FC<VisualAidsViewProps> = ({
  language,
  bomItems,
  setBomItems,
  variantDefinitions,
  currentProject
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, { pdf: boolean, docx: boolean }>>({});

  useEffect(() => {
    const initialSelection: Record<string, { pdf: boolean, docx: boolean }> = {};
    bomItems.forEach(item => {
      // Preserve existing selections if new items added
      initialSelection[item.id] = selection[item.id] || { pdf: true, docx: true };
    });
    setSelection(initialSelection);
  }, [bomItems.length]);

  const toggleSelection = (id: string, type: 'pdf' | 'docx') => {
    setSelection(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: !prev[id]?.[type] }
    }));
  };

  const toggleAll = (type: 'pdf' | 'docx', value: boolean) => {
    const newSel = { ...selection };
    bomItems.forEach(item => {
      newSel[item.id] = { ...newSel[item.id], [type]: value };
    });
    setSelection(newSel);
  };

  const handleImageClick = (id: string) => {
    setActiveItemId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeItemId) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setBomItems(bomItems.map(item => item.id === activeItemId ? { ...item, image: evt.target?.result as string } : item));
      setActiveItemId(null);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateStationDocuments = async (type: 'pdf' | 'docx') => {
    const selectedItems = bomItems.filter(item => selection[item.id]?.[type]);
    if (selectedItems.length === 0) return;

    if (type === 'docx') {
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, TextRun, ImageRun } = window.docx;

      const children = [];

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];

        // Footer Color Table
        const footerCells = variantDefinitions.map(v => new TableCell({
          width: { size: 100 / variantDefinitions.length, type: WidthType.PERCENTAGE },
          shading: { fill: item.variants[v.name] ? v.color.replace('#', '') : 'FFFFFF' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "000000" }
          },
          children: [new Paragraph("")]
        }));

        const cardTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 2,
                  shading: { fill: "53738C" },
                  verticalAlign: "center",
                  children: [
                    new Paragraph({
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({ text: "PREH ", bold: true, color: "FFFFFF", size: 64, font: "Arial" }), // 32pt
                        new TextRun({ text: "   VISUAL AID", color: "FFFFFF", size: 28, font: "Arial" }) // 14pt
                      ]
                    })
                  ]
                })
              ]
            }),
            // Body
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  verticalAlign: "center",
                  borders: { right: { style: BorderStyle.SINGLE, size: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4 }, left: { style: BorderStyle.SINGLE, size: 4 } },
                  children: [
                    item.image ? new Paragraph({
                      alignment: "center",
                      children: [new ImageRun({ data: base64DataURLToArrayBuffer(item.image), transformation: { width: 300, height: 200 } })]
                    }) : new Paragraph({ alignment: "center", text: "No Image" })
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  shading: { fill: item.visualAidBgColor?.replace('#', '') || "CCFFFF" },
                  verticalAlign: "center",
                  borders: { right: { style: BorderStyle.SINGLE, size: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4 } },
                  children: [
                    new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: "PART NUMBER:", size: 20, font: "Arial", bold: true })] }),
                    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: item.partNumber, bold: true, size: 32, font: "Arial" })] }), // 16pt
                    new Paragraph({ children: [new TextRun({ text: "DESCRIPTION:", size: 20, font: "Arial", bold: true })] }),
                    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: item.description, bold: true, size: 32, font: "Arial" })] }), // 16pt
                    new Paragraph({ children: [new TextRun({ text: "PROJECT NAME:", size: 20, font: "Arial", bold: true })] }),
                    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: currentProject || "", bold: true, size: 24, font: "Arial" })] }), // 12pt
                  ]
                })
              ]
            }),
            // Footer Color Bar
            new TableRow({
              height: { value: 600, rule: 'exact' },
              children: [
                new TableCell({
                  columnSpan: 2,
                  children: [new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: footerCells })] })]
                })
              ]
            }),
            // Approval Box
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 2,
                  borders: { top: { style: BorderStyle.SINGLE, size: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4 }, left: { style: BorderStyle.SINGLE, size: 4 }, right: { style: BorderStyle.SINGLE, size: 4 } },
                  children: [
                    new Paragraph({
                      alignment: "center",
                      spacing: { before: 100, after: 100 },
                      children: [new TextRun({ text: `Approved per Master Document: MASTER_${currentProject?.replace(/\s+/g, '_')}_VA_1.0.pdf`, size: 18, font: "Arial" })]
                    })
                  ]
                })
              ]
            })
          ]
        });

        children.push(cardTable);
        children.push(new Paragraph("")); // Spacer

        // Page break logic: every 3 items
        if ((i + 1) % 3 === 0 && i < selectedItems.length - 1) {
          children.push(new Paragraph({ children: [new window.docx.PageBreak()] }));
        }
      }

      const doc = new Document({ sections: [{ children }] });
      const buffer = await Packer.toBlob(doc);
      window.saveAs(buffer, "VisualAids_Export.docx");
    }

    else if (type === 'pdf') {
      const doc = new window.jspdf.jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const cardHeight = 90;

      let cursorY = margin;

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];

        if (i > 0 && i % 3 === 0) {
          doc.addPage();
          cursorY = margin;
        }

        // Header
        doc.setFillColor(83, 115, 140);
        doc.rect(margin, cursorY, pageWidth - 2 * margin, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("PREH", margin + 2, cursorY + 11);
        doc.setFontSize(14);
        doc.text("VISUAL AID", margin + 40, cursorY + 11);

        // Body Images
        doc.setDrawColor(0);
        doc.setLineWidth(0.1);
        doc.rect(margin, cursorY + 15, (pageWidth - 2 * margin) / 2, 50); // Left Box
        if (item.image) {
          try {
            // Fit image
            doc.addImage(item.image, 'JPEG', margin + 5, cursorY + 18, 80, 45, undefined, 'FAST');
          } catch (e) { }
        }

        // Info Area
        const infoX = margin + (pageWidth - 2 * margin) / 2;
        doc.setFillColor(item.visualAidBgColor || "#CCFFFF");
        doc.rect(infoX, cursorY + 15, (pageWidth - 2 * margin) / 2, 50, 'F');
        doc.rect(infoX, cursorY + 15, (pageWidth - 2 * margin) / 2, 50, 'S');

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");

        let textY = cursorY + 22;
        doc.setFontSize(10); doc.text("PART NUMBER:", infoX + 2, textY);
        doc.setFontSize(16); doc.text(item.partNumber, infoX + 2, textY + 7);
        textY += 16;
        doc.setFontSize(10); doc.text("DESCRIPTION:", infoX + 2, textY);
        doc.setFontSize(16); doc.text(item.description, infoX + 2, textY + 7);
        textY += 16;
        doc.setFontSize(10); doc.text("PROJECT NAME:", infoX + 2, textY);
        doc.setFontSize(12); doc.text(currentProject || "", infoX + 2, textY + 6);

        // Footer Color Bars
        const barY = cursorY + 65;
        const barWidth = (pageWidth - 2 * margin) / variantDefinitions.length;
        variantDefinitions.forEach((v, idx) => {
          doc.setFillColor(item.variants[v.name] ? v.color : "#FFFFFF");
          doc.setDrawColor(0);
          doc.rect(margin + (idx * barWidth), barY, barWidth, 10, 'FD');
        });

        // Approval Box
        doc.setDrawColor(0);
        doc.rect(margin, barY + 10, pageWidth - 2 * margin, 8, 'S');
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.text(`Approved per Master Document: MASTER_${currentProject?.substring(0, 15)}..._VA_1.0.pdf`, pageWidth / 2, barY + 6, { align: 'center' });

        cursorY += cardHeight + 5;
      }
      doc.save("VisualAids_Export.pdf");
    }
  };

  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <ImageIcon size={20} className="text-preh-petrol" />
          {t.sheetVisualAids}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => generateStationDocuments('pdf')} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-bold shadow-sm">
            <Download size={14} /> PDF
          </button>
          <button onClick={() => generateStationDocuments('docx')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-bold shadow-sm">
            <Download size={14} /> DOCX
          </button>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 font-semibold sticky top-0 shadow-sm z-10">
            <tr>
              <th className="p-3 border-b dark:border-gray-700 w-12 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] mb-1">PDF</span>
                  <input type="checkbox" onChange={(e) => toggleAll('pdf', e.target.checked)} />
                </div>
              </th>
              <th className="p-3 border-b dark:border-gray-700 w-12 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] mb-1">DOCX</span>
                  <input type="checkbox" onChange={(e) => toggleAll('docx', e.target.checked)} />
                </div>
              </th>
              <th className="p-3 border-b dark:border-gray-700 w-20 text-center">Color</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[100px]">{t.station}</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[120px]">{t.material}</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[200px]">{t.desc}</th>
              <th className="p-3 border-b dark:border-gray-700 w-24 text-center">{t.picture}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {bomItems.map((item, idx) => (
              <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <td className="p-3 text-center border-r dark:border-gray-700">
                  <input type="checkbox" checked={selection[item.id]?.pdf || false} onChange={() => toggleSelection(item.id, 'pdf')} />
                </td>
                <td className="p-3 text-center border-r dark:border-gray-700">
                  <input type="checkbox" checked={selection[item.id]?.docx || false} onChange={() => toggleSelection(item.id, 'docx')} />
                </td>
                <td className="p-3 text-center border-r dark:border-gray-700">
                  <input
                    type="color"
                    value={item.visualAidBgColor || '#CCFFFF'}
                    onChange={(e) => setBomItems(bomItems.map(i => i.id === item.id ? { ...i, visualAidBgColor: e.target.value } : i))}
                    className="w-8 h-6 p-0 border-0 rounded cursor-pointer"
                  />
                </td>
                <td className="p-3 font-bold dark:text-white border-r dark:border-gray-700">{item.station}</td>
                <td className="p-3 text-preh-petrol dark:text-preh-light-blue font-mono border-r dark:border-gray-700">{item.partNumber}</td>
                <td className="p-3 dark:text-gray-200 border-r dark:border-gray-700">{item.description}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleImageClick(item.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
                    {item.image ? <img src={item.image} className="h-8 w-8 object-cover rounded" /> : <ImageIcon size={20} className="text-gray-400" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 1. Equipment List (Main) - Now Editable with Add Row
export const EquipmentMainView: React.FC<EquipmentPhotosViewProps> = ({ language, equipmentItems, setEquipmentItems, onAddRow }) => {
  const t = TRANSLATIONS[language];
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleChange = (id: string, field: keyof EquipmentItem, value: string) => {
    setEquipmentItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setEquipmentItems(prev => prev.filter(item => item.id !== deleteId));
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const calculateCompletion = (item: EquipmentItem) => {
    const fields = ['station', 'owner', 'eqNumber', 'powerSupply', 'powerKw', 'airSupplyBar', 'airSupplyDiam'];
    const filled = fields.filter(f => item[f as keyof EquipmentItem]?.trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const selectClass = "w-full h-full p-3 bg-transparent text-gray-900 dark:text-white focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none appearance-none [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-800 dark:[&>option]:text-white";

  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm p-6 overflow-hidden flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.EQUIPMENT}</h2>
        <button onClick={onAddRow} className="flex items-center gap-1 px-3 py-1.5 bg-preh-petrol text-white rounded hover:bg-preh-grey-blue text-xs font-medium transition-colors">
          <Plus size={14} /> {t.addRow}
        </button>
      </div>
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 font-semibold sticky top-0 shadow-sm z-10">
            <tr>
              <th className="p-3 border-b dark:border-gray-700 w-24 text-center">{t.completedPct}</th>
              <th className="p-3 border-b dark:border-gray-700 w-12 text-center text-[10px] leading-tight text-red-500 border-r dark:border-gray-700">{t.deleteRowQuestion}</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[120px] border-r dark:border-gray-700">{t.station}</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[130px] border-r dark:border-gray-700">{t.owner}</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[100px] border-r dark:border-gray-700">{t.eqNumber}</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[200px] border-r dark:border-gray-700">{t.powerSupply}</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[100px] border-r dark:border-gray-700">{t.powerKw}</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[120px] border-r dark:border-gray-700">{t.airSupplyBar}</th>
              <th className="p-3 border-b dark:border-gray-700 min-w-[180px] border-r dark:border-gray-700">{t.airSupplyDiam}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {equipmentItems.map((item, idx) => {
              const completion = calculateCompletion(item);
              return (
                <tr key={item.id} className={`transition-colors group ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <td className="p-2 text-center border-r border-gray-100 dark:border-gray-700">
                    <span className={`text-xs font-bold ${completion === 100 ? 'text-green-600' : 'text-orange-500'}`}>{completion}%</span>
                  </td>
                  <td className="p-0 text-center border-r border-gray-100 dark:border-gray-700">
                    <button onClick={(e) => handleDeleteClick(e, item.id)} className="p-2 text-red-500 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full m-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input type="text" value={item.station} onChange={(e) => handleChange(item.id, 'station', e.target.value)} className="w-full h-full p-3 bg-transparent text-gray-900 dark:text-white focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none" /></td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                    <select value={item.owner} onChange={(e) => handleChange(item.id, 'owner', e.target.value)} className={selectClass}>
                      <option value="" className="text-gray-500">-</option>
                      {['Customer', 'Preh'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input type="text" value={item.eqNumber} onChange={(e) => handleChange(item.id, 'eqNumber', e.target.value)} className="w-full h-full p-3 bg-transparent text-gray-900 dark:text-white focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none" /></td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                    <select value={item.powerSupply} onChange={(e) => handleChange(item.id, 'powerSupply', e.target.value)} className={selectClass}>
                      <option value="" className="text-gray-500">-</option>
                      {['AC 220V 50HZ single phase', 'AC 400V 50Hz 3~/N/PE - max. 32A', 'DC 24V'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                    <select value={item.powerKw} onChange={(e) => handleChange(item.id, 'powerKw', e.target.value)} className={selectClass}>
                      <option value="" className="text-gray-500">-</option>
                      {['1', '1.5', '2', '2.5', '3'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                    <select value={item.airSupplyBar} onChange={(e) => handleChange(item.id, 'airSupplyBar', e.target.value)} className={selectClass}>
                      <option value="" className="text-gray-500">-</option>
                      {['no', '6', '8'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                    <select value={item.airSupplyDiam} onChange={(e) => handleChange(item.id, 'airSupplyDiam', e.target.value)} className={selectClass}>
                      <option value="" className="text-gray-500">-</option>
                      {['no', '12', '16'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.confirmDelete || 'Confirm Delete'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.confirmDeleteMsg}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Equipment IPs (1.1) - Now Editable and Dynamic
export const EquipmentIPsView: React.FC<EquipmentIPsViewProps> = ({ language, equipmentIPs, setEquipmentIPs }) => {
  const t = TRANSLATIONS[language];

  const handleIpChange = (stationIdx: number, deviceIdx: number, field: string, value: string) => {
    const newIPs = [...equipmentIPs];
    newIPs[stationIdx].devices[deviceIdx] = { ...newIPs[stationIdx].devices[deviceIdx], [field]: value };
    setEquipmentIPs(newIPs);
  };

  const addDeviceToGroup = (stationIdx: number) => {
    const newIPs = [...equipmentIPs];
    newIPs[stationIdx].devices.push({ equipment: 'New Device', name: '', ip: '' });
    setEquipmentIPs(newIPs);
  };

  const removeDevice = (stationIdx: number, deviceIdx: number) => {
    const newIPs = [...equipmentIPs];
    newIPs[stationIdx].devices.splice(deviceIdx, 1);
    setEquipmentIPs(newIPs);
  };

  const calculateGroupCompletion = (group: EquipmentIpGroup) => {
    if (group.devices.length === 0) return 0;
    const totalFields = group.devices.length * 3;
    let filledFields = 0;
    group.devices.forEach(d => {
      if (d.equipment) filledFields++;
      if (d.name) filledFields++;
      if (d.ip) filledFields++;
    });
    return Math.round((filledFields / totalFields) * 100);
  };

  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm p-6 overflow-auto h-full space-y-8">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">{t.EQUIPMENT_IPS}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {equipmentIPs.map((group, groupIdx) => {
          const completion = calculateGroupCompletion(group);
          return (
            <div key={group.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col shadow-sm">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">{group.station}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${completion === 100 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                    {completion}%
                  </span>
                </div>
                <button onClick={() => addDeviceToGroup(groupIdx)} className="text-preh-petrol hover:text-preh-grey-blue p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Plus size={16} /></button>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="p-2 border-b dark:border-gray-700 w-1/3">{t.equipName}</th>
                    <th className="p-2 border-b dark:border-gray-700 w-1/3">{t.name}</th>
                    <th className="p-2 border-b dark:border-gray-700 w-1/3">{t.equipIp}</th>
                    <th className="p-2 border-b dark:border-gray-700 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {group.devices.map((device, devIdx) => (
                    <tr key={devIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                      <td className="p-0 border-r dark:border-gray-700">
                        <input value={device.equipment} onChange={(e) => handleIpChange(groupIdx, devIdx, 'equipment', e.target.value)} className="w-full bg-transparent p-2 focus:outline-none dark:text-gray-200" />
                      </td>
                      <td className="p-0 border-r dark:border-gray-700">
                        <input value={device.name} onChange={(e) => handleIpChange(groupIdx, devIdx, 'name', e.target.value)} className="w-full bg-transparent p-2 focus:outline-none dark:text-gray-200" />
                      </td>
                      <td className="p-0 border-r dark:border-gray-700">
                        <input value={device.ip} onChange={(e) => handleIpChange(groupIdx, devIdx, 'ip', e.target.value)} className="w-full bg-transparent p-2 focus:outline-none font-mono text-preh-petrol dark:text-preh-light-blue" />
                      </td>
                      <td className="p-0 text-center">
                        <button onClick={() => removeDevice(groupIdx, devIdx)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Minus size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. Equipment Photos (1.2)
export const EquipmentPhotosView: React.FC<EquipmentPhotosViewProps> = ({ language, equipmentItems, setEquipmentItems }) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoCell, setActivePhotoCell] = useState<{ id: string, type: 'photoFront' | 'photoTag' } | null>(null);

  const handlePhotoClick = (id: string, type: 'photoFront' | 'photoTag') => {
    setActivePhotoCell({ id, type });
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoCell) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setEquipmentItems(prev => prev.map(item =>
        item.id === activePhotoCell.id ? { ...item, [activePhotoCell.type]: result } : item
      ));
      setActivePhotoCell(null);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm p-6 overflow-hidden flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t.EQUIPMENT_PHOTOS}</h2>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 font-semibold sticky top-0 shadow-sm z-10">
            <tr>
              <th className="p-3 border-b dark:border-gray-700 border-r dark:border-gray-700 w-1/4">{t.station}</th>
              <th className="p-3 border-b dark:border-gray-700 border-r dark:border-gray-700 w-1/4">{t.eqNumber}</th>
              <th className="p-3 border-b dark:border-gray-700 border-r dark:border-gray-700 w-1/4 text-center">{t.photoFront}</th>
              <th className="p-3 border-b dark:border-gray-700 w-1/4 text-center">{t.photoTag}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {equipmentItems.map((item, idx) => (
              <tr key={item.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <td className="p-3 border-r dark:border-gray-700 font-medium dark:text-white">{item.station}</td>
                <td className="p-3 border-r dark:border-gray-700 dark:text-gray-300">{item.eqNumber}</td>

                <td className="p-2 border-r dark:border-gray-700 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors" onClick={() => handlePhotoClick(item.id, 'photoFront')}>
                  {item.photoFront ? (
                    <img src={item.photoFront} alt="Front" className="h-20 w-auto max-w-[150px] object-contain mx-auto rounded border border-gray-200 bg-white" />
                  ) : (
                    <div className="h-16 w-full mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={20} />
                      <span className="text-[10px] mt-1">{t.uploadBtn}</span>
                    </div>
                  )}
                </td>

                <td className="p-2 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors" onClick={() => handlePhotoClick(item.id, 'photoTag')}>
                  {item.photoTag ? (
                    <img src={item.photoTag} alt="Tag" className="h-20 w-auto max-w-[150px] object-contain mx-auto rounded border border-gray-200 bg-white" />
                  ) : (
                    <div className="h-16 w-full mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={20} />
                      <span className="text-[10px] mt-1">{t.uploadBtn}</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ... (Placeholders)
export const PfmeaView: React.FC<ViewProps> = ({ language }) => { return <div className="p-6">PFMEA (Placeholder)</div> };
export const CapacityView: React.FC<ViewProps> = ({ language }) => { return <div className="p-6">Capacity (Placeholder)</div> };
export const GenericDocView: React.FC<{ title: string, language: Language }> = ({ title }) => { return <div className="p-6">{title} (Placeholder)</div> };
