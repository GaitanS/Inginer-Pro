import React, { useState, useRef } from 'react';
import { Task, Language } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { GripVertical, CheckCircle, Circle, RefreshCw, MessageSquare, User, Calendar as CalendarIcon, ArrowUp } from 'lucide-react';

interface TaskPrioritizationViewProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  language: Language;
}

export const TaskPrioritizationView: React.FC<TaskPrioritizationViewProps> = ({ tasks, onUpdateTasks, language }) => {
  const t = TRANSLATIONS[language];
  const [isSyncing, setIsSyncing] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    e.currentTarget.classList.add('opacity-50', 'bg-preh-light-blue/10', 'dark:bg-preh-petrol/30');
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'bg-preh-light-blue/10', 'dark:bg-preh-petrol/30');
    
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copyListItems = [...tasks];
      const dragItemContent = copyListItems[dragItem.current];
      copyListItems.splice(dragItem.current, 1);
      copyListItems.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      onUpdateTasks(copyListItems);
    }
  };

  const simulateTeamsSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const newTeamsTasks: Task[] = [
        { 
          id: `teams-${Date.now()}-1`, 
          title: 'Review Production Schedule w/ Plant Manager', 
          assignee: 'Teams Planner', 
          priority: 'High', 
          source: 'Teams', 
          status: 'To Do', 
          dueDate: '2024-04-02' 
        },
        { 
          id: `teams-${Date.now()}-2`, 
          title: 'Update Safety Compliance Docs', 
          assignee: 'Safety Team', 
          priority: 'Medium', 
          source: 'Teams', 
          status: 'To Do', 
          dueDate: '2024-04-05' 
        }
      ];
      
      onUpdateTasks([...newTeamsTasks, ...tasks]);
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-preh-dark-surface p-6 rounded-lg border border-gray-200 dark:border-preh-dark-border shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.priorityWidgetTitle}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dragToReorder}</p>
          </div>
          <button 
            onClick={simulateTeamsSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded shadow-sm text-white transition-colors font-medium ${
              isSyncing ? 'bg-preh-petrol/70 cursor-not-allowed' : 'bg-preh-petrol hover:bg-preh-grey-blue'
            }`}
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? t.syncing : t.syncTeams}
          </button>
        </div>

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex items-center gap-4 hover:shadow-md hover:border-preh-light-blue dark:hover:border-preh-petrol transition-all cursor-move"
            >
              <div className="text-gray-300 dark:text-gray-600 cursor-move group-hover:text-preh-petrol dark:group-hover:text-preh-light-blue">
                <GripVertical size={20} />
              </div>
              
              <div className="flex-shrink-0">
                {task.status === 'Done' ? (
                  <CheckCircle size={22} className="text-green-500 dark:text-green-400" />
                ) : (
                  <Circle size={22} className="text-gray-300 dark:text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className={`font-semibold text-base truncate ${task.status === 'Done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                    {task.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2 ${
                    task.priority === 'High' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                    task.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-gray-400 dark:text-gray-500" />
                    {task.assignee}
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-gray-400 dark:text-gray-500" />
                      {task.dueDate}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border ${
                  task.source === 'Teams' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800' 
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600'
                }`}>
                  {task.source === 'Teams' ? (
                    <MessageSquare size={14} />
                  ) : (
                    <ArrowUp size={14} className="rotate-45" />
                  )}
                  {task.source === 'Teams' ? t.taskSourceTeams : t.taskSourceProMan}
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              {t.noHighPriorityTasks}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};