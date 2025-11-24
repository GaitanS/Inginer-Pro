import React, { useState, useRef } from 'react';
import { MOCK_BOM, MOCK_EQUIPMENT, MOCK_PFMEA, MOCK_HISTORY } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Language, BomItem, DocHistoryItem } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { Download, Upload, FileSpreadsheet, Image as ImageIcon, Search, Plus, Trash2, Minus } from 'lucide-react';

// NOTE: ExcelJS and PapaParse are loaded globally via CDN in index.html
declare global {
  interface Window {
    ExcelJS: any;
    Papa: any;
  }
}

interface ViewProps {
  language: Language;
  isDarkMode?: boolean;
}

// --- 2# BOM ---
export const BomView: React.FC<ViewProps> = ({ language, isDarkMode }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'BOM' | 'HISTORY'>('BOM');
  const [bomItems, setBomItems] = useState<BomItem[]>(MOCK_BOM);
  const [historyItems, setHistoryItems] = useState<DocHistoryItem[]>(MOCK_HISTORY);
  const [variantKeys, setVariantKeys] = useState<string[]>(
    Array.from(new Set(MOCK_BOM.flatMap(item => Object.keys(item.variants))))
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sapInputRef = useRef<HTMLInputElement>(null);
  const [activeImageRowId, setActiveImageRowId] = useState<string | null>(null);

  // --- Handlers for SAP Import ---
  const handleSapImportClick = () => {
    sapInputRef.current?.click();
  };

  const handleSapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use PapaParse to parse the CSV
    if (window.Papa) {
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const newItems: BomItem[] = [];
          
          results.data.forEach((row: any) => {
            // Filter logic: Explosion level must be ".1"
            // Note: CSV keys might be quoted or have spaces, trim them
            const explosionLevel = row['Explosion level']?.trim() || row['"Explosion level"']?.trim();
            
            if (explosionLevel === '.1') {
              // Mapping fields
              // 'Component number' -> partNumber
              // 'Object description' -> description
              // 'Comp. Qty (CUn)' -> quantity
              // 'Item Number' -> station
              
              const item: BomItem = {
                id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                station: row['Item Number'] || '', 
                partNumber: row['Component number'] || '',
                description: row['Object description'] || '',
                quantity: parseFloat(row['Comp. Qty (CUn)']) || 0,
                variants: {}
              };
              
              // Initialize variants as empty for new imported items
              variantKeys.forEach(key => item.variants[key] = false);
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
    } else {
      alert("CSV Parser not loaded. Please refresh.");
    }
    
    if (sapInputRef.current) sapInputRef.current.value = '';
  };

  // --- Handlers for Excel Export (Advanced with Images) ---
  const handleExport = async () => {
    if (!window.ExcelJS) {
      alert("Excel exporter not loaded yet.");
      return;
    }

    const workbook = new window.ExcelJS.Workbook();
    
    // 1. Create BOM Sheet
    const bomSheet = workbook.addWorksheet('BOM');
    
    // Define Columns
    const columns = [
      { header: t.station, key: 'station', width: 15 },
      { header: t.material, key: 'material', width: 20 },
      { header: t.qty, key: 'quantity', width: 10 },
      { header: t.desc, key: 'description', width: 30 },
      { header: t.picture, key: 'picture', width: 15 },
      ...variantKeys.map(v => ({ header: v, key: v, width: 15 }))
    ];
    bomSheet.columns = columns;

    // Add Data Rows
    for (const item of bomItems) {
      const rowValues: any = {
        station: item.station,
        material: item.partNumber,
        quantity: item.quantity,
        description: item.description,
        picture: '', // Placeholder, image added separately
      };
      variantKeys.forEach(key => {
        rowValues[key] = item.variants[key] ? 'X' : '';
      });

      const row = bomSheet.addRow(rowValues);
      
      // If image exists, add it to the sheet
      if (item.image) {
        row.height = 50; // Increase height for image
        try {
           // Convert base64 to imageId
           // Assuming item.image is like "data:image/png;base64,..."
           const imageId = workbook.addImage({
             base64: item.image,
             extension: 'png',
           });
           
           // Calculate column index for 'picture' (it's the 5th column, index 4)
           bomSheet.addImage(imageId, {
             tl: { col: 4, row: row.number - 1 }, // Top-left: col 4 (E), row index (0-based)
             br: { col: 5, row: row.number }      // Bottom-right
           });
        } catch (e) {
          console.error("Error adding image to excel", e);
        }
      }
      
      // Style cells (center text)
      row.eachCell((cell: any) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }

    // Style Header
    bomSheet.getRow(1).font = { bold: true };
    bomSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // 2. Create History Sheet
    const historySheet = workbook.addWorksheet('document history');
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
      historySheet.addRow({
        version: item.version,
        register: item.register,
        changes: item.changes,
        created: item.created,
        dateCreated: item.dateCreated,
        released: item.released,
        dateReleased: item.dateReleased
      });
    });

    historySheet.getRow(1).font = { bold: true };

    // Write and Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "InginerPRO_BOM_Master.xlsx";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddRow = () => {
    const newItem: BomItem = {
      id: `new-${Date.now()}`,
      station: '',
      partNumber: '',
      quantity: 0,
      description: '',
      variants: {}
    };
    variantKeys.forEach(key => newItem.variants[key] = false);
    setBomItems(prev => [...prev, newItem]);
  };

  const handleDeleteRow = (id: string) => {
    // Functional update ensures state is fresh. Removing confirm for immediate action.
    setBomItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddColumn = () => {
    const newColName = prompt(t.newVariant);
    if (newColName && !variantKeys.includes(newColName)) {
      setVariantKeys(prev => [...prev, newColName]);
      setBomItems(prevItems => prevItems.map(item => ({
        ...item,
        variants: { ...item.variants, [newColName]: false }
      })));
    }
  };

  const handleDeleteColumn = (keyToRemove: string) => {
    // Functional update + Data cleanup
    setVariantKeys(prev => prev.filter(key => key !== keyToRemove));
    setBomItems(prevItems => prevItems.map(item => {
      const newVariants = { ...item.variants };
      delete newVariants[keyToRemove];
      return { ...item, variants: newVariants };
    }));
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
    const newItem: DocHistoryItem = {
      id: `hist-${Date.now()}`,
      version: '',
      register: 'Formular BOM',
      changes: '',
      created: '',
      dateCreated: '',
      released: '',
      dateReleased: ''
    };
    setHistoryItems(prev => [...prev, newItem]);
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
            <button 
              onClick={handleSapImportClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors shadow-sm"
              title="Imports only items with Explosion level .1"
            >
              <Upload size={16} />
              {t.importSap}
            </button>
          )}
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors shadow-sm"
          >
            <Download size={16} />
            {t.exportCsv}
          </button>
        </div>
      </div>
      
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={sapInputRef} 
        onChange={handleSapFileChange} 
        className="hidden" 
        accept=".csv"
      />

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative">
        {activeTab === 'BOM' ? (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap w-24 text-center border-r">{t.station}</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap w-40 border-r">{t.material}</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap w-16 text-center border-r">{t.qty}</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap min-w-[200px] border-r">{t.desc}</th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap w-24 text-center border-r">{t.picture}</th>
                {variantKeys.map(key => (
                  <th key={key} className="p-2 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap text-center min-w-[100px] text-xs bg-preh-light-blue/10 dark:bg-preh-petrol/20 text-preh-petrol dark:text-preh-light-blue border-r border-gray-200 dark:border-gray-700 group relative">
                    <div className="flex items-center justify-between gap-1 px-1">
                      <span>{key}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteColumn(key);
                        }}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded p-0.5 transition-colors"
                        title={t.deleteColumn}
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="p-2 border-b border-gray-200 dark:border-gray-700 w-10 bg-gray-100 dark:bg-gray-800">
                  <button onClick={handleAddColumn} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-preh-petrol" title={t.addColumn}>
                    <Plus size={18} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {bomItems.map((item, idx) => (
                <tr key={item.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                    <input 
                       type="text" 
                       value={item.station}
                       onChange={(e) => handleBomTextChange(item.id, 'station', e.target.value)}
                       className="w-full h-full p-3 bg-transparent text-center font-bold text-gray-600 dark:text-gray-400 focus:bg-blue-50 focus:outline-none"
                    />
                  </td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                    <input 
                       type="text" 
                       value={item.partNumber}
                       onChange={(e) => handleBomTextChange(item.id, 'partNumber', e.target.value)}
                       className="w-full h-full p-3 bg-transparent font-mono text-preh-petrol dark:text-preh-light-blue font-medium focus:bg-blue-50 focus:outline-none"
                    />
                  </td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                    <input 
                       type="number" 
                       value={item.quantity}
                       onChange={(e) => handleBomTextChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                       className="w-full h-full p-3 bg-transparent text-center font-bold text-gray-700 dark:text-gray-300 focus:bg-blue-50 focus:outline-none"
                    />
                  </td>
                  <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                    <input 
                       type="text" 
                       value={item.description}
                       onChange={(e) => handleBomTextChange(item.id, 'description', e.target.value)}
                       className="w-full h-full p-3 bg-transparent text-gray-800 dark:text-gray-200 font-medium focus:bg-blue-50 focus:outline-none"
                    />
                  </td>
                  <td 
                    className="p-2 border-r border-gray-100 dark:border-gray-700 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleImageClick(item.id)}
                    title="Click to upload image"
                  >
                    {item.image ? (
                       <img src={item.image} alt="Part" className="h-10 w-10 object-contain mx-auto rounded border border-gray-200 bg-white" />
                    ) : (
                       <div className="h-8 w-8 mx-auto bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                         <ImageIcon size={16} />
                       </div>
                    )}
                  </td>
                  {variantKeys.map(key => (
                    <td 
                      key={key} 
                      onDoubleClick={() => handleVariantToggle(item.id, key)}
                      className="p-3 border-r border-gray-100 dark:border-gray-700 text-center cursor-pointer select-none hover:bg-blue-50 dark:hover:bg-gray-700"
                    >
                      {item.variants[key] ? (
                        <span className="font-bold text-lg text-preh-petrol dark:text-preh-light-blue">X</span>
                      ) : null}
                    </td>
                  ))}
                  <td className="p-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRow(item.id);
                      }}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      title={t.deleteRow}
                    >
                      <Minus size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                 <td colSpan={5 + variantKeys.length + 1} className="p-2 bg-gray-50 dark:bg-gray-900">
                    <button 
                      onClick={handleAddRow}
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-preh-petrol p-2"
                    >
                       <Plus size={14} /> {t.addRow}
                    </button>
                 </td>
              </tr>
            </tbody>
          </table>
        ) : (
          // HISTORY SHEET
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
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                       <input 
                         className="w-full h-full p-3 text-center bg-transparent focus:bg-blue-50 focus:outline-none"
                         value={item.version}
                         onChange={(e) => handleHistoryChange(item.id, 'version', e.target.value)}
                       />
                    </td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                       <input 
                         className="w-full h-full p-3 bg-transparent focus:bg-blue-50 focus:outline-none"
                         value={item.register}
                         onChange={(e) => handleHistoryChange(item.id, 'register', e.target.value)}
                       />
                    </td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                       <textarea 
                         className="w-full h-full p-3 bg-transparent focus:bg-blue-50 focus:outline-none resize-none"
                         rows={2}
                         value={item.changes}
                         onChange={(e) => handleHistoryChange(item.id, 'changes', e.target.value)}
                       />
                    </td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                       <input 
                         className="w-full h-full p-3 bg-transparent focus:bg-blue-50 focus:outline-none"
                         value={item.created}
                         onChange={(e) => handleHistoryChange(item.id, 'created', e.target.value)}
                       />
                    </td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                       <input 
                         className="w-full h-full p-3 text-center bg-transparent focus:bg-blue-50 focus:outline-none"
                         value={item.dateCreated}
                         onChange={(e) => handleHistoryChange(item.id, 'dateCreated', e.target.value)}
                       />
                    </td>
                    <td className="p-0 border-r border-gray-100 dark:border-gray-700">
                       <input 
                         className="w-full h-full p-3 bg-transparent focus:bg-blue-50 focus:outline-none"
                         value={item.released}
                         onChange={(e) => handleHistoryChange(item.id, 'released', e.target.value)}
                       />
                    </td>
                    <td className="p-0">
                       <input 
                         className="w-full h-full p-3 text-center bg-transparent focus:bg-blue-50 focus:outline-none"
                         value={item.dateReleased}
                         onChange={(e) => handleHistoryChange(item.id, 'dateReleased', e.target.value)}
                       />
                    </td>
                 </tr>
               ))}
               <tr>
                 <td colSpan={7} className="p-2 bg-gray-50 dark:bg-gray-900">
                    <button 
                      onClick={handleAddHistoryRow}
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-preh-petrol p-2"
                    >
                       <Plus size={14} /> {t.addRow}
                    </button>
                 </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Excel-style Tabs at Bottom */}
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
        <button onClick={handleAddRow} className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 self-center" title="New Sheet (Mock)">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

// --- 7# PFMEA ---
export const PfmeaView: React.FC<ViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="bg-white dark:bg-preh-dark-surface rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm overflow-hidden transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-preh-dark-border bg-gray-50 dark:bg-gray-800">
        <h2 className="font-bold text-lg text-gray-800 dark:text-white">{t.PFMEA}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-semibold">
            <tr>
              <th className="p-3 border-b dark:border-gray-700">{t.processStep}</th>
              <th className="p-3 border-b dark:border-gray-700">{t.failureMode}</th>
              <th className="p-3 border-b dark:border-gray-700 text-center bg-yellow-50/50 dark:bg-yellow-900/20">{t.severity}</th>
              <th className="p-3 border-b dark:border-gray-700 text-center bg-yellow-50/50 dark:bg-yellow-900/20">{t.occurrence}</th>
              <th className="p-3 border-b dark:border-gray-700 text-center bg-yellow-50/50 dark:bg-yellow-900/20">{t.detection}</th>
              <th className="p-3 border-b dark:border-gray-700 text-center bg-red-50/50 dark:bg-red-900/20 font-bold">{t.rpn}</th>
              <th className="p-3 border-b dark:border-gray-700">{t.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {MOCK_PFMEA.map((item, idx) => (
              <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${idx % 2 === 0 ? 'bg-white dark:bg-preh-dark-surface' : 'bg-gray-50/30 dark:bg-gray-800/30'}`}>
                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{item.processStep}</td>
                <td className="p-3 text-red-600 dark:text-red-400 font-medium">{item.failureMode}</td>
                <td className="p-3 text-center text-gray-600 dark:text-gray-300">{item.severity}</td>
                <td className="p-3 text-center text-gray-600 dark:text-gray-300">{item.occurrence}</td>
                <td className="p-3 text-center text-gray-600 dark:text-gray-300">{item.detection}</td>
                <td className={`p-3 text-center font-bold border-l border-r border-transparent ${item.rpn > 80 ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200' : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'}`}>
                  {item.rpn}
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{item.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 4# Equipment ---
export const EquipmentView: React.FC<ViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="grid grid-cols-1 gap-4">
      {MOCK_EQUIPMENT.map((eq) => (
        <div key={eq.id} className="bg-white dark:bg-preh-dark-surface p-5 rounded-lg border border-gray-200 dark:border-preh-dark-border flex justify-between items-center shadow-sm hover:shadow-md transition-all">
          <div>
            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{eq.name}</h4>
            <div className="flex gap-3 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{eq.model}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{eq.serialNumber}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              eq.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              eq.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {eq.status}
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t.maintenance}: <span className="font-medium text-gray-600 dark:text-gray-300">{eq.maintenanceDue}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- 11# Capacity ---
export const CapacityView: React.FC<ViewProps> = ({ language, isDarkMode }) => {
  const t = TRANSLATIONS[language];
  const capData = [
    { name: 'SMT Line 1', required: 85, available: 100 },
    { name: 'SMT Line 2', required: 92, available: 100 },
    { name: 'Assembly', required: 60, available: 100 },
    { name: 'Testing', required: 45, available: 100 },
    { name: 'Packaging', required: 78, available: 100 },
  ];

  return (
    <div className="bg-white dark:bg-preh-dark-surface p-6 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm transition-colors">
      <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">{t.capUtil}</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={capData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
            <YAxis dataKey="name" type="category" tick={{ fill: isDarkMode ? '#d1d5db' : '#4b5563', fontWeight: 500 }} width={90} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                borderRadius: '8px'
              }}
              cursor={{fill: isDarkMode ? '#374151' : '#f3f4f6'}}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} formatter={(value) => <span style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>{value}</span>}/>
            <Bar dataKey="available" fill={isDarkMode ? '#4b5563' : '#e5e7eb'} name={t.totalCap} barSize={20} radius={[0, 4, 4, 0]} />
            <Bar dataKey="required" fill={isDarkMode ? '#70c6e4' : '#37819f'} name={t.reqLoad} barSize={20} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg border border-blue-100 dark:border-blue-800/50 text-sm flex gap-3">
        <div className="font-bold">Analysis:</div>
        <div>{t.capAnalysis}</div>
      </div>
    </div>
  );
};

interface GenericDocViewProps extends ViewProps {
  title: string;
}

export const GenericDocView: React.FC<GenericDocViewProps> = ({ title, language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-white dark:bg-preh-dark-surface p-10 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center transition-colors flex-1 flex flex-col items-center justify-center">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4 text-gray-400 dark:text-gray-500">
           <Search size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{t.noDocs}</p>
        <button className="mt-6 px-5 py-2.5 bg-preh-petrol text-white rounded-md font-medium hover:bg-preh-grey-blue transition-colors shadow-sm">
          {t.uploadBtn}
        </button>
      </div>
    </div>
  );
};