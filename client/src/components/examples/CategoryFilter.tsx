import { useState } from 'react';
import CategoryFilter from '../CategoryFilter';

export default function CategoryFilterExample() {
  const [selected, setSelected] = useState<'All' | 'Core' | 'Ops' | 'Strategy' | 'People'>('All');
  
  return (
    <div className="p-4">
      <CategoryFilter selected={selected} onSelect={setSelected} />
      <p className="text-muted-foreground text-sm mt-2">Selected: {selected}</p>
    </div>
  );
}
