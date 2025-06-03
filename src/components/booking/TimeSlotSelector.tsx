
import React from 'react';
import { Button } from '@/components/ui/button';
import { format, setHours, setMinutes } from 'date-fns';

interface TimeSlotSelectorProps {
  selectedDate: Date;
  selectedTimeSlot: string | null;
  onTimeSlotSelect: (timeSlot: string) => void;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  selectedTimeSlot,
  onTimeSlotSelect
}) => {
  // Generate time slots from 12:00 AM to 11:30 PM in 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = setMinutes(setHours(selectedDate, hour), minute);
        const timeString = format(time, 'h:mm a');
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Group time slots by hour periods for better organization
  const groupedSlots = {
    morning: timeSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      const period = slot.includes('AM') ? 'AM' : 'PM';
      return period === 'AM' && hour >= 6;
    }),
    afternoon: timeSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      const period = slot.includes('AM') ? 'AM' : 'PM';
      return period === 'PM' && hour >= 12 && hour < 6;
    }),
    evening: timeSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      const period = slot.includes('AM') ? 'AM' : 'PM';
      return period === 'PM' && hour >= 6;
    }),
    lateNight: timeSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      const period = slot.includes('AM') ? 'AM' : 'PM';
      return period === 'AM' && hour < 6;
    })
  };

  const renderTimeSlotGroup = (title: string, slots: string[]) => (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {slots.map((slot) => (
          <Button
            key={slot}
            variant={selectedTimeSlot === slot ? "default" : "outline"}
            size="sm"
            onClick={() => onTimeSlotSelect(slot)}
            className="text-xs"
          >
            {slot}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Available time slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {renderTimeSlotGroup('Morning (6 AM - 11:30 AM)', groupedSlots.morning)}
      {renderTimeSlotGroup('Afternoon (12 PM - 5:30 PM)', groupedSlots.afternoon)}
      {renderTimeSlotGroup('Evening (6 PM - 11:30 PM)', groupedSlots.evening)}
      {renderTimeSlotGroup('Late Night (12 AM - 5:30 AM)', groupedSlots.lateNight)}
    </div>
  );
};
