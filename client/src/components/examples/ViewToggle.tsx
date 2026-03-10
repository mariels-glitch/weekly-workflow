import { useState } from 'react';
import ViewToggle from '../ViewToggle';

export default function ViewToggleExample() {
  const [scope, setScope] = useState<'week' | 'today'>('week');
  
  return (
    <div className="p-4">
      <ViewToggle scope={scope} onScopeChange={setScope} />
      <p className="text-muted-foreground text-sm mt-2">Current scope: {scope}</p>
    </div>
  );
}
