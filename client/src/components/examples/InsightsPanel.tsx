import InsightsPanel from '../InsightsPanel';
import type { Task } from '../TaskItem';

const mockTasks: Task[] = [
  { id: '1', title: 'Ship v1 of Smart Card MVP', category: 'Core', completed: false, timeEstimate: '2h' },
  { id: '2', title: 'Review Q4 strategy docs', category: 'Strategy', completed: true },
  { id: '3', title: 'Interview frontend candidate', category: 'People', completed: false },
  { id: '4', title: 'Update GTM timeline', category: 'Ops', completed: false },
  { id: '5', title: 'Prepare sprint demo', category: 'Core', completed: true },
];

export default function InsightsPanelExample() {
  return (
    <div className="p-4 max-w-md">
      <InsightsPanel tasks={mockTasks} />
    </div>
  );
}
