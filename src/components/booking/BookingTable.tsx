
import React from 'react';
import { format, addMinutes, startOfDay, parse, isWithinInterval } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface BookingTableProps {
  selectedDate: Date | null;
  selectedBay: number | null;
  selectedTimeSlot: string | null;
  onSlotSelect: (bay: number, timeSlot: string) => void;
}

// Sample bookings data
const sampleBookings = [
  { bay: 1, startTime: '1:15 PM', endTime: '3:45 PM' },
  { bay: 3, startTime: '9:30 AM', endTime: '11:00 AM' },
  { bay: 5, startTime: '2:00 PM', endTime: '4:30 PM' },
  { bay: 7, startTime: '6:15 PM', endTime: '8:45 PM' },
  { bay: 2, startTime: '10:45 AM', endTime: '12:15 PM' },
  { bay: 6, startTime: '4:00 PM', endTime: '5:30 PM' },
  { bay: 8, startTime: '7:30 PM', endTime: '9:00 PM' },
];

export const BookingTable: React.FC<BookingTableProps> = ({
  selectedDate,
  selectedBay,
  selectedTimeSlot,
  onSlotSelect
}) => {
  if (!selectedDate) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please select a date to view available time slots
      </div>
    );
  }

  // Generate time slots from 12:00 AM to 11:45 PM in 15-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    const startOfSelectedDay = startOfDay(selectedDate);
    
    for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
      const time = addMinutes(startOfSelectedDay, minutes);
      const timeString = format(time, 'h:mm a');
      slots.push(timeString);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const bays = Array.from({ length: 8 }, (_, i) => i + 1);

  // Check if a slot is blocked by a booking
  const isSlotBlocked = (bay: number, timeSlot: string) => {
    return sampleBookings.some(booking => {
      if (booking.bay !== bay) return false;
      
      try {
        const slotTime = parse(timeSlot, 'h:mm a', selectedDate);
        const startTime = parse(booking.startTime, 'h:mm a', selectedDate);
        const endTime = parse(booking.endTime, 'h:mm a', selectedDate);
        
        return isWithinInterval(slotTime, { start: startTime, end: endTime });
      } catch {
        return false;
      }
    });
  };

  // Check if slot is selected
  const isSlotSelected = (bay: number, timeSlot: string) => {
    return selectedBay === bay && selectedTimeSlot === timeSlot;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-24 font-semibold text-center border-r">Time</TableHead>
            {bays.map(bay => (
              <TableHead key={bay} className="font-semibold text-center border-r last:border-r-0">
                Bay {bay}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((timeSlot, index) => (
            <TableRow key={timeSlot} className={index % 4 === 0 ? 'bg-muted/20' : ''}>
              <TableCell className="font-medium text-xs border-r bg-muted/30 sticky left-0">
                {timeSlot}
              </TableCell>
              {bays.map(bay => {
                const blocked = isSlotBlocked(bay, timeSlot);
                const selected = isSlotSelected(bay, timeSlot);
                
                return (
                  <TableCell key={bay} className="p-1 border-r last:border-r-0">
                    <Button
                      variant={selected ? "default" : blocked ? "destructive" : "outline"}
                      size="sm"
                      className={`w-full h-8 text-xs ${
                        blocked 
                          ? 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed' 
                          : selected
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-primary/10'
                      }`}
                      onClick={() => !blocked && onSlotSelect(bay, timeSlot)}
                      disabled={blocked}
                    >
                      {blocked ? 'Booked' : selected ? 'Selected' : 'Available'}
                    </Button>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
