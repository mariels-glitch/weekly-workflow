import TaskInput from '../TaskInput';

export default function TaskInputExample() {
  const handleAddTask = (title: string, category: string) => {
    console.log('Adding task:', title, category);
  };

  return (
    <div className="p-4">
      <TaskInput onAddTask={handleAddTask} selectedDayLabel="Monday" />
    </div>
  );
}
