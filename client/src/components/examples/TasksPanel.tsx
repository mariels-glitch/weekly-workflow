import { useState } from 'react';
import TasksPanel from '../TasksPanel';
import type { Task } from '../TaskItem';
import type { TaskCategory } from '../TaskInput';

const initialTasks: Task[] = [
  { id: '1', title: 'Ship v1 of Smart Card MVP', category: 'Core', completed: false, timeEstimate: '2h', dayLabel: 'Mon' },
  { id: '2', title: 'Review Q4 strategy docs', category: 'Strategy', completed: true, dayLabel: 'Tue' },
  { id: '3', title: 'Interview frontend candidate', category: 'People', completed: false, dayLabel: 'Wed' },
  { id: '4', title: 'Update GTM timeline', category: 'Ops', completed: false, timeEstimate: '1h' },
  { id: '5', title: 'Prepare sprint demo', category: 'Core', completed: true },
];

export default function TasksPanelExample() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleAddTask = (title: string, category: TaskCategory) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      category,
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="p-4">
      <TasksPanel 
        tasks={tasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}
