
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_EQUIPMENT, MOCK_PFMEA, DEFAULT_COLORS } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Language, BomItem, DocHistoryItem, VisualAidMetadata, VariantDefinition } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { Download, Upload, FileSpreadsheet, Image as ImageIcon, Search, Plus, Trash2, Minus, FileText, FileCheck, CheckSquare, Square, Check, X } from 'lucide-react';

// NOTE: ExcelJS, PapaParse, docx, jspdf, and FileSaver are loaded globally via CDN in index.html
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

// Helper to convert base64 to Uint8Array for DOCX
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

// Helper to load image for PDF
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

// Helper to calculate contrast color (black or white)
function getContrastColor(hexColor: string) {
  const rgb = hexToRgb(hexColor);
  // Calculate brightness (YIQ formula)
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

// --- 2# BOM ---
export const BomView: React.FC<BomViewProps> = ({ 
  language, 
  isDarkMode, 
  bomItems, 
  setBomItems, 
  historyItems, 
  setHistoryItems, 
  variantDefinitions, 
  setVariantDefinitions 
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'BOM' | 'HISTORY'>('BOM');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sapInputRef = useRef<HTMLInputElement>(null);
  const [activeImageRowId, setActiveImageRowId] = useState<string | null>(null);

  // State for adding new column
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColNameInput, setNewColNameInput] = useState("");

  // --- Handlers for SAP Import ---
  const handleSapImportClick = () => {
    sapInputRef.current?.click();
  };

  const handleSapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.Papa) {
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const newItems: BomItem[] = [];
          results.data.forEach((row: any) => {
            const explosionLevel = row['Explosion level']?.trim() || row['"Explosion level"']?.trim();
            if (explosionLevel === '.1') {
              const item: BomItem = {
                id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                station: row['Item Number'] || '', 
                partNumber: row['Component number'] || '',
                description: row['Object description'] || '',
                quantity: parseFloat(row['Comp. Qty (CUn)']) || 0,
                visualAidBgColor: '#CCFFFF',
                variants: {}
              };
              variantDefinitions.forEach(def => item.variants[def.name] = false);
              newItems.push(item);
            }
          });

          if (newItems.length > 0) {
            setBomItems(prev => [...prev, ...newItems]);
            alert(`${t.importSap} ${t.success || 'Success'}: ${newItems.length} items added.`);
          } else {
            alert("No items found with Explosion level .1");
          }
        },
        error: (error: any) => {
          console.error("CSV Parse Error:", error);
          alert("Error parsing CSV file.");
        }
      });
    }
    if (sapInputRef.current) sapInputRef.current.value = '';
  };

  // --- Handlers for Excel Export (Match Screenshot) ---
  const handleExport = async () => {
    if (!window.ExcelJS) {
      alert("Excel exporter not loaded yet.");
      return;
    }

    const workbook = new window.ExcelJS.Workbook();
    
    // 1. Create BOM Sheet
    const bomSheet = workbook.addWorksheet('BOM');
    
    const columns = [
      { header: t.station, key: 'station', width: 25 },
      { header: t.material, key: 'material', width: 30 },
      { header: t.qty, key: 'quantity', width: 15 },
      { header: t.desc, key: 'description', width: 50 },
      { header: t.picture, key: 'picture', width: 30 },
      ...variantDefinitions.map(v => ({ header: v.name, key: v.name, width: 30 }))
    ];
    bomSheet.columns = columns;

    // Header Styling - Dark Grey-Blue
    const headerRow = bomSheet.getRow(1);
    headerRow.height = 40;
    
    // Standard Headers
    for(let i=1; i<=5; i++) {
        const cell = headerRow.getCell(i);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF53738C' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }

    // Variant Headers - Colored (User Selected)
    let varColIndex = 6; 
    variantDefinitions.forEach((def, idx) => {
      // Convert Hex #RRGGBB to ARGB FFRRGGBB
      const argbColor = 'FF' + def.color.replace('#', '').toUpperCase();
      const textColor = getContrastColor(def.color) === '#FFFFFF' ? 'FFFFFFFF' : 'FF000000';
      
      const cell = headerRow.getCell(varColIndex + idx);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argbColor } };
      cell.font = { bold: true, color: { argb: textColor }, size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    // Data Rows
    for (const item of bomItems) {
      const rowValues: any = {
        station: item.station,
        material: item.partNumber,
        quantity: item.quantity,
        description: item.description,
        picture: '',
      };
      
      variantDefinitions.forEach(def => {
        rowValues[def.name] = item.variants[def.name] ? 'X' : '';
      });

      const row = bomSheet.addRow(rowValues);
      row.height = 65; 

      row.eachCell((cell: any, colNumber: number) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        
        // Variant Columns Styling
        if (colNumber >= varColIndex) {
          const variantIdx = colNumber - varColIndex;
          const def = variantDefinitions[variantIdx];
          if (def) {
            const argbColor = 'FF' + def.color.replace('#', '').toUpperCase();
            const contrastColor = getContrastColor(def.color);
            const fontArgb = contrastColor === '#FFFFFF' ? 'FFFFFFFF' : 'FF1F4E78'; // Use Dark Blue if bg is light, White if bg is dark

            // Background matches header
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argbColor } };
            
            if (cell.value === 'X') {
              // Large X
              cell.font = { size: 28, bold: true, color: { argb: fontArgb } }; 
            }
          }
        } else {
          // Standard columns
          cell.font = { size: 11 };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } }; // Light grey background for standard data
          if(colNumber === 2) cell.font = { bold: true }; 
        }
      });

      // Add Image
      if (item.image) {
        try {
           const imageId = workbook.addImage({
             base64: item.image,
             extension: 'png',
           });
           bomSheet.addImage(imageId, {
             tl: { col: 4, row: row.number - 1 },
             br: { col: 5, row: row.number },
             editAs: 'oneCell'
           });
        } catch (e) {
          console.error("Error adding image to excel", e);
        }
      }
    }

    // 2. Create History Sheet
    const historySheet = workbook.addWorksheet('Document History');
    historySheet.columns = [
      { header: t.version, key: 'version', width: 10 },
      { header: t.register, key: 'register', width: 20 },
      { header: t.changes, key: 'changes', width: 40 },
      { header: t.created, key: 'created', width: 20 },
      { header: t.date, key: 'dateCreated', width: 15 },
      { header: t.released, key: 'released', width: 20 },
      { header: t.date, key: 'dateReleased', width: 15 },
    ];

    historyItems.forEach(item => {
      historySheet.addRow(item);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "InginerPRO_BOM_Master.xlsx";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Standard Handlers ---
  const handleAddRow = () => {
    if(activeTab !== 'BOM') return;
    const newItem: BomItem = {
      id: `new-${Date.now()}`,
      station: '',
      partNumber: '',
      quantity: 0,
      description: '',
      visualAidBgColor: '#CCFFFF',
      variants: {}
    };
    variantDefinitions.forEach(def => newItem.variants[def.name] = false);
    setBomItems(prev => [...prev, newItem]);
  };

  const handleDeleteRow = (id: string) => {
    setBomItems(prev => prev.filter(item => item.id !== id));
  };

  const startAddColumn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingColumn(true);
    setNewColNameInput("");
  };

  const cancelAddColumn = (e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setIsAddingColumn(false);
    setNewColNameInput("");
  };

  const confirmAddColumn = (e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    const trimmedName = newColNameInput.trim();
    if (!trimmedName) {
      setIsAddingColumn(false);
      return;
    }
    // Check for duplicates case-insensitive
    if (variantDefinitions.some(v => v.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert("Variant already exists!");
      return;
    }
    const randomColor = DEFAULT_COLORS[variantDefinitions.length % DEFAULT_COLORS.length];
    
    // Update Definitions
    const newDef = { name: trimmedName, color: randomColor };
    setVariantDefinitions(prev => [...prev, newDef]);
    
    // Update existing items
    setBomItems(prevItems => prevItems.map(item => ({
      ...item,
      variants: { ...item.variants, [trimmedName]: false }
    })));
    
    setIsAddingColumn(false);
    setNewColNameInput("");
  };

  const handleDeleteColumn = (keyToRemove: string) => {
    setVariantDefinitions(prev => prev.filter(def => def.name !== keyToRemove));
    setBomItems(prevItems => prevItems.map(item => {
      const newVariants = { ...item.variants };
      delete newVariants[keyToRemove];
      return { ...item, variants: newVariants };
    }));
  };

  const handleVariantColorChange = (key: string, newColor: string) => {
    setVariantDefinitions(prev => prev.map(def => 
      def.name === key ? { ...def, color: newColor } : def
    ));
  };

  const handleVariantToggle = (itemId: string, variantKey: string) => {
    setBomItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          variants: { ...item.variants, [variantKey]: !item.variants[variantKey] }
        };
      }
      return item;
    }));
  };

  const handleBomTextChange = (id: string, field: keyof BomItem, value: string | number) => {
    setBomItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleImageClick = (itemId: string) => {
    if(activeTab !== 'BOM') return;
    setActiveImageRowId(itemId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeImageRowId) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setBomItems(prevItems => prevItems.map(item => 
        item.id === activeImageRowId ? { ...item, image: result } : item
      ));
      setActiveImageRowId(null);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Handlers for History ---
  const handleAddHistoryRow = () => {
    setHistoryItems(prev => [...prev, {
      id: `hist-${Date.now()}`,
      version: '',
      register: 'Formular BOM',
      changes: '',
      created: '',
      dateCreated: '',
      released: '',
      dateReleased: ''
    }]);
  };

  const handleHistoryChange = (id: string, field: keyof DocHistoryItem, value: string) => {
    setHistoryItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm overflow-hidden flex flex-col h-full transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-preh-dark-border flex justify-between items-center bg-gray-50 dark:bg-gray-800">
        <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
          <FileSpreadsheet className="text-preh-petrol dark:text-preh-light-blue" size={20}/>
          {activeTab === 'BOM' ? t.BOM : t.sheetHistory}
        </h2>
        <div className="flex gap-2">
          {activeTab === 'BOM' && (
            <button onClick={handleSapImportClick} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors shadow-sm">
              <Upload size={16} />
              {t.importSap}
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors shadow-sm">
            <Download size={16} />
            {t.exportCsv}
          </button>
        </div>
      </div>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <input type="file" ref={sapInputRef} onChange={handleSapFileChange} className="hidden" accept=".csv" />

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative">
        {activeTab === 'BOM' && (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-100 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap min-w-[180px] text-center border-r dark:border-gray-700">{t.station}</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap min-w-[200px] border-r dark:border-gray-700">{t.material}</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap min-w-[120px] text-center border-r dark:border-gray-700">{t.qty}</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap min-w-[300px] border-r dark:border-gray-700">{t.desc}</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap min-w-[100px] text-center border-r dark:border-gray-700">{t.picture}</th>
                {variantDefinitions.map((def, index) => {
                  const textColor = getContrastColor(def.color);
                  return (
                    <th key={def.name} 
                        className="p-2 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap text-center min-w-[120px] text-xs border-r border-gray-200 dark:border-gray-700 group relative transition-colors duration-300"
                        style={{ backgroundColor: def.color, color: textColor }}
                    >
                      <div className="flex items-center justify-between gap-1 px-1">
                        <span className="truncate flex-1 font-bold">{def.name}</span>
                        <div className="flex items-center bg-white/50 rounded p-0.5">
                          <input
                            type="color"
                            value={def.color}
                            onChange={(e) => handleVariantColorChange(def.name, e.target.value)}
                            className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer mr-1"
                            onClick={(e) => e.stopPropagation()}
                            title="Change Column Color"
                          />
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteColumn(def.name); }}
                            className="text-red-600 hover:bg-red-200 rounded p-0.5 transition-colors"
                            title="Delete Column"
                          >
                            <Minus size={12} />
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
                <th className={`p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 transition-all duration-200 ${isAddingColumn ? 'min-w-[150px]' : 'w-10'}`}>
                  {isAddingColumn ? (
                    <div className="flex items-center gap-1">
                      <input 
                        autoFocus
                        type="text" 
                        value={newColNameInput}
                        onChange={(e) => setNewColNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmAddColumn(e as any);
                          if (e.key === 'Escape') cancelAddColumn(e as any);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full p-1 text-xs border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-preh-petrol"
                        placeholder="Variant..."
                      />
                      <button onClick={confirmAddColumn} className="text-green-600 hover:text-green-800 p-1"><Check size={14} /></button>
                      <button onClick={cancelAddColumn} className="text-red-500 hover:text-red-700 p-1"><X size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={startAddColumn} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-preh-petrol" title={t.addColumn}>
                      <Plus size={18} />
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {bomItems.map((item, idx) => (
                <tr key={item.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input type="text" value={item.station} onChange={(e) => handleBomTextChange(item.id, 'station', e.target.value)} className="w-full h-full p-3 bg-transparent text-center font-bold text-gray-600 dark:text-white focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none"/></td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input type="text" value={item.partNumber} onChange={(e) => handleBomTextChange(item.id, 'partNumber', e.target.value)} className="w-full h-full p-3 bg-transparent font-mono text-preh-petrol dark:text-preh-light-blue font-medium focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none"/></td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input type="number" value={item.quantity} onChange={(e) => handleBomTextChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full h-full p-3 bg-transparent text-center font-bold text-gray-700 dark:text-white focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none"/></td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input type="text" value={item.description} onChange={(e) => handleBomTextChange(item.id, 'description', e.target.value)} className="w-full h-full p-3 bg-transparent text-gray-800 dark:text-white font-medium focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none"/></td>
                  <td className="p-2 border-r border-gray-100 dark:border-gray-700 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleImageClick(item.id)}>
                    {item.image ? <img src={item.image} alt="Part" className="h-10 w-10 object-contain mx-auto rounded border border-gray-200 bg-white" /> : <div className="h-8 w-8 mx-auto bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>}
                  </td>
                  {variantDefinitions.map((def, index) => {
                    const contrastColor = getContrastColor(def.color);
                    return (
                      <td key={def.name} onDoubleClick={() => handleVariantToggle(item.id, def.name)} className="p-3 border-r border-gray-100 dark:border-gray-700 text-center cursor-pointer select-none hover:bg-white/50 transition-colors duration-300" style={{ backgroundColor: def.color }}>
                        {item.variants[def.name] ? <span className="font-bold text-lg drop-shadow-sm" style={{ color: contrastColor }}>X</span> : null}
                      </td>
                    );
                  })}
                  <td className="p-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 text-center">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRow(item.id); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"><Minus size={16} /></button>
                  </td>
                </tr>
              ))}
              <tr>
                 <td colSpan={5 + variantDefinitions.length + 1} className="p-2 bg-gray-50 dark:bg-gray-900">
                    <button onClick={handleAddRow} className="flex items-center gap-2 text-xs text-gray-500 hover:text-preh-petrol p-2 dark:text-gray-400 dark:hover:text-white"><Plus size={14} /> {t.addRow}</button>
                 </td>
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'HISTORY' && (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold sticky top-0 z-10 shadow-sm">
               <tr>
                 <th className="p-3 border-r border-gray-200 dark:border-gray-700 w-16 text-center">{t.version}</th>
                 <th className="p-3 border-r border-gray-200 dark:border-gray-700 w-40">{t.register}</th>
                 <th className="p-3 border-r border-gray-200 dark:border-gray-700 flex-1">{t.changes}</th>
                 <th className="p-3 border-r border-gray-200 dark:border-gray-700 w-32">{t.created}</th>
                 <th className="p-3 border-r border-gray-200 dark:border-gray-700 w-24 text-center">{t.date}</th>
                 <th className="p-3 border-r border-gray-200 dark:border-gray-700 w-32">{t.released}</th>
                 <th className="p-3 w-24 text-center">{t.date}</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
               {historyItems.map((item) => (
                 <tr key={item.id} className="bg-white dark:bg-gray-800">
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input className="w-full h-full p-3 text-center bg-transparent focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none dark:text-gray-100" value={item.version} onChange={(e) => handleHistoryChange(item.id, 'version', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input className="w-full h-full p-3 bg-transparent focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none dark:text-gray-100" value={item.register} onChange={(e) => handleHistoryChange(item.id, 'register', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700"><textarea className="w-full h-full p-3 bg-transparent focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none resize-none dark:text-gray-100" rows={2} value={item.changes} onChange={(e) => handleHistoryChange(item.id, 'changes', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input className="w-full h-full p-3 bg-transparent focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none dark:text-gray-100" value={item.created} onChange={(e) => handleHistoryChange(item.id, 'created', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input className="w-full h-full p-3 text-center bg-transparent focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none dark:text-gray-100" value={item.dateCreated} onChange={(e) => handleHistoryChange(item.id, 'dateCreated', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700"><input className="w-full h-full p-3 bg-transparent focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none dark:text-gray-100" value={item.released} onChange={(e) => handleHistoryChange(item.id, 'released', e.target.value)} /></td>
                    <td className="p-0"><input className="w-full h-full p-3 text-center bg-transparent focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none dark:text-gray-100" value={item.dateReleased} onChange={(e) => handleHistoryChange(item.id, 'dateReleased', e.target.value)} /></td>
                 </tr>
               ))}
               <tr>
                 <td colSpan={7} className="p-2 bg-gray-50 dark:bg-gray-900">
                    <button onClick={handleAddHistoryRow} className="flex items-center gap-2 text-xs text-gray-500 hover:text-preh-petrol p-2 dark:text-gray-400 dark:hover:text-white"><Plus size={14} /> {t.addRow}</button>
                 </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="flex border-t border-gray-200 dark:border-preh-dark-border bg-gray-100 dark:bg-gray-900 px-2 pt-1 gap-1">
        <button
          onClick={() => setActiveTab('BOM')}
          className={`px-6 py-1.5 text-sm font-medium rounded-t-md transition-colors border-t border-l border-r ${
            activeTab === 'BOM'
              ? 'bg-white dark:bg-gray-800 text-preh-petrol border-gray-300 dark:border-gray-600 border-b-white dark:border-b-gray-800 mb-[-1px] z-10 relative'
              : 'bg-gray-200 dark:bg-gray-800/50 text-gray-500 border-transparent hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
           {t.sheetBom}
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-6 py-1.5 text-sm font-medium rounded-t-md transition-colors border-t border-l border-r ${
            activeTab === 'HISTORY'
              ? 'bg-yellow-400 text-gray-900 border-yellow-500 border-b-yellow-400 mb-[-1px] z-10 relative shadow-sm' 
              : 'bg-gray-200 dark:bg-gray-800/50 text-gray-500 border-transparent hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
           {t.sheetHistory}
        </button>
        {activeTab === 'BOM' && (
          <button onClick={handleAddRow} className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 self-center" title="Add Row">
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

interface VisualAidsViewProps extends ViewProps {
  currentProject: string;
  bomItems: BomItem[];
  setBomItems: React.Dispatch<React.SetStateAction<BomItem[]>>;
  variantDefinitions: VariantDefinition[];
}

// --- 2.1 Visual Aids ---
export const VisualAidsView: React.FC<VisualAidsViewProps> = ({ language, isDarkMode, currentProject, bomItems, setBomItems, variantDefinitions }) => {
  const t = TRANSLATIONS[language];
  const [vaMetadata, setVaMetadata] = useState<VisualAidMetadata>({
    dateCreated: new Date().toISOString().split('T')[0],
    createdBy: 'Gaitan Silviu',
    checkedBy: '',
    approvedBy: '',
    releaseDate: '',
    version: '1.0'
  });
  
  const [generatedDocuments, setGeneratedDocuments] = useState<{station: string, filename: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Track selection: { id: { pdf: boolean, docx: boolean } }
  const [selection, setSelection] = useState<Record<string, { pdf: boolean, docx: boolean }>>({});

  useEffect(() => {
    // Initialize selection state based on bomItems
    const newSelection: Record<string, { pdf: boolean, docx: boolean }> = { ...selection };
    bomItems.forEach(item => {
      if (!newSelection[item.id]) {
        newSelection[item.id] = { pdf: true, docx: true };
      }
    });
    setSelection(newSelection);
  }, [bomItems.length]);

  const toggleSelection = (id: string, type: 'pdf' | 'docx') => {
    setSelection(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: !prev[id]?.[type] }
    }));
  };

  const toggleAll = (type: 'pdf' | 'docx', currentValue: boolean) => {
    const newSelection = { ...selection };
    bomItems.forEach(item => {
      if (!newSelection[item.id]) newSelection[item.id] = { pdf: false, docx: false };
      newSelection[item.id][type] = !currentValue;
    });
    setSelection(newSelection);
  };

  const allSelected = (type: 'pdf' | 'docx') => bomItems.length > 0 && bomItems.every(item => selection[item.id]?.[type]);

  const handleColorChange = (id: string, color: string) => {
    setBomItems(prev => prev.map(item => 
      item.id === id ? { ...item, visualAidBgColor: color } : item
    ));
  };

  const parseProjectString = () => {
    const parts = currentProject.split('-');
    const projectNumber = parts[0]?.trim() || "00000";
    const projectName = parts.length > 1 ? parts.slice(1).join('-').trim() : "PROJECT";
    return { projectNumber, projectName };
  };

  const generateStationDocuments = async () => {
    if (!window.docx || !window.jspdf || !window.saveAs) {
      alert("Document generation libraries not loaded.");
      return;
    }
    setIsGenerating(true);
    const { projectNumber, projectName } = parseProjectString();
    const date = new Date();
    const dateStr = `${date.getFullYear()}_${String(date.getMonth()+1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}`;
    const generatedList: {station: string, filename: string}[] = [];

    // Filter items selected for either PDF or DOCX
    const relevantItems = bomItems.filter(i => selection[i.id]?.pdf || selection[i.id]?.docx);
    const stations: string[] = Array.from(new Set(relevantItems.map(i => i.station).filter(s => s)));

    for (const station of stations) {
      const stationItems = relevantItems.filter(i => i.station === station);
      const fileNameBase = `${projectNumber}_VA_${projectName.replace(/\s+/g, '_')}_${station.replace(/\s+/g, '_')}_${dateStr}_${vaMetadata.version}`;
      
      // Filter for DOCX
      const docxItems = stationItems.filter(i => selection[i.id]?.docx);
      
      if (docxItems.length > 0) {
        // --- 1. DOCX GENERATION (Advanced Card Layout) ---
        const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, VerticalAlign, ShadingType, PageBreak } = window.docx;

        const docxChildren = [];
        let itemCount = 0;

        for (const item of docxItems) {
          if (itemCount > 0 && itemCount % 3 === 0) {
            docxChildren.push(new Paragraph({ children: [new PageBreak()] }));
          }
          itemCount++;

          // Image handling
          let imageRun = new Paragraph("No Image");
          if (item.image) {
            try {
              const imageBuffer = base64DataURLToArrayBuffer(item.image);
              if (imageBuffer.byteLength > 0) {
                imageRun = new Paragraph({
                  children: [ new window.docx.ImageRun({ data: imageBuffer, transformation: { width: 300, height: 200 } }) ],
                  alignment: AlignmentType.CENTER
                });
              }
            } catch (e) {}
          }

          // Card Table Structure
          const cardTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Row 1: Header (Merged)
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 2,
                    shading: { fill: "53738C", type: ShadingType.CLEAR, color: "auto" },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "PREH", bold: true, color: "FFFFFF", size: 48, font: "Arial" }),
                          new TextRun({ text: "  VISUAL AID", color: "FFFFFF", size: 28, font: "Arial" })
                        ],
                        alignment: AlignmentType.LEFT,
                      })
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 100, bottom: 100, left: 200 },
                    borders: { 
                      top: {style: BorderStyle.SINGLE, size: 4}, bottom: {style: BorderStyle.SINGLE, size: 4}, 
                      left: {style: BorderStyle.SINGLE, size: 4}, right: {style: BorderStyle.SINGLE, size: 4} 
                    }
                  })
                ]
              }),
              // Row 2: Content (Image Left, Info Right)
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [imageRun],
                    verticalAlign: VerticalAlign.CENTER,
                    borders: { 
                      top: {style: BorderStyle.SINGLE, size: 4}, bottom: {style: BorderStyle.SINGLE, size: 4}, 
                      left: {style: BorderStyle.SINGLE, size: 4}, right: {style: BorderStyle.SINGLE, size: 4} 
                    }
                  }),
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    shading: { fill: item.visualAidBgColor ? item.visualAidBgColor.replace('#', '') : "CCFFFF", type: ShadingType.CLEAR, color: "auto" },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "PART NUMBER:", bold: true, size: 32, font: "Arial" })] }), // 16pt = 32 half-points
                      new Paragraph({ children: [new TextRun({ text: item.partNumber, size: 32, bold: true, font: "Arial" })], spacing: { after: 200 } }),
                      new Paragraph({ children: [new TextRun({ text: "DESCRIPTION:", bold: true, size: 32, font: "Arial" })] }),
                      new Paragraph({ children: [new TextRun({ text: item.description, size: 32, bold: true, font: "Arial" })], spacing: { after: 200 } }),
                      new Paragraph({ children: [new TextRun({ text: "PROJECT:", bold: true, size: 24, font: "Arial" })] }), // 12pt = 24 half-points
                      new Paragraph({ children: [new TextRun({ text: projectName, size: 24, bold: true, font: "Arial" })] }),
                    ],
                    margins: { top: 200, bottom: 200, left: 200, right: 200 },
                    verticalAlign: VerticalAlign.CENTER,
                    borders: { 
                      top: {style: BorderStyle.SINGLE, size: 4}, bottom: {style: BorderStyle.SINGLE, size: 4}, 
                      left: {style: BorderStyle.SINGLE, size: 4}, right: {style: BorderStyle.SINGLE, size: 4} 
                    }
                  })
                ],
                height: { value: 3500, rule: window.docx.HeightRule.ATLEAST }
              }),
              // Row 3: Footer Color Bar (Merged & Nested Table for Dynamic Variants)
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 2,
                    children: [
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                          new TableRow({
                            children: variantDefinitions.map(def => {
                              // If checked in BOM for this item, use color. Else White.
                              const isChecked = item.variants[def.name];
                              const color = isChecked ? def.color.replace('#', '') : "FFFFFF";
                              
                              return new TableCell({
                                shading: { fill: color, type: ShadingType.CLEAR, color: "auto" },
                                children: [],
                                height: { value: 400, rule: window.docx.HeightRule.EXACT },
                                borders: { 
                                  top: {style: BorderStyle.SINGLE, size: 4}, bottom: {style: BorderStyle.SINGLE, size: 4}, 
                                  left: {style: BorderStyle.SINGLE, size: 4}, right: {style: BorderStyle.SINGLE, size: 4} 
                                }
                              });
                            }),
                            height: { value: 400, rule: window.docx.HeightRule.EXACT }
                          })
                        ]
                      })
                    ],
                    borders: { 
                      top: {style: BorderStyle.SINGLE, size: 4}, bottom: {style: BorderStyle.SINGLE, size: 4}, 
                      left: {style: BorderStyle.SINGLE, size: 4}, right: {style: BorderStyle.SINGLE, size: 4} 
                    },
                    margins: { top: 0, bottom: 0, left: 0, right: 0 }
                  })
                ]
              }),
              // Row 4: Approval Text (Merged Cell with Border)
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 2,
                    children: [
                      new Paragraph({
                        children: [ new TextRun({ text: `Approved per Master Document: MASTER_${fileNameBase}.pdf`, size: 14, color: "000000", font: "Arial" }) ],
                        alignment: AlignmentType.CENTER,
                      })
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    borders: { 
                      top: {style: BorderStyle.SINGLE, size: 4}, bottom: {style: BorderStyle.SINGLE, size: 4}, 
                      left: {style: BorderStyle.SINGLE, size: 4}, right: {style: BorderStyle.SINGLE, size: 4} 
                    },
                    margins: { top: 50, bottom: 50 }
                  })
                ]
              })
            ]
          });

          // Just spacing between cards
          const spacer = new Paragraph({ text: "", spacing: { after: 400 } });

          docxChildren.push(cardTable, spacer);
        }

        const doc = new Document({
          sections: [{ properties: {}, children: docxChildren }]
        });

        const blobDocx = await Packer.toBlob(doc);
        window.saveAs(blobDocx, `${fileNameBase}.docx`);
        generatedList.push({ station, filename: `${fileNameBase}.docx` });
      }

      // Filter for PDF
      const pdfItems = stationItems.filter(i => selection[i.id]?.pdf);

      if (pdfItems.length > 0) {
        // --- 2. PDF GENERATION (Geometric Primitives - 3 Per Page) ---
        const pdf = new window.jspdf.jsPDF();
        let yPos = 10;
        let pdfItemCount = 0;
        
        for (const item of pdfItems) {
          // Enforce 3 items per page
          if (pdfItemCount > 0 && pdfItemCount % 3 === 0) {
            pdf.addPage();
            yPos = 10;
          }
          pdfItemCount++;

          // Header (Blue Rect)
          pdf.setDrawColor(0);
          pdf.setFillColor(83, 115, 140); // Preh Dark Blue
          pdf.rect(10, yPos, 190, 15, 'FD'); // Fill and Draw
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(22);
          pdf.setFont("helvetica", "bold"); // Arial equivalent
          pdf.text('PREH', 15, yPos + 10);
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          pdf.text('VISUAL AID', 45, yPos + 10);
          yPos += 15;

          // Content Area (Image Left, Info Right)
          const contentHeight = 60;
          
          // Left Box (Image container)
          pdf.setFillColor(255, 255, 255);
          pdf.rect(10, yPos, 100, contentHeight, 'FD');

          // Right Box (Info Box - User Selected Color)
          const bgColor = hexToRgb(item.visualAidBgColor || '#CCFFFF');
          pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b); 
          pdf.rect(110, yPos, 90, contentHeight, 'FD');

          // Image
          if (item.image) {
            try {
              const dim = await getImageDimensions(item.image);
              const maxW = 90; 
              const maxH = 50;
              let finalW = dim.w;
              let finalH = dim.h;
              
              // Scale to fit
              const scale = Math.min(maxW / dim.w, maxH / dim.h);
              finalW = dim.w * scale;
              finalH = dim.h * scale;
              
              // Center image in left 100mm area
              const xImg = 10 + (100 - finalW) / 2;
              const yImg = yPos + (contentHeight - finalH) / 2;
              
              pdf.addImage(item.image, 'PNG', xImg, yImg, finalW, finalH);
            } catch(e) {}
          } else {
            pdf.setTextColor(150);
            pdf.text("No Image", 60, yPos + 30, { align: 'center' });
          }

          // Text Info
          pdf.setTextColor(0);
          let textY = yPos + 10;
          const xText = 115;
          
          pdf.setFontSize(16); // Arial 16 Bold
          pdf.setFont("helvetica", "bold");
          pdf.text('PART NUMBER:', xText, textY);
          textY += 7;
          pdf.text(item.partNumber, xText, textY);
          textY += 12;
          
          pdf.text('DESCRIPTION:', xText, textY);
          textY += 7;
          // split long text
          const descLines = pdf.splitTextToSize(item.description, 80);
          pdf.text(descLines, xText, textY);
          textY += (descLines.length * 6) + 6;

          pdf.setFontSize(12); // Arial 12 Bold
          pdf.text('PROJECT NAME:', xText, textY);
          textY += 6;
          pdf.text(projectName, xText, textY);

          yPos += contentHeight;

          // Footer Bar (Colored Rects based on Variants)
          const barHeight = 8;
          // Calculate width per variant
          const barWidth = 190 / (variantDefinitions.length || 1); 
          
          variantDefinitions.forEach((def, idx) => {
             // Logic: If BOM variant is true, use color. Else White.
             const isChecked = item.variants[def.name];
             if (isChecked) {
               const rgb = hexToRgb(def.color);
               pdf.setFillColor(rgb.r, rgb.g, rgb.b);
             } else {
               pdf.setFillColor(255, 255, 255);
             }
             
             // Draw rect with border ('FD')
             pdf.rect(10 + (idx * barWidth), yPos, barWidth, barHeight, 'FD');
          });
          yPos += barHeight;

          // Approval Text Box
          const approvalHeight = 8;
          pdf.setFillColor(255, 255, 255);
          pdf.rect(10, yPos, 190, approvalHeight, 'FD'); // Bordered box full width
          
          pdf.setTextColor(0);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.text(`Approved per Master Document: MASTER_${fileNameBase}.pdf`, 105, yPos + 5, { align: 'center' });
          
          yPos += 15; // Bottom margin for card
        }

        pdf.save(`${fileNameBase}.pdf`);
      }
    }

    setGeneratedDocuments(generatedList);
    setIsGenerating(false);
    alert(t.docsGenerated);
  };

  const generateMasterDocument = () => {
    if (!window.jspdf || !window.jspdf.jsPDF) return;
    const { projectNumber, projectName } = parseProjectString();
    const date = new Date();
    const dateStr = `${date.getFullYear()}_${String(date.getMonth()+1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}`;
    const masterFilename = `MASTER_${projectNumber}_VA_${projectName.replace(/\s+/g, '_')}_${dateStr}_${vaMetadata.version}`;

    const doc = new window.jspdf.jsPDF();
    
    // Header
    doc.setFillColor(83, 115, 140); // Preh Blue
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("PREH", 15, 18);
    
    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("MASTER APPROVAL DOCUMENT", 105, 40, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Visual Aids - ${projectName} Project`, 105, 48, { align: "center" });

    // Metadata Table
    const startY = 60;
    doc.autoTable({
      startY: startY,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold' },
      body: [
        ['Document Number:', masterFilename],
        ['Project number:', projectNumber],
        ['Project name:', projectName],
        ['Document Type:', 'Visual Aid Master Approval']
      ],
      columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold', fillColor: [245, 245, 245] } }
    });

    // Components Table
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("APPROVED COMPONENTS / COMPONENTE APROBATE", 14, doc.lastAutoTable.finalY + 15);
    
    // Get items that were selected for DOCX generation (since master references DOCX usually)
    // Or simpler: items that were selected at all.
    const relevantItems = bomItems.filter(item => (selection[item.id]?.pdf || selection[item.id]?.docx) && item.station); 
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['PART NUMBER', 'DESCRIPTION', 'DOCUMENT NAME']],
      headStyles: { fillColor: [83, 115, 140], textColor: 255 },
      body: relevantItems.map(item => {
        // Find which station file this belongs to
        const stationDoc = generatedDocuments.find(d => d.station === item.station);
        return [
          item.partNumber,
          item.description,
          stationDoc ? stationDoc.filename : 'Pending Generation'
        ];
      })
    });

    // Signatures
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, finalY, 182, 50, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.rect(14, finalY, 182, 50); // Border

    doc.setFontSize(10);
    doc.text("APPROVALS / APROBARI", 20, finalY + 10);
    
    // Grid lines for signature box
    doc.line(74, finalY, 74, finalY + 50); // Vertical 1
    doc.line(134, finalY, 134, finalY + 50); // Vertical 2
    doc.line(14, finalY + 25, 196, finalY + 25); // Horizontal Middle

    // Labels
    doc.setFontSize(9);
    doc.text("Date Created:", 20, finalY + 18);
    doc.text(vaMetadata.dateCreated, 20, finalY + 23);
    
    doc.text("Created by:", 80, finalY + 15);
    doc.text(vaMetadata.createdBy, 80, finalY + 20);
    doc.text("Signature: _____________", 80, finalY + 24);

    doc.text("Checked by:", 140, finalY + 15);
    doc.text("Signature: _____________", 140, finalY + 24);

    doc.text("Approved by:", 20, finalY + 35);
    doc.text(vaMetadata.approvedBy, 20, finalY + 40);
    doc.text("Signature: _____________", 20, finalY + 45);

    doc.text("Version:", 80, finalY + 35);
    doc.text(vaMetadata.version, 80, finalY + 40);

    doc.text("Release Date:", 140, finalY + 35);
    doc.text(vaMetadata.releaseDate || "___________", 140, finalY + 40);

    doc.save(`${masterFilename}.pdf`);
    alert(t.masterGenerated);
  };

  const isMasterDisabled = generatedDocuments.length === 0;

  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <FileCheck className="text-preh-petrol" />
        {t[2.1]} {t.VISUAL_AIDS}
      </h2>

      {/* Read-Only Table with Checkboxes */}
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 font-semibold sticky top-0 shadow-sm">
            <tr>
              <th className="p-3 border-b dark:border-gray-700 w-16 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold">PDF</span>
                  <input 
                    type="checkbox" 
                    checked={allSelected('pdf')}
                    onChange={() => toggleAll('pdf', allSelected('pdf'))}
                    className="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-preh-petrol"
                  />
                </div>
              </th>
              <th className="p-3 border-b dark:border-gray-700 w-16 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold">DOCX</span>
                  <input 
                    type="checkbox" 
                    checked={allSelected('docx')}
                    onChange={() => toggleAll('docx', allSelected('docx'))}
                    className="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-preh-petrol"
                  />
                </div>
              </th>
              <th className="p-3 border-b dark:border-gray-700 w-16 text-center">Color</th>
              <th className="p-3 border-b dark:border-gray-700">{t.station}</th>
              <th className="p-3 border-b dark:border-gray-700">{t.material}</th>
              <th className="p-3 border-b dark:border-gray-700">{t.desc}</th>
              <th className="p-3 border-b dark:border-gray-700 w-24 text-center">{t.picture}</th>
            </tr>
          </thead>
          <tbody>
            {bomItems.map((item, idx) => (
              <tr key={item.id} className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <td className="p-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={!!selection[item.id]?.pdf}
                    onChange={() => toggleSelection(item.id, 'pdf')}
                    className="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-preh-petrol h-4 w-4"
                  />
                </td>
                <td className="p-3 text-center">
                  <input 
                    type="checkbox" 
                    checked={!!selection[item.id]?.docx}
                    onChange={() => toggleSelection(item.id, 'docx')}
                    className="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-preh-petrol h-4 w-4"
                  />
                </td>
                <td className="p-2 text-center">
                  <input 
                    type="color" 
                    value={item.visualAidBgColor || '#CCFFFF'}
                    onChange={(e) => handleColorChange(item.id, e.target.value)}
                    className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer rounded overflow-hidden"
                    title="Background Color for Visual Aid Card"
                  />
                </td>
                <td className="p-3 font-medium text-gray-900 dark:text-white">{item.station}</td>
                <td className="p-3 text-preh-petrol dark:text-preh-light-blue font-mono">{item.partNumber}</td>
                <td className="p-3 text-gray-900 dark:text-white">{item.description}</td>
                <td className="p-2 text-center">
                  {item.image ? <img src={item.image} alt="Part" className="h-8 w-8 object-contain mx-auto border rounded bg-white" /> : <div className="h-8 w-8 mx-auto bg-gray-200 rounded flex items-center justify-center text-gray-400"><ImageIcon size={14} /></div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Metadata Form */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-1">{t.vaDateCreated}</label>
          <input type="date" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={vaMetadata.dateCreated} onChange={(e) => setVaMetadata({...vaMetadata, dateCreated: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-1">{t.vaCreatedBy}</label>
          <input type="text" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={vaMetadata.createdBy} onChange={(e) => setVaMetadata({...vaMetadata, createdBy: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-1">{t.vaCheckedBy}</label>
          <input type="text" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={vaMetadata.checkedBy} onChange={(e) => setVaMetadata({...vaMetadata, checkedBy: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-1">{t.vaApprovedBy}</label>
          <input type="text" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={vaMetadata.approvedBy} onChange={(e) => setVaMetadata({...vaMetadata, approvedBy: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 uppercase mb-1">{t.vaReleaseDate}</label>
          <input type="date" className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={vaMetadata.releaseDate} onChange={(e) => setVaMetadata({...vaMetadata, releaseDate: e.target.value})} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button 
          onClick={generateStationDocuments} 
          disabled={isGenerating || bomItems.length === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium shadow-md transition-all ${
            isGenerating || bomItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-preh-petrol hover:bg-preh-petrol-dark'
          }`}
        >
          {isGenerating ? t.generatingDocs : <><FileText size={20} /> {t.exportVisualAids}</>}
        </button>

        <button 
          onClick={generateMasterDocument}
          disabled={isMasterDisabled}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium shadow-md transition-all ${
            isMasterDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <FileCheck size={20} />
          {t.exportMaster}
        </button>
      </div>
    </div>
  );
};

// --- 7# PFMEA ---
export const PfmeaView: React.FC<ViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">PFMEA</h2>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          <tr>
            <th className="p-3 rounded-tl-lg">{t.processStep}</th>
            <th className="p-3">{t.failureMode}</th>
            <th className="p-3 w-12 text-center" title="Severity">{t.severity}</th>
            <th className="p-3 w-12 text-center" title="Occurrence">{t.occurrence}</th>
            <th className="p-3 w-12 text-center" title="Detection">{t.detection}</th>
            <th className="p-3 w-16 text-center font-bold" title="Risk Priority Number">{t.rpn}</th>
            <th className="p-3 rounded-tr-lg">{t.action}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {MOCK_PFMEA.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 font-medium dark:text-white">{item.processStep}</td>
              <td className="p-3 text-red-600 dark:text-red-400">{item.failureMode}</td>
              <td className="p-3 text-center dark:text-gray-300">{item.severity}</td>
              <td className="p-3 text-center dark:text-gray-300">{item.occurrence}</td>
              <td className="p-3 text-center dark:text-gray-300">{item.detection}</td>
              <td className={`p-3 text-center font-bold ${item.rpn > 80 ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>{item.rpn}</td>
              <td className="p-3 text-gray-600 dark:text-gray-400 italic">{item.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- 4# Equipment ---
export const EquipmentView: React.FC<ViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t[4]}</h2>
      <div className="grid gap-4">
        {MOCK_EQUIPMENT.map(eq => (
          <div key={eq.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800/50">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">{eq.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.model}: {eq.model} • S/N: {eq.serialNumber}</p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                eq.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                eq.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {eq.status}
              </span>
              <p className="text-xs text-gray-400 mt-1">{t.maintenance}: {eq.maintenanceDue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 11# Capacity ---
export const CapacityView: React.FC<ViewProps> = ({ language, isDarkMode }) => {
  const t = TRANSLATIONS[language];
  const data = [
    { name: 'SMT Line 1', capacity: 100, load: 85 },
    { name: 'SMT Line 2', capacity: 100, load: 92 },
    { name: 'THT Line', capacity: 80, load: 60 },
    { name: 'Assembly', capacity: 120, load: 95 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-preh-dark-surface p-6 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">{t.capUtil}</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                  borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                  color: isDarkMode ? '#f3f4f6' : '#1f2937'
                }}
              />
              <Legend />
              <Bar dataKey="capacity" fill={isDarkMode ? '#53738c' : '#e5e7eb'} name={t.totalCap} />
              <Bar dataKey="load" fill="#37819f" name={t.reqLoad} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
        <p>{t.capAnalysis}</p>
      </div>
    </div>
  );
};

// --- Generic Placeholder ---
export const GenericDocView: React.FC<{title: string, language: Language}> = ({ title, language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm p-8 text-center h-full flex flex-col items-center justify-center">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
        <FileText size={48} className="text-gray-300 dark:text-gray-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t.docRepo}</p>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 w-full max-w-lg bg-gray-50 dark:bg-gray-800/50">
        <p className="text-gray-400 dark:text-gray-500 mb-4">{t.noDocs}</p>
        <button className="bg-preh-petrol text-white px-4 py-2 rounded hover:bg-preh-petrol-dark transition-colors">
          {t.uploadBtn}
        </button>
      </div>
    </div>
  );
};
