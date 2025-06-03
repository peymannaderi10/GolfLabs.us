import React from 'react';
import { format, addMinutes, startOfDay, parse, isWithinInterval } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BookingTableProps {
  selectedDate: Date | null;
  selectedBay: number | null;
  selectedTimeSlot: string | null;
  selectedDuration: number;
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
  selectedDuration,
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

  // Calculate how many 15-minute slots the duration spans
  const getDurationSlots = () => {
    return Math.ceil(selectedDuration / 15);
  };

  // Get time slots that would be included in a booking starting at the given slot
  const getTimeSlotRange = (startSlot: string) => {
    const slotIndex = timeSlots.findIndex(slot => slot === startSlot);
    if (slotIndex === -1) return [];
    
    const slots = [];
    const durationSlots = getDurationSlots();
    
    for (let i = 0; i < durationSlots && slotIndex + i < timeSlots.length; i++) {
      slots.push(timeSlots[slotIndex + i]);
    }
    
    return slots;
  };

  // Check if a slot is part of the hover preview range
  const isInHoverRange = (bay: number, timeSlot: string, hoverBay: number | null, hoverSlot: string | null) => {
    if (!hoverBay || !hoverSlot || bay !== hoverBay) return false;
    
    const range = getTimeSlotRange(hoverSlot);
    return range.includes(timeSlot);
  };

  // State to track which slot is being hovered
  const [hoverBay, setHoverBay] = React.useState<number | null>(null);
  const [hoverSlot, setHoverSlot] = React.useState<string | null>(null);

  return (
    <div className="border rounded-lg overflow-auto bg-white max-w-full">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="border-b-2">
            <TableHead className="w-16 font-bold text-gray-700 text-center border-r-2 border-gray-200 bg-gray-100 sticky left-0 z-10 py-2">
              Time
            </TableHead>
            {bays.map(bay => (
              <TableHead key={bay} className="font-bold text-gray-700 text-center border-r border-gray-200 min-w-[80px] py-2">
                Bay {bay}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((timeSlot, timeIndex) => {
            const isHourMark = timeIndex % 4 === 0; // Every 4th slot (every hour)
            
            return (
              <TableRow 
                key={timeSlot} 
                className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-b border-gray-100"
                style={{ height: '16px', borderCollapse: 'collapse' }}
              >
                <TableCell className={`font-medium text-xs border-r-2 border-gray-200 bg-gray-50 sticky left-0 z-10 text-center py-0.5 ${
                  isHourMark ? 'text-gray-700 font-semibold' : 'text-gray-400'
                }`} style={{ height: '16px', padding: '0' }}>
                  {isHourMark ? timeSlot : format(parse(timeSlot, 'h:mm a', selectedDate), 'h:mm')}
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
                    <TableCell 
                      key={bay} 
                      className="p-0 border-r border-gray-100 relative"
                      style={{ 
                        height: '16px', 
                        minHeight: '16px', 
                        padding: '0', 
                        borderCollapse: 'collapse',
                        overflow: 'hidden'
                      }}
                      rowSpan={blocked && bookingStart ? bookingSpan : 1}
                    >
                      {blocked && bookingStart ? (
                        <div 
                          className="bg-gray-200 flex items-center justify-center text-xs text-gray-700 font-medium absolute inset-0"
                          style={{
                            height: `${bookingSpan * 16}px`,
                            width: '100%',
                            margin: '0',
                            padding: '0',
                            border: 'none',
                            borderRadius: '0',
                            top: '0',
                            left: '0',
                            right: '0',
                            bottom: '0'
                          }}
                        >
                          <div className="text-center px-1">
                            <div className="font-semibold text-xs">{booking?.startTime}—{booking?.endTime}</div>
                          </div>
                        </div>
                      ) : !blocked ? (
                        <div 
                          className={`absolute inset-0 ${
                            isInHoverRange(bay, timeSlot, hoverBay, hoverSlot) && !selected 
                              ? 'bg-green-50/70' 
                              : ''
                          }`} 
                          style={{ margin: '0', padding: '0' }}
                          onMouseEnter={() => {
                            setHoverBay(bay);
                            setHoverSlot(timeSlot);
                          }}
                          onMouseLeave={() => {
                            setHoverBay(null);
                            setHoverSlot(null);
                          }}
                        >
                          <Button
                            variant={selected ? "default" : "ghost"}
                            size="sm"
                            className={`absolute inset-0 text-xs border-0 rounded-none ${
                              selected
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-green-50 hover:text-green-700 text-transparent group-hover:text-green-700'
                            }`}
                            onClick={() => onSlotSelect(bay, timeSlot)}
                            style={{ 
                              margin: '0',
                              padding: '0',
                              borderRadius: '0',
                              border: 'none'
                            }}
                          >
                            {selected ? '✓' : ''}
                            {!selected && <Plus className="h-2 w-2 hidden group-hover:inline" />}
                          </Button>
                          <div className="absolute left-0 top-0 h-full flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity pl-4">
                            <span className="text-xs text-green-700 font-medium bg-white px-1 rounded shadow-sm whitespace-nowrap">
                              {timeSlot}
                            </span>
                          </div>
                        </div>
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
