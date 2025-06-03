
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DurationSelectorProps {
  duration: number;
  onDurationChange: (duration: number) => void;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  duration,
  onDurationChange
}) => {
  // Generate duration options from 30 minutes to 4 hours in 30-minute increments
  const durationOptions = [];
  for (let minutes = 30; minutes <= 240; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let label = '';
    
    if (hours > 0 && mins > 0) {
      label = `${hours}h ${mins}m`;
    } else if (hours > 0) {
      label = `${hours}h`;
    } else {
      label = `${mins}m`;
    }
    
    durationOptions.push({ value: minutes, label });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="duration">Session Duration</Label>
      <Select value={duration.toString()} onValueChange={(value) => onDurationChange(parseInt(value))}>
        <SelectTrigger>
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          {durationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
