import { useState } from 'react';
import TaskItem, { Task } from '../TaskItem';

export default function TaskItemExample() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Ship v1 of Smart Card MVP', category: 'Core', completed: false, timeEstimate: '2h' },
    { id: '2', title: 'Review Q4 strategy docs', category: 'Strategy', completed: true, dayLabel: 'Mon' },
    { id: '3', title: 'Interview frontend candidate', category: 'People', completed: false },
  ]);

  const handleToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="p-4 space-y-2">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
      ))}
    </div>
  );
}
