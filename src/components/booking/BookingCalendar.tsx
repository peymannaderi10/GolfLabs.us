import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Booking } from '@/pages/Booking';
import { formatDateToYYYYMMDD } from '@/pages/Booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, addDays, isSameDay, startOfToday, addWeeks, subWeeks, isBefore, isAfter, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | undefined) => void;
  bookings?: Booking[]; // To potentially indicate if a day is generally busy, though details are in the table
  className?: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  onDateSelect,
  bookings,
  className,
}) => {
  const today = startOfToday();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(today);
  const maxFutureDate = addMonths(today, 6); // 6 months from today

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Check if a day has any bookings - simplified since bookings are now just time strings
  const bookedDayIndicator = React.useMemo(() => {
    if (!bookings || bookings.length === 0 || !selectedDate) return new Set();
    const datesWithBookings = new Set<string>();
    
    // Since bookings are fetched for the selected date, if there are any bookings,
    // mark the selected date as having bookings
    if (bookings.length > 0) {
      datesWithBookings.add(formatDateToYYYYMMDD(selectedDate));
    }
    
    return datesWithBookings;
  }, [bookings, selectedDate]);

  const handlePreviousWeek = () => {
    const newWeekStart = subWeeks(currentWeekStart, 1);
    // Only allow going back if the new week's end date is not before today
    if (!isBefore(addDays(newWeekStart, 6), today)) {
      setCurrentWeekStart(newWeekStart);
    }
  };

  const handleNextWeek = () => {
    const newWeekStart = addWeeks(currentWeekStart, 1);
    // Only allow going forward if the new week's start date is not after maxFutureDate
    if (!isAfter(newWeekStart, maxFutureDate)) {
      setCurrentWeekStart(newWeekStart);
    }
  };

  const isPreviousWeekDisabled = isBefore(addDays(subWeeks(currentWeekStart, 1), 6), today);
  const isNextWeekDisabled = isAfter(addWeeks(currentWeekStart, 1), maxFutureDate);

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-center md:text-left">Select a Day</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousWeek}
            disabled={isPreviousWeekDisabled}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            disabled={isNextWeekDisabled}
            className="h-7 w-7"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayFormatted = formatDateToYYYYMMDD(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const hasBookings = bookedDayIndicator.has(dayFormatted);
          const isPastDay = isBefore(day, today);

          return (
            <Button
              key={day.toString()}
              variant={isSelected ? "default" : "outline"}
              onClick={() => !isPastDay && onDateSelect(day)}
              disabled={isPastDay}
              className={cn(
                "h-auto p-1.5 sm:p-2 flex flex-col items-center justify-center rounded-lg shadow-sm transition-all",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : 
                            "bg-card hover:bg-muted/50 border-border",
                hasBookings && !isSelected ? "border-amber-500/50" : "",
                isPastDay ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <span className={cn("text-[10px] sm:text-xs font-medium", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                {format(day, 'EEE')}
              </span>
              <span className={cn("text-base sm:text-lg font-bold", isSelected ? "text-primary-foreground" : "text-foreground")}>
                {format(day, 'd')}
              </span>
              <span className={cn("text-[9px] sm:text-xs", isSelected ? "text-primary-foreground/80" : "text-muted-foreground/80")}>
                {format(day, 'MMM')}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
