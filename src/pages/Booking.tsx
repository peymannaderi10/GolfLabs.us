import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { BookingCalendar } from '../components/booking/BookingCalendar';
import { BayTimeTable } from '../components/booking/BayTimeTable';
import { BookingSummary } from '../components/booking/BookingSummary';

// --- Helper Functions ---
export const TIME_INTERVAL_MINUTES = 15;
const MAX_BAYS = 8;
const MIN_SLOTS_DURATION = 1; // 1 * 15 minutes = 15 minutes
const MAX_SLOTS_DURATION = (24 * 60) / TIME_INTERVAL_MINUTES; // 24 hours = 96 slots

export const generateTimeSlots = (intervalMinutes: number = TIME_INTERVAL_MINUTES): string[] => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
};

export const formatDateToYYYYMMDD = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

export const timeToIndex = (time: string, slots: string[]): number => slots.indexOf(time);
export const indexToTime = (index: number, slots: string[]): string | undefined => slots[index];

// --- Interfaces ---
export interface Booking {
  id: string;
  bayId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM, inclusive start of the first slot
  endTime: string;   // HH:MM, inclusive start of the last slot
}

export interface SelectionState {
  bayId: number | null;
  startTime: string | null; // Inclusive start of the first selected slot
  endTime: string | null;   // Inclusive start of the last selected slot
}

