import React from 'react';
import { cn } from '@/lib/utils';
import type { Booking, SelectionState } from '@/pages/Booking';
import { BAY_IDS } from '@/constants';

interface BayTimeTableProps {
  bayCount: number;
  timeSlots: string[];
  bookings: Booking[];
  selection: SelectionState;
  selectedDate: Date;
  onSlotClick: (bayId: string, timeSlot: string) => void;
  isSlotBooked: (bayId: string, timeSlot: string) => boolean;
}

// Helper function to check if a time slot is in the past for the current day
const isTimeSlotInPast = (selectedDate: Date, timeSlot: string): boolean => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selectedDay = new Date(selectedDate);
  selectedDay.setHours(0, 0, 0, 0);
  
  // If the selected date is not today, don't restrict
  if (selectedDay.getTime() !== today.getTime()) {
    return false;
  }
  
  // Parse the time slot (e.g., "8:00 PM" or "8:15 AM")
  const [time, period] = timeSlot.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  // Create a date object for the time slot on the selected date
  const slotTime = new Date(selectedDate);
  slotTime.setHours(hour24, minutes, 0, 0);
  
  // Check if the slot time is before the current time
  return slotTime < now;
};

export const BayTimeTable: React.FC<BayTimeTableProps> = ({
  bayCount,
  timeSlots,
  selection,
  selectedDate,
  onSlotClick,
  isSlotBooked,
}) => {

  const getSlotStatus = (bayId: string, timeSlot: string, selectionState: SelectionState, timeSlotsArray: string[]) => {
    if (isSlotBooked(bayId, timeSlot)) {
      return 'booked';
    }

    // Check if the time slot is in the past for the current day
    if (isTimeSlotInPast(selectedDate, timeSlot)) {
      return 'past';
    }

    if (selectionState.bayId === bayId) {
      const startTimeIndex = selectionState.startTime ? timeSlotsArray.indexOf(selectionState.startTime) : -1;
      const endTimeIndex = selectionState.endTime ? timeSlotsArray.indexOf(selectionState.endTime) : -1;
      const currentTimeSlotIndex = timeSlotsArray.indexOf(timeSlot);

      if (startTimeIndex !== -1 && currentTimeSlotIndex === startTimeIndex) {
        return 'selected-start';
      }
      if (endTimeIndex !== -1 && currentTimeSlotIndex === endTimeIndex) {
        return 'selected-end';
      }
      if (startTimeIndex !== -1 && endTimeIndex !== -1 && 
          currentTimeSlotIndex > startTimeIndex && currentTimeSlotIndex < endTimeIndex) {
        return 'selected-intermediate';
      }
    }
    return 'available';
  };

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[600px] bg-card rounded-lg shadow">
      <table className="min-w-full border-collapse border-separate border-spacing-0 border border-border">
        <thead className="sticky top-0 z-20">
          <tr className="bg-primary/90">
            <th className="sticky left-0 z-30 bg-primary/90 p-2 border border-border text-xs font-bold text-primary-foreground w-20 min-w-[5rem] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Time</th>
            {[...Array(bayCount)].map((_, i) => (
              <th key={`bay-header-${i + 1}`} className="bg-primary/90 p-2 border border-border text-xs font-bold text-primary-foreground min-w-[6rem] md:min-w-[7rem]">
                Bay {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-background">
          {timeSlots.map((timeSlot, timeIndex) => (
            <tr key={timeSlot} className="hover:bg-muted/40 transition-colors duration-150">
              <td className="sticky left-0 z-10 p-2 border border-border text-xs text-muted-foreground font-medium w-20 min-w-[5rem] text-center bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {timeSlot}
              </td>
              {[...Array(bayCount)].map((_, bayIndex) => {
                const bayNumber = bayIndex + 1;
                const currentBayId = BAY_IDS[bayNumber as keyof typeof BAY_IDS];
                const status = getSlotStatus(currentBayId, timeSlot, selection, timeSlots);
                
                let cellStyles = "p-0 border border-border h-8 min-h-[2rem] cursor-pointer transition-all duration-150 ease-in-out bg-background m-0";
                let contentStyles = "w-full h-full flex items-center justify-center text-xs";
                let cellContent = <span className="opacity-50"></span>; // Default empty look for available

                switch (status) {
                  case 'booked':
                    cellStyles = cn(cellStyles, 'bg-destructive/20 dark:bg-destructive/30 cursor-not-allowed border-destructive/30');
                    contentStyles = cn(contentStyles, 'text-destructive dark:text-destructive/90');
                    cellContent = <span className="text-xs font-medium">Booked</span>;
                    break;
                  case 'past':
                    cellStyles = cn(cellStyles, 'bg-muted/60 dark:bg-muted/40 cursor-not-allowed border-muted/50');
                    contentStyles = cn(contentStyles, 'text-muted-foreground/60');
                    cellContent = <span className="text-xs">Past</span>;
                    break;
                  case 'selected-start':
                    cellStyles = cn(cellStyles, 'bg-primary ring-2 ring-primary-focus ring-offset-1');
                    contentStyles = cn(contentStyles, 'text-primary-foreground font-semibold');
                    cellContent = <span>Start</span>;
                    break;
                  case 'selected-end':
                    cellStyles = cn(cellStyles, 'bg-primary ring-2 ring-primary-focus ring-offset-1');
                    contentStyles = cn(contentStyles, 'text-primary-foreground font-semibold');
                    cellContent = <span>End</span>;
                    break;
                  case 'selected-intermediate':
                    cellStyles = cn(cellStyles, 'bg-primary/70');
                    contentStyles = cn(contentStyles, 'text-primary-foreground/90');
                    break;
                  case 'available':
                  default:
                    cellStyles = cn(cellStyles, 'hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1');
                    break;
                }

                return (
                  <td key={`${timeSlot}-bay-${currentBayId}`} className={cellStyles}>
                    <button 
                      type="button"
                      className={contentStyles}
                      onClick={() => (status !== 'booked' && status !== 'past') && onSlotClick(currentBayId, timeSlot)}
                      disabled={status === 'booked' || status === 'past'}
                      aria-label={`Select Bay ${bayNumber} at ${timeSlot}${status === 'booked' ? ' (Booked)' : status === 'past' ? ' (Past Time)' : ''}`}
                    >
                      {cellContent}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 