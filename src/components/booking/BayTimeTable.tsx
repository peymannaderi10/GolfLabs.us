import React from 'react';
import { cn } from '@/lib/utils';
import type { Booking, SelectionState } from '@/pages/Booking'; // Assuming types are exported from Booking.tsx

interface BayTimeTableProps {
  bayCount: number;
  timeSlots: string[];
  bookings: Booking[];
  selection: SelectionState;
  onSlotClick: (bayId: number, timeSlot: string) => void;
  isSlotBooked: (bayId: number, timeSlot: string) => boolean; // Already implemented in Booking.tsx but passed as prop for direct use
}

export const BayTimeTable: React.FC<BayTimeTableProps> = ({
  bayCount,
  timeSlots,
  // bookings, // bookings are used via isSlotBooked and selection logic
  selection,
  onSlotClick,
  isSlotBooked,
}) => {

  const getSlotStatus = (bayId: number, timeSlot: string, selectionState: SelectionState, timeSlotsArray: string[]) => {
    if (isSlotBooked(bayId, timeSlot)) {
      return 'booked';
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
                const currentBayId = bayIndex + 1;
                const status = getSlotStatus(currentBayId, timeSlot, selection, timeSlots);
                
                let cellStyles = "p-0 border border-border h-8 min-h-[2rem] cursor-pointer transition-all duration-150 ease-in-out bg-background m-0";
                let contentStyles = "w-full h-full flex items-center justify-center text-xs";
                let cellContent = <span className="opacity-50"></span>; // Default empty look for available

                switch (status) {
                  case 'booked':
                    cellStyles = cn(cellStyles, 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-70');
                    contentStyles = cn(contentStyles, 'text-slate-500 dark:text-slate-400');
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
                      onClick={() => status !== 'booked' && onSlotClick(currentBayId, timeSlot)}
                      disabled={status === 'booked'}
                      aria-label={`Select Bay ${currentBayId} at ${timeSlot}${status === 'booked' ? ' (Booked)' : ''}`}
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