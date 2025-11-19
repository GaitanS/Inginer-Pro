import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../translations';

const data = [
  { name: 'Mon', output: 4000, defects: 24 },
  { name: 'Tue', output: 3000, defects: 13 },
  { name: 'Wed', output: 2000, defects: 98 },
  { name: 'Thu', output: 2780, defects: 39 },
  { name: 'Fri', output: 1890, defects: 48 },
  { name: 'Sat', output: 2390, defects: 38 },
  { name: 'Sun', output: 3490, defects: 43 },
];

const CustomTooltip = ({ active, payload, label, language }: any) => {
  const t = TRANSLATIONS[language];
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg z-50">
        <p className="text-sm font-bold text-gray-700 mb-1">{label}</p>
        <div className="text-sm text-blue-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          {t.output}: <span className="font-semibold">{payload[0].value.toLocaleString()}</span>
        </div>
        {payload[1] && (
           <div className="text-sm text-red-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            {t.defects}: <span className="font-semibold">{payload[1].value}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface DashboardViewProps {
  language: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Activity size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">{t.oee}</p>
            <p className="text-xl font-bold">87.5%</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">{t.defectRate}</p>
            <p className="text-xl font-bold">1.2%</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-100 rounded-full text-green-600"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">{t.unitsProduced}</p>
            <p className="text-xl font-bold">12,450</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-yellow-100 rounded-full text-yellow-600"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">{t.uptime}</p>
            <p className="text-xl font-bold">98.2%</p>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Production Trend - Enhanced Interactive Area Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{t.prodTrend}</h3>
            <select className="text-xs border border-gray-300 rounded p-1 bg-gray-50">
              <option>{t.last7Days}</option>
              <option>{t.last30Days}</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip language={language} />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }} />
                <Legend />
                <Area 
                  name={t.output}
                  type="monotone" 
                  dataKey="output" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOutput)" 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defect Analysis */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t.defectsDay}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#fef2f2' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  name={t.defects}
                  dataKey="defects" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};