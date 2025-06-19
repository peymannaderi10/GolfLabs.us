import React from 'react';
import { cn } from '@/lib/utils';
import type { Booking, SelectionState, Bay } from '@/pages/Booking';

interface BayTimeTableProps {
  bays: Bay[];
  timeSlots: string[];
  bookings: Booking[];
  selection: SelectionState;
  selectedDate: Date;
  onSlotClick: (bayId: string, timeSlot: string) => void;
  isSlotBooked: (bayId: string, timeSlot: string) => boolean;
}

export const BayTimeTable: React.FC<BayTimeTableProps> = ({
  bays,
  timeSlots,
  selection,
  selectedDate,
  onSlotClick,
  isSlotBooked,
}) => {

  const getSlotStatus = (bayId: string, timeSlot: string, selectionState: SelectionState, timeSlotsArray: string[], bayStatus: string) => {
    // If bay is not available, return unavailable status
    if (bayStatus !== 'available') {
      return 'unavailable';
    }

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
            {bays.map((bay) => (
              <th key={`bay-header-${bay.id}`} className="bg-primary/90 p-2 border border-border text-xs font-bold text-primary-foreground min-w-[6rem] md:min-w-[7rem]">
                {bay.name}
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
              {bays.map((bay) => {
                const status = getSlotStatus(bay.id, timeSlot, selection, timeSlots, bay.status);
                
                let cellStyles = "p-0 border border-border h-8 min-h-[2rem] cursor-pointer transition-all duration-150 ease-in-out bg-background m-0";
                let contentStyles = "w-full h-full flex items-center justify-center text-xs";
                let cellContent = <span className="opacity-50"></span>; // Default empty look for available

                switch (status) {
                  case 'unavailable':
                    cellStyles = cn(cellStyles, 'bg-muted/50 cursor-not-allowed border-muted');
                    contentStyles = cn(contentStyles, 'text-muted-foreground/50');
                    cellContent = <span className="text-xs">N/A</span>;
                    break;
                  case 'booked':
                    cellStyles = cn(cellStyles, 'bg-destructive/20 dark:bg-destructive/30 cursor-not-allowed border-destructive/30');
                    contentStyles = cn(contentStyles, 'text-destructive dark:text-destructive/90');
                    cellContent = <span className="text-xs font-medium">Booked</span>;
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

                const isClickable = status !== 'booked' && status !== 'unavailable';

                return (
                  <td key={`${timeSlot}-bay-${bay.id}`} className={cellStyles}>
                    <button 
                      type="button"
                      className={contentStyles}
                      onClick={() => isClickable && onSlotClick(bay.id, timeSlot)}
                      disabled={!isClickable}
                      aria-label={`Select ${bay.name} at ${timeSlot}${!isClickable ? ` (${status === 'unavailable' ? 'Unavailable' : 'Booked'})` : ''}`}
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