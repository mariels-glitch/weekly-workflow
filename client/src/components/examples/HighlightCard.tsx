import HighlightCard from '../HighlightCard';

export default function HighlightCardExample() {
  return (
    <div className="p-4 space-y-4">
      <HighlightCard 
        label="Priority" 
        title="Ship v1 of Smart Card MVP" 
        meta={["Core Product", "2h estimate"]} 
      />
      <HighlightCard 
        label="Next Up" 
        title="Review Q4 strategy presentation" 
        meta={["Strategy", "Due today"]} 
      />
    </div>
  );
}
