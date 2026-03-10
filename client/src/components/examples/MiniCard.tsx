import MiniCard from '../MiniCard';

export default function MiniCardExample() {
  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      <MiniCard label="Completed Today" value="3" meta="out of 5 tasks" />
      <MiniCard label="Time Tracked" value="4.5h" meta="avg 1.5h/task" />
      <MiniCard label="Weekly Progress" value="67%" meta="on track" />
      <MiniCard label="Focus Score" value="High" meta="minimal context switching" />
    </div>
  );
}
