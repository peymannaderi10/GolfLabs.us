import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, ShoppingCart, Trash2, Info, DollarSign } from 'lucide-react';
import type { SelectionState } from '@/pages/Booking'; // Import SelectionState
import { timeToIndex } from '@/pages/Booking'; // Import timeToIndex

const DAY_RATE = 35; // $35/hr from 9am to 10pm
const NIGHT_RATE = 25; // $25/hr from 10pm to 9am
const DAY_START = 9; // 9am
const DAY_END = 22; // 10pm

export interface BookingSummaryProps {
  selectedDate: Date | null;
  selection: SelectionState;
  timeSlots: string[];
  onConfirmBooking: () => void;
  onClearSelection: () => void;
  timeIntervalMinutes: number;
  minSlotsDuration: number;
  maxSlotsDuration: number;
  className?: string;
}
 
export const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedDate,
  selection,
  timeSlots,
  onConfirmBooking,
  onClearSelection,
  timeIntervalMinutes,
  // minSlotsDuration, // Potentially for display or validation within summary
  // maxSlotsDuration,
  className,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const { bayId, startTime, endTime } = selection;

  const calculatedDurationMinutes = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const startIndex = timeToIndex(startTime, timeSlots);
    const endIndex = timeToIndex(endTime, timeSlots);
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return 0;
    // Subtract 1 from the difference since we want the duration between slots, not including both slots
    return (endIndex - startIndex) * timeIntervalMinutes;
  }, [startTime, endTime, timeSlots, timeIntervalMinutes]);

  const calculatePrice = useMemo(() => {
    if (!startTime || !endTime) return 0;
    
    const startIndex = timeToIndex(startTime, timeSlots);
    const endIndex = timeToIndex(endTime, timeSlots);
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return 0;

    let totalPrice = 0;
    // Only count slots up to but not including the end time
    for (let i = startIndex; i < endIndex; i++) {
      const timeSlot = timeSlots[i];
      const hour = parseInt(timeSlot.split(':')[0]);
      const isDayRate = hour >= DAY_START && hour < DAY_END;
      const rate = isDayRate ? DAY_RATE : NIGHT_RATE;
      totalPrice += (rate / 4); // Divide by 4 since we're working with 15-minute intervals
    }

    return totalPrice;
  }, [startTime, endTime, timeSlots]);

  const isSelectionValid = useMemo(() => {
    return !!(selectedDate && bayId && startTime && endTime && calculatedDurationMinutes > 0);
  }, [selectedDate, bayId, startTime, endTime, calculatedDurationMinutes]);

  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    let str = "";
    if (h > 0) str += `${h} hour${h > 1 ? 's' : ''}`;
    if (m > 0) str += `${h > 0 ? ' ' : ''}${m} min`;
    return str;
  };

  if (!selectedDate && !bayId && !startTime && !endTime) {
    // If nothing is selected at all, perhaps don't render the floating component yet,
    // or render it minimized by default with a generic message.
    // For now, let's render it but it will appear mostly empty if minimized.
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
        isMinimized ? "w-auto" : "w-full max-w-sm md:max-w-md",
        className
      )}
    >
      <Card className={cn("shadow-2xl rounded-lg overflow-hidden bg-card/95 backdrop-blur-sm border-border", isMinimized ? "p-0" : "")}>
        <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="flex items-center">
                {isMinimized && isSelectionValid && <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />} 
                {isMinimized && !isSelectionValid && <Info className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />} 
                <span className="font-semibold text-sm text-foreground">
                    {isMinimized ? (isSelectionValid ? `Bay ${bayId} - ${formatDuration(calculatedDurationMinutes)}` : "Booking Details") : "Booking Summary"}
                </span>
            </div>
            <button 
              type="button"
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
            >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
        </div>

        {!isMinimized && (
          <>
            <CardContent className="p-4 space-y-3 text-sm">
              {selectedDate ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" /> Date:
                  </div>
                  <span className="font-medium text-foreground">{selectedDate.toLocaleDateString()}</span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground"><Calendar className="h-4 w-4 mr-2" /> Select a date.</div>
              )}

              {bayId ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" /> Bay:
                  </div>
                  <span className="font-medium text-foreground">{bayId}</span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground"><MapPin className="h-4 w-4 mr-2" /> Select a bay.</div>
              )}

              {startTime ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" /> Start Time:
                  </div>
                  <span className="font-medium text-foreground">{startTime}</span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground"><Clock className="h-4 w-4 mr-2" /> Select start time.</div>
              )}

              {endTime ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" /> End Time:
                  </div>
                  <span className="font-medium text-foreground">{endTime}</span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground"><Clock className="h-4 w-4 mr-2" /> Select end time.</div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                <div className="flex items-center text-muted-foreground font-semibold">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" /> Duration:
                </div>
                <span className="font-bold text-primary text-base">{formatDuration(calculatedDurationMinutes)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center text-muted-foreground font-semibold">
                  <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" /> Total Price:
                </div>
                <span className="font-bold text-primary text-base">${calculatePrice.toFixed(2)}</span>
              </div>
            </CardContent>

            <div className="border-t border-border p-3 bg-muted/10">
                <div className="flex gap-2">
                    <Button 
                        onClick={onClearSelection} 
                        variant="outline" 
                        className="w-full text-sm flex-1 group hover:border-destructive hover:bg-destructive/5"
                        disabled={!bayId && !startTime && !endTime}
                    >
                        <Trash2 className="h-4 w-4 mr-1.5 text-muted-foreground group-hover:text-destructive transition-colors" />
                        Clear
                    </Button>
                    <Button 
                        onClick={onConfirmBooking} 
                        disabled={!isSelectionValid}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm flex-1 group"
                    >
                        <ShoppingCart className="h-4 w-4 mr-1.5 group-hover:animate-pulse" />
                        Checkout
                    </Button>
                </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
