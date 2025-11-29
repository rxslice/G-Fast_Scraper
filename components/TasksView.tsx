import React, { useState } from 'react';
import { Task } from '../types';
import { CalendarIcon, CheckCircleIcon, TrashIcon } from './Icons';

interface Props {
  tasks: Task[];
  onAddTask: (title: string, priority: Task['priority']) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksView: React.FC<Props> = ({ tasks, onAddTask, onToggleTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('Normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
        onAddTask(newTaskTitle, newTaskPriority);
        setNewTaskTitle("");
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Tasks & Follow-ups</h1>
                <p className="text-slate-500">Manage your outreach schedule and to-dos.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
                {pendingTasks.length} Pending / {completedTasks.length} Completed
            </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex gap-4">
            <div className="flex-1">
                <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..." 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <select 
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-600"
            >
                <option value="High">High Priority</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low Priority</option>
            </select>
            <button 
                type="submit" 
                disabled={!newTaskTitle.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Add Task
            </button>
        </form>

        <div className="space-y-6">
            {/* Pending Tasks */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    Pending ({pendingTasks.length})
                </h3>
                {pendingTasks.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                        No pending tasks. You're all caught up!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingTasks.map(task => (
                            <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 mt-8 flex items-center gap-2">
                        Completed ({completedTasks.length})
                    </h3>
                    <div className="space-y-3 opacity-60">
                        {completedTasks.map(task => (
                            <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: Task, onToggle: (id: string) => void, onDelete: (id: string) => void }> = ({ task, onToggle, onDelete }) => {
    const priorityColor = {
        High: 'text-red-600 bg-red-50 border-red-100',
        Normal: 'text-blue-600 bg-blue-50 border-blue-100',
        Low: 'text-slate-600 bg-slate-100 border-slate-200'
    };

    return (
        <div className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 group transition-all ${task.completed ? 'bg-slate-50' : 'hover:border-blue-300'}`}>
            <button 
                onClick={() => onToggle(task.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-emerald-500'}`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </button>
            
            <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    {task.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {task.leadName && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[200px]">
                            Related to: {task.leadName}
                        </span>
                    )}
                </div>
            </div>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityColor[task.priority]}`}>
                {task.priority}
            </span>

            <button 
                onClick={() => onDelete(task.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
};