import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { Language, Task } from '../../types';
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

const CustomTooltip = ({ active, payload, label, language, isDarkMode }: any) => {
  const t = TRANSLATIONS[language];
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 border shadow-lg rounded-lg z-50 ${
        isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
      }`}>
        <p className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>{label}</p>
        <div className="text-sm text-preh-petrol dark:text-preh-light-blue flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-preh-petrol dark:bg-preh-light-blue"></span>
          <span>{t.output}:</span>
          <span className="font-semibold">{payload[0].value.toLocaleString()}</span>
        </div>
        {payload[1] && (
           <div className="text-sm text-red-500 dark:text-red-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>{t.defects}:</span>
            <span className="font-semibold">{payload[1].value}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface DashboardViewProps {
  language: Language;
  tasks?: Task[];
  isDarkMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ language, tasks = [], isDarkMode = false }) => {
  const t = TRANSLATIONS[language];

  // Get top 3 high priority or normal tasks that aren't done
  const topTasks = tasks
    .filter(task => task.status !== 'Done')
    .slice(0, 3);

  // Chart colors
  const axisColor = isDarkMode ? '#9ca3af' : '#6b7280';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipCursorColor = isDarkMode ? '#4b5563' : '#d1d5db';

  return (
    <div className="space-y-6 pb-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-preh-dark-surface p-5 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-3 bg-preh-light-blue/10 dark:bg-preh-petrol/20 rounded-full text-preh-petrol dark:text-preh-light-blue"><Activity size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.oee}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">87.5%</p>
          </div>
        </div>
        <div className="bg-white dark:bg-preh-dark-surface p-5 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.defectRate}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">1.2%</p>
          </div>
        </div>
        <div className="bg-white dark:bg-preh-dark-surface p-5 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.unitsProduced}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">12,450</p>
          </div>
        </div>
        <div className="bg-white dark:bg-preh-dark-surface p-5 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm flex items-center space-x-4 hover:shadow-md transition-all">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-full text-yellow-600 dark:text-yellow-400"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.uptime}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">98.2%</p>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Production Trend */}
        <div className="bg-white dark:bg-preh-dark-surface p-6 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-100">{t.prodTrend}</h3>
            <select className="text-xs border border-gray-300 dark:border-gray-600 rounded p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-preh-petrol">
              <option>{t.last7Days}</option>
              <option>{t.last30Days}</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDarkMode ? '#70c6e4' : '#37819f'} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={isDarkMode ? '#70c6e4' : '#37819f'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: axisColor, fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: axisColor, fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip language={language} isDarkMode={isDarkMode} />} cursor={{ stroke: tooltipCursorColor, strokeWidth: 1, strokeDasharray: '5 5' }} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }} 
                  formatter={(value) => <span style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>{value}</span>}
                />
                <Area 
                  name={t.output}
                  type="monotone" 
                  dataKey="output" 
                  stroke={isDarkMode ? '#70c6e4' : '#37819f'} 
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
        <div className="bg-white dark:bg-preh-dark-surface p-6 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-700 dark:text-gray-100">{t.defectsDay}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: axisColor, fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: axisColor, fontSize: 12 }}
                />
                <Tooltip 
                   cursor={{ fill: isDarkMode ? '#374151' : '#f3f4f6' }}
                   content={<CustomTooltip language={language} isDarkMode={isDarkMode} />}
                />
                <Legend 
                   wrapperStyle={{ paddingTop: '20px' }}
                   formatter={(value) => <span style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>{value}</span>}
                />
                <Bar 
                  name={t.defects}
                  dataKey="defects" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Task Priority Widget */}
      <div className="bg-white dark:bg-preh-dark-surface p-6 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-700 dark:text-gray-100">
            <AlertCircle className="text-preh-dark-yellow" size={20} />
            {t.priorityWidgetTitle}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600">
             {t.dragToReorder} ({tasks.filter(t => t.status !== 'Done').length} pending)
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {topTasks.length > 0 ? (
            topTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex items-center gap-3">
                   <div className={`w-1 h-10 rounded-full ${
                     task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-preh-petrol'
                   }`}></div>
                   <div>
                     <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{task.title}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                       {task.source === 'Teams' && <MessageSquare size={10} className="text-indigo-500 dark:text-indigo-400"/>}
                       {task.source === 'Teams' ? t.taskSourceTeams : t.taskSourceProMan} • Due: {task.dueDate}
                     </p>
                   </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded font-bold ${
                  task.priority === 'High' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm italic">{t.noHighPriorityTasks}</div>
          )}
        </div>
      </div>
    </div>
  );
};