// --- Mock Data ---
const MOCK_BOOKINGS_DATA: Omit<Booking, 'id' | 'date'>[] = [
  { bayId: 1, startTime: '10:00', endTime: '10:45' }, // Books 10:00, 10:15, 10:30, 10:45 (4 slots)
  { bayId: 3, startTime: '14:30', endTime: '14:45' }, // Books 14:30, 14:45 (2 slots)
  { bayId: 5, startTime: '18:00', endTime: '19:45' }, // Books 18:00 to 19:45 (8 slots, 2 hours)
  { bayId: 1, startTime: '08:00', endTime: '08:00' }, // Books 08:00 (1 slot)
];

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selection, setSelection] = useState<SelectionState>({ bayId: null, startTime: null, endTime: null });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    const dateStr = formatDateToYYYYMMDD(selectedDate);
    if (dateStr) {
      // Simulate fetching bookings for the selected date
      const newBookings: Booking[] = MOCK_BOOKINGS_DATA.map((b, index) => ({
        ...b,
        id: `${dateStr}-bay${b.bayId}-${index}`,
        date: dateStr,
      }));
      setBookings(newBookings);
      // Clear selection when date changes
      setSelection({ bayId: null, startTime: null, endTime: null });
      setError(null);
    } else {
      setBookings([]);
    }
  }, [selectedDate]);

  const isSlotBooked = useCallback((bayId: number, timeSlot: string): boolean => {
    const targetSlotIndex = timeToIndex(timeSlot, timeSlots);
    return bookings.some(booking => {
      if (booking.bayId !== bayId) return false;
      const bookingStartIndex = timeToIndex(booking.startTime, timeSlots);
      const bookingEndIndex = timeToIndex(booking.endTime, timeSlots);
      return targetSlotIndex >= bookingStartIndex && targetSlotIndex <= bookingEndIndex;
    });
  }, [bookings, timeSlots]);

  const handleSlotClick = useCallback((bayId: number, clickedTimeSlot: string) => {
    setError(null); // Clear previous errors

    if (isSlotBooked(bayId, clickedTimeSlot)) {
      setError("This time slot is already booked.");
      return;
    }

    const clickedSlotIndex = timeToIndex(clickedTimeSlot, timeSlots);

    setSelection(prevSelection => {
      // Case 1: No start time selected OR different bay selected
      if (!prevSelection.startTime || prevSelection.bayId !== bayId) {
        return { bayId, startTime: clickedTimeSlot, endTime: null };
      }

      // Case 2: Same bay selected
      const currentStartTimeIndex = timeToIndex(prevSelection.startTime!, timeSlots);

      // Case 2a: Clicked slot is the same as current start time (deselect/reset start)
      if (clickedSlotIndex === currentStartTimeIndex) {
        return { bayId: null, startTime: null, endTime: null }; // Clear entire selection
      }

      // Case 2b: Clicked slot is before current start time (set new start time)
      if (clickedSlotIndex < currentStartTimeIndex) {
        return { bayId, startTime: clickedTimeSlot, endTime: null };
      }

      // Case 2c: Clicked slot is after current start time (potential end time)
      const potentialEndTime = clickedTimeSlot;
      const potentialEndTimeIndex = clickedSlotIndex;
      
      // Validate range: no conflicts and within duration limits
      let hasConflict = false;
      for (let i = currentStartTimeIndex; i <= potentialEndTimeIndex; i++) {
        const slotInCheck = indexToTime(i, timeSlots)!;
        if (i > currentStartTimeIndex && isSlotBooked(bayId, slotInCheck)) {
          hasConflict = true;
          break;
        }
      }

      if (hasConflict) {
        setError("Selected range includes a booked slot. Please select a clear range or a new start time.");
        return { bayId, startTime: clickedTimeSlot, endTime: null };
      }

      const numberOfSlotsSelected = potentialEndTimeIndex - currentStartTimeIndex + 1;
      if (numberOfSlotsSelected < MIN_SLOTS_DURATION) {
         setError("Selection is too short. Minimum booking is 15 minutes.");
         return { bayId, startTime: clickedTimeSlot, endTime: null };
      }
      if (numberOfSlotsSelected > MAX_SLOTS_DURATION) {
        setError(`Selection is too long. Maximum booking is 4 hours (${MAX_SLOTS_DURATION * TIME_INTERVAL_MINUTES / 60} hours).`);
        return { bayId, startTime: clickedTimeSlot, endTime: null };
      }
      
      // Valid selection
      return { ...prevSelection, endTime: potentialEndTime };
    });
  }, [timeSlots, isSlotBooked]);

  const handleBookingConfirm = useCallback(() => {
    if (!selection.bayId || !selection.startTime || !selection.endTime || !selectedDate) {
      setError("Invalid selection. Please select a date, bay, start and end time.");
      return;
    }
    
    const newBooking: Booking = {
      id: `booking-${Date.now()}`, // Temporary ID
      bayId: selection.bayId,
      date: formatDateToYYYYMMDD(selectedDate),
      startTime: selection.startTime,
      endTime: selection.endTime,
    };

    // Add to bookings list (simulating successful booking)
    setBookings(prev => [...prev, newBooking]);
    
    // Log and clear selection
    console.log('Booking Confirmed:', newBooking);
    setSelection({ bayId: null, startTime: null, endTime: null });
    setError(null);
    // Potentially show a success toast
  }, [selection, selectedDate]);

  const handleClearSelection = useCallback(() => {
    setSelection({ bayId: null, startTime: null, endTime: null });
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 md:px-6">
      <div className="mb-4 md:mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Book Your Golf Bay</h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Select a day, then click a start time and an end time in an available bay.
        </p>
      </div>

      {error && (
        <div className="w-full mx-auto mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center justify-center text-sm">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Calendar - Full Width */}
      <div className="w-full mx-auto mb-4 md:mb-6">
         <BookingCalendar
            selectedDate={selectedDate}
            onDateSelect={(date) => setSelectedDate(date || null)}
            bookings={bookings}
          />
      </div>
      
      {/* BayTimeTable - Full Width Card */}
      <div className="w-full mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Clock className="h-6 w-6" />
              Available Bays & Time Slots
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedDate ? `Showing availability for ${selectedDate.toLocaleDateString()}` : "Please select a date."}
            </p>
          </CardHeader>
          <CardContent className="p-0 sm:p-2 md:p-3">
            {selectedDate ? (
              <BayTimeTable
                bayCount={MAX_BAYS}
                timeSlots={timeSlots}
                bookings={bookings}
                selection={selection}
                onSlotClick={handleSlotClick}
                isSlotBooked={isSlotBooked}
              />
            ) : (
              <p className="text-muted-foreground text-center py-10">Select a date to see availability.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <BookingSummary 
        selectedDate={selectedDate}
        selection={selection}
        timeSlots={timeSlots}
        onConfirmBooking={handleBookingConfirm}
        onClearSelection={handleClearSelection}
        timeIntervalMinutes={TIME_INTERVAL_MINUTES}
        minSlotsDuration={MIN_SLOTS_DURATION}
        maxSlotsDuration={MAX_SLOTS_DURATION}
      />
    </div>
  );
};

export default BookingPage;

// TODO:
// 1. Create BayTimeTable.tsx component
// 2. Adapt BookingSummary.tsx component
// 3. Refine styling for a cleaner, more intuitive look.
// 4. Consider adding loading states if bookings were fetched from an API.
// 5. Add more robust error handling and user feedback (e.g., toasts).
