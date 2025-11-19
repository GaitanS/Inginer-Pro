import React from 'react';
import { MOCK_BOM, MOCK_EQUIPMENT, MOCK_PFMEA } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../translations';

interface ViewProps {
  language: Language;
}

// --- 2# BOM ---
export const BomView: React.FC<ViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="font-bold text-lg">{t.BOM}</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">{t.exportCsv}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold">
            <tr>
              <th className="p-3 border-b">{t.partNumber}</th>
              <th className="p-3 border-b">{t.description}</th>
              <th className="p-3 border-b">{t.quantity}</th>
              <th className="p-3 border-b">{t.unit}</th>
              <th className="p-3 border-b">{t.supplier}</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_BOM.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3 border-b font-mono text-blue-600">{item.partNumber}</td>
                <td className="p-3 border-b">{item.description}</td>
                <td className="p-3 border-b">{item.quantity}</td>
                <td className="p-3 border-b">{item.unit}</td>
                <td className="p-3 border-b">{item.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 7# PFMEA ---
export const PfmeaView: React.FC<ViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-bold text-lg">{t.PFMEA}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold">
            <tr>
              <th className="p-3 border-b">{t.processStep}</th>
              <th className="p-3 border-b">{t.failureMode}</th>
              <th className="p-3 border-b text-center bg-yellow-50">{t.severity}</th>
              <th className="p-3 border-b text-center bg-yellow-50">{t.occurrence}</th>
              <th className="p-3 border-b text-center bg-yellow-50">{t.detection}</th>
              <th className="p-3 border-b text-center bg-red-50 font-bold">{t.rpn}</th>
              <th className="p-3 border-b">{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PFMEA.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3 border-b font-medium">{item.processStep}</td>
                <td className="p-3 border-b text-red-600">{item.failureMode}</td>
                <td className="p-3 border-b text-center">{item.severity}</td>
                <td className="p-3 border-b text-center">{item.occurrence}</td>
                <td className="p-3 border-b text-center">{item.detection}</td>
                <td className={`p-3 border-b text-center font-bold ${item.rpn > 80 ? 'bg-red-100 text-red-800' : 'bg-green-50'}`}>
                  {item.rpn}
                </td>
                <td className="p-3 border-b">{item.action}</td>
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
        <div key={eq.id} className="bg-white p-4 rounded border border-gray-200 flex justify-between items-center shadow-sm">
          <div>
            <h4 className="font-bold text-lg">{eq.name}</h4>
            <p className="text-gray-500 text-sm">{eq.model} • {eq.serialNumber}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              eq.status === 'Active' ? 'bg-green-100 text-green-800' :
              eq.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {eq.status}
            </span>
            <p className="text-xs text-gray-400 mt-1">{t.maintenance}: {eq.maintenanceDue}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- 11# Capacity ---
export const CapacityView: React.FC<ViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const capData = [
    { name: 'SMT Line 1', required: 85, available: 100 },
    { name: 'SMT Line 2', required: 92, available: 100 },
    { name: 'Assembly', required: 60, available: 100 },
    { name: 'Testing', required: 45, available: 100 },
    { name: 'Packaging', required: 78, available: 100 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{t.capUtil}</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={capData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="available" fill="#e5e7eb" name={t.totalCap} />
            <Bar dataKey="required" fill="#3b82f6" name={t.reqLoad} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded border border-blue-200 text-sm">
        {t.capAnalysis}
      </div>
    </div>
  );
};

interface GenericDocViewProps extends ViewProps {
  title: string;
}

// --- Generic Placeholder for other technical views ---
export const GenericDocView: React.FC<GenericDocViewProps> = ({ title, language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="space-y-4">
      <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300 text-center">
        <div className="text-gray-400 mb-2">{t.docRepo}</div>
        <h2 className="text-xl font-bold text-gray-700">{title}</h2>
        <p className="text-sm text-gray-500 mt-2">{t.noDocs}</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t.uploadBtn}</button>
      </div>
    </div>
  );
};