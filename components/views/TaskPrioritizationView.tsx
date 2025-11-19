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
    e.currentTarget.classList.add('opacity-50', 'bg-blue-50');
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'bg-blue-50');
    
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
      
      // Add new tasks to the top or merge
      onUpdateTasks([...newTeamsTasks, ...tasks]);
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t.priorityWidgetTitle}</h2>
            <p className="text-sm text-gray-500 mt-1">{t.dragToReorder}</p>
          </div>
          <button 
            onClick={simulateTeamsSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors ${
              isSyncing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
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
              className="group bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-move"
            >
              <div className="text-gray-400 cursor-move group-hover:text-gray-600">
                <GripVertical size={20} />
              </div>
              
              <div className="flex-shrink-0">
                {task.status === 'Done' ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <Circle size={20} className="text-gray-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold text-gray-800 truncate ${task.status === 'Done' ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    task.priority === 'High' ? 'bg-red-100 text-red-700' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    {task.assignee}
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {task.dueDate}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                  task.source === 'Teams' 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                    : 'bg-gray-50 text-gray-600 border-gray-100'
                }`}>
                  {task.source === 'Teams' ? (
                    <MessageSquare size={12} />
                  ) : (
                    <ArrowUp size={12} className="rotate-45" />
                  )}
                  {task.source === 'Teams' ? t.taskSourceTeams : t.taskSourceProMan}
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              {t.noHighPriorityTasks}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};