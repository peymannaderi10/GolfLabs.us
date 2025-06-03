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

// Sample bookings data with more realistic times
const sampleBookings = [
  { bay: 1, startTime: '9:00 AM', endTime: '10:30 AM' },
  { bay: 3, startTime: '4:00 PM', endTime: '11:00 PM' }, // Long booking like in the image
  { bay: 5, startTime: '5:15 PM', endTime: '6:15 PM' },
  { bay: 6, startTime: '7:15 PM', endTime: '8:30 PM' },
  { bay: 7, startTime: '6:30 PM', endTime: '7:30 PM' },
  { bay: 8, startTime: '8:00 PM', endTime: '9:30 PM' },
  { bay: 6, startTime: '9:00 PM', endTime: '10:00 PM' },
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

  // Get booking info for a slot
  const getBookingInfo = (bay: number, timeSlot: string) => {
    return sampleBookings.find(booking => {
      if (booking.bay !== bay) return null;
      
      try {
        const slotTime = parse(timeSlot, 'h:mm a', selectedDate);
        const startTime = parse(booking.startTime, 'h:mm a', selectedDate);
        const endTime = parse(booking.endTime, 'h:mm a', selectedDate);
        
        if (isWithinInterval(slotTime, { start: startTime, end: endTime })) {
          return booking;
        }
      } catch {
        return null;
      }
      return null;
    });
  };

  // Check if this is the first slot of a booking
  const isBookingStart = (bay: number, timeSlot: string) => {
    const booking = getBookingInfo(bay, timeSlot);
    if (!booking) return false;
    
    try {
      const slotTime = parse(timeSlot, 'h:mm a', selectedDate);
      const startTime = parse(booking.startTime, 'h:mm a', selectedDate);
      return slotTime.getTime() === startTime.getTime();
    } catch {
      return false;
    }
  };

  // Calculate how many slots a booking spans
  const getBookingSpan = (bay: number, timeSlot: string) => {
    const booking = getBookingInfo(bay, timeSlot);
    if (!booking || !isBookingStart(bay, timeSlot)) return 1;
    
    try {
      const startTime = parse(booking.startTime, 'h:mm a', selectedDate);
      const endTime = parse(booking.endTime, 'h:mm a', selectedDate);
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      return Math.ceil(durationMinutes / 15);
    } catch {
      return 1;
    }
  };

  // Check if slot is selected
  const isSlotSelected = (bay: number, timeSlot: string) => {
    return selectedBay === bay && selectedTimeSlot === timeSlot;
  };

  // Filter time slots to show only hourly slots for cleaner view
  const displayTimeSlots = timeSlots.filter((_, index) => index % 4 === 0); // Show every hour

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="border-b-2">
            <TableHead className="w-20 font-bold text-gray-700 text-center border-r-2 border-gray-200 bg-gray-100 sticky left-0 z-10">
              Time
            </TableHead>
            {bays.map(bay => (
              <TableHead key={bay} className="font-bold text-gray-700 text-center border-r border-gray-200 min-w-[140px]">
                Bay {bay}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((timeSlot, timeIndex) => {
            // Only show rows for full hours for cleaner look, but keep all slots for booking logic
            const isHourMark = timeIndex % 4 === 0;
            
            return (
              <TableRow 
                key={timeSlot} 
                className={`border-b border-gray-100 ${isHourMark ? 'h-16' : 'h-4'} ${isHourMark ? '' : 'border-opacity-50'}`}
                style={{ height: isHourMark ? '64px' : '16px' }}
              >
                <TableCell className={`font-medium text-xs border-r-2 border-gray-200 bg-gray-50 sticky left-0 z-10 ${isHourMark ? 'text-gray-700' : 'text-gray-400 text-center'}`}>
                  {isHourMark ? timeSlot : ''}
                </TableCell>
                {bays.map(bay => {
                  const blocked = isSlotBlocked(bay, timeSlot);
                  const selected = isSlotSelected(bay, timeSlot);
                  const booking = getBookingInfo(bay, timeSlot);
                  const bookingStart = isBookingStart(bay, timeSlot);
                  const bookingSpan = getBookingSpan(bay, timeSlot);
                  
                  // Don't render cell if it's part of a booking that started earlier
                  if (blocked && !bookingStart) {
                    return null;
                  }
                  
                  return (
                    <TableCell key={bay} className="p-0 border-r border-gray-100 relative">
                      {blocked && bookingStart ? (
                        <div 
                          className="bg-blue-100 border border-blue-200 rounded-sm m-1 flex items-center justify-center text-xs text-blue-800 font-medium shadow-sm"
                          style={{
                            height: `${bookingSpan * (isHourMark ? 64 : 16) - 8}px`,
                            minHeight: '40px'
                          }}
                        >
                          <div className="text-center px-2">
                            <div className="font-semibold">{booking?.startTime}—{booking?.endTime}</div>
                          </div>
                        </div>
                      ) : !blocked ? (
                        <Button
                          variant={selected ? "default" : "ghost"}
                          size="sm"
                          className={`w-full h-full text-xs border-0 rounded-none ${
                            selected
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-green-50 hover:text-green-700 text-transparent hover:text-green-700'
                          }`}
                          onClick={() => onSlotSelect(bay, timeSlot)}
                          style={{ height: isHourMark ? '64px' : '16px' }}
                        >
                          {selected ? '✓' : isHourMark ? '+' : ''}
                        </Button>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
