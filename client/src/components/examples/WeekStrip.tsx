import { useState } from 'react';
import WeekStrip from '../WeekStrip';

export default function WeekStripExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  return (
    <div className="p-4">
      <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <p className="text-muted-foreground text-sm mt-2">Selected: {selectedDate.toDateString()}</p>
    </div>
  );
}
