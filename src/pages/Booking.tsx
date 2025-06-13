import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, AlertTriangle, ChevronLeft } from 'lucide-react';
import { BookingCalendar } from '../components/booking/BookingCalendar';
import { BayTimeTable } from '../components/booking/BayTimeTable';
import { BookingSummary } from '../components/booking/BookingSummary';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

// --- Helper Functions ---
export const TIME_INTERVAL_MINUTES = 15;
const MAX_BAYS = 8;
const MIN_SLOTS_DURATION = 1; // 1 * 15 minutes = 15 minutes
const MAX_SLOTS_DURATION = (24 * 60) / TIME_INTERVAL_MINUTES; // 24 hours = 96 slots

export const generateTimeSlots = (intervalMinutes: number = TIME_INTERVAL_MINUTES): string[] => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
      slots.push(`${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`);
    }
  }
  return slots;
};

export const formatDateToYYYYMMDD = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

export const timeToIndex = (time: string, slots: string[]): number => {
  // Convert 12-hour time to 24-hour time for comparison
  const [timeStr, period] = time.split(' ');
  const [hours, minutes] = timeStr.split(':').map(Number);
  const hour24 = period === 'PM' ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
  const time24 = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  // Find the corresponding 12-hour time slot
  return slots.findIndex(slot => {
    const [slotTime, slotPeriod] = slot.split(' ');
    const [slotHours, slotMinutes] = slotTime.split(':').map(Number);
    const slotHour24 = slotPeriod === 'PM' ? (slotHours === 12 ? 12 : slotHours + 12) : (slotHours === 12 ? 0 : slotHours);
    const slotTime24 = `${slotHour24.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
    return slotTime24 === time24;
  });
};

export const indexToTime = (index: number, slots: string[]): string | undefined => slots[index];

// --- Interfaces ---
export interface Booking {
  id: string;
  bayId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM, inclusive start of the first slot
  endTime: string;   // HH:MM, inclusive start of the last slot
}

export interface SelectionState {
  bayId: string | null;
  startTime: string | null; // Inclusive start of the first selected slot
  endTime: string | null;   // Inclusive start of the last selected slot
}

// --- Mock Data ---
const MOCK_BOOKINGS_DATA: Omit<Booking, 'id' | 'date'>[] = [
  { bayId: '550e8400-e29b-41d4-a716-446655440000', startTime: '10:00', endTime: '10:45' }, // Bay 1
  { bayId: '550e8400-e29b-41d4-a716-446655440001', startTime: '14:30', endTime: '14:45' }, // Bay 2
  { bayId: '550e8400-e29b-41d4-a716-446655440002', startTime: '18:00', endTime: '19:45' }, // Bay 3
  { bayId: '550e8400-e29b-41d4-a716-446655440003', startTime: '08:00', endTime: '08:00' }, // Bay 4
];

const BookingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selection, setSelection] = useState<SelectionState>({ bayId: null, startTime: null, endTime: null });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const isSlotBooked = useCallback((bayId: string, timeSlot: string): boolean => {
    const targetSlotIndex = timeToIndex(timeSlot, timeSlots);
    return bookings.some(booking => {
      if (booking.bayId !== bayId) return false;
      const bookingStartIndex = timeToIndex(booking.startTime, timeSlots);
      const bookingEndIndex = timeToIndex(booking.endTime, timeSlots);
      return targetSlotIndex >= bookingStartIndex && targetSlotIndex <= bookingEndIndex;
    });
  }, [bookings, timeSlots]);

  const handleSlotClick = useCallback((bayId: string, clickedTimeSlot: string) => {
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
    
    // Calculate duration
    const startIndex = timeToIndex(selection.startTime, timeSlots);
    const endIndex = timeToIndex(selection.endTime, timeSlots);
    const durationMinutes = (endIndex - startIndex) * TIME_INTERVAL_MINUTES;
    const duration = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;
    
    // Calculate price
    let totalPrice = 0;
    for (let i = startIndex; i < endIndex; i++) {
      const timeSlot = timeSlots[i];
      const hour = parseInt(timeSlot.split(':')[0]);
      const isDayRate = hour >= 9 && hour < 22; // Day rate from 9am to 10pm
      const rate = isDayRate ? 35 : 25; // $35/hr day rate, $25/hr night rate
      totalPrice += (rate / 4); // Divide by 4 since we're working with 15-minute intervals
    }
    
    // Prepare booking details for checkout
    const bookingDetails = {
      selectedDate,
      bayId: selection.bayId,
      startTime: selection.startTime,
      endTime: selection.endTime,
      duration,
      price: totalPrice
    };
    
    // Navigate to checkout page with booking details
    navigate('/checkout', { state: { bookingDetails } });
    
  }, [selection, selectedDate, timeSlots, navigate]);

  const handleClearSelection = useCallback(() => {
    setSelection({ bayId: null, startTime: null, endTime: null });
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full z-50 bg-background/80 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl font-bold text-foreground"
            >
              <span className="text-primary">GOLF</span><span className="text-foreground">LABS</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to="/">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <div className="px-4 md:px-6 pb-24">
        <div className="mb-4 md:mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Book Your Golf Bay</h1>

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
                Select a start and end time, open booking details to confirm.
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
