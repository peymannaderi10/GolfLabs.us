
import React from 'react';
import { format, parse, addMinutes } from 'date-fns';
import { Calendar, Clock, Timer, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface BookingSummaryProps {
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  selectedBay: number | null;
  duration: number;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedDate,
  selectedTimeSlot,
  selectedBay,
  duration
}) => {
  const calculateEndTime = () => {
    if (!selectedDate || !selectedTimeSlot) return null;
    
    try {
      const startTime = parse(selectedTimeSlot, 'h:mm a', selectedDate);
      const endTime = addMinutes(startTime, duration);
      return format(endTime, 'h:mm a');
    } catch {
      return null;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const calculatePrice = () => {
    // Base price calculation (example: $30 per 30 minutes)
    const baseRate = 30; // $30 per 30 minutes
    const slots = duration / 30;
    return baseRate * slots;
  };

  const endTime = calculateEndTime();
  const price = calculatePrice();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Date</p>
            <p className="text-sm text-muted-foreground">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Not selected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Golf Bay</p>
            <p className="text-sm text-muted-foreground">
              {selectedBay ? `Bay ${selectedBay}` : 'Not selected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Time</p>
            <p className="text-sm text-muted-foreground">
              {selectedTimeSlot && endTime 
                ? `${selectedTimeSlot} - ${endTime}`
                : 'Not selected'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Duration</p>
            <p className="text-sm text-muted-foreground">
              {formatDuration(duration)}
            </p>
          </div>
        </div>
      </div>

      <Separator />
      
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Price</span>
        <span className="text-xl font-bold text-primary">${price}</span>
      </div>
    </div>
  );
};
