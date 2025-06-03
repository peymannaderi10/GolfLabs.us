
import React from 'react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  onDateSelect
}) => {
  const today = startOfToday();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className="space-y-3">
      {days.map((day, index) => {
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        
        return (
          <Card
            key={index}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected 
                ? 'ring-2 ring-primary bg-primary/10' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => onDateSelect(day)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {format(day, 'EEEE')}
                </div>
                <div className={`text-lg font-bold ${
                  isSelected ? 'text-primary' : isToday ? 'text-primary' : 'text-foreground'
                }`}>
                  {format(day, 'MMMM d, yyyy')}
                </div>
                {isToday && (
                  <div className="text-xs text-primary font-medium">Today</div>
                )}
              </div>
              <div className={`text-2xl font-bold ${
                isSelected ? 'text-primary' : isToday ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
