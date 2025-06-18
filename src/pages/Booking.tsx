import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, AlertTriangle, ChevronLeft } from 'lucide-react';
import { BookingCalendar } from '../components/booking/BookingCalendar';
import { BayTimeTable } from '../components/booking/BayTimeTable';
import { BookingSummary } from '../components/booking/BookingSummary';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { BOOKING, BAY_IDS, LOCATION_IDS, API } from '@/constants';
import { format } from 'date-fns';

// --- Helper Functions ---
export const TIME_INTERVAL_MINUTES = BOOKING.TIME_INTERVAL_MINUTES;
const MAX_BAYS = BOOKING.MAX_BAYS;
const MIN_SLOTS_DURATION = BOOKING.MIN_SLOTS_DURATION;
const MAX_SLOTS_DURATION = BOOKING.MAX_SLOTS_DURATION;

// Format date to YYYY-MM-DD
export const formatDateToYYYYMMDD = (date: Date | null): string => {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
};

// Convert UTC time string to local time string
export const convertUTCToLocalTime = (timeString: string): string => {
  try {
    // Check if it's already a formatted time string (e.g., "2:00 PM")
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString; // Already formatted, return as is
    }
    
    // Check if it's a full timestamp
    if (timeString.includes('T') || timeString.includes('-')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC' // Ensure we're working with UTC times
      });
    }
    
    // If it's just a time string (e.g., "14:00:00")
    const [hours, minutes] = timeString.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const period = hours < 12 ? 'AM' : 'PM';
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error("Error converting time:", error, timeString);
    return timeString; // Return original on error
  }
};

// Generate time slots from 00:00 to 23:45 with 15-minute intervals
export const generateTimeSlots = (): string[] => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += TIME_INTERVAL_MINUTES) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      const time = `${h}:${m}`;
      
      // Convert to 12-hour format with AM/PM
      const hour12 = hour % 12 || 12;
      const period = hour < 12 ? 'AM' : 'PM';
      const time12 = `${hour12}:${m} ${period}`;
      
      slots.push(time12);
    }
  }
  return slots;
};

// Convert time to index in timeSlots array
export const timeToIndex = (timeString: string, timeSlots: string[]): number => {
  return timeSlots.findIndex(t => t === timeString);
};

// --- Interfaces ---
export interface Booking {
  id: string;
  bayId: string;
  startTime: string; // UTC timestamp from backend
  endTime: string;   // UTC timestamp from backend
}

export interface SelectionState {
  bayId: string | null;
  startTime: string | null;
  endTime: string | null;
}

// BookingPage component
const BookingPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selection, setSelection] = useState<SelectionState>({
    bayId: null,
    startTime: null,
    endTime: null,
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceDetails, setPriceDetails] = useState<{ total: number; breakdown: any[] } | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  const navigate = useNavigate();
  
  // Time slots generation (00:00 to 23:45 in 15-minute intervals)
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Fetch bookings when the selected date changes
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Format date as YYYY-MM-DD for API
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        const response = await fetch(`${API.BASE_URL}/bookings?locationId=${LOCATION_IDS.CHERRY_HILL}&date=${formattedDate}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        
        // Safely convert time formats, handling both old and new formats
        const formattedBookings = data.map((booking: any) => {
          try {
            return {
              id: booking.id,
              bayId: booking.bayId,
              startTime: convertUTCToLocalTime(booking.startTime),
              endTime: convertUTCToLocalTime(booking.endTime)
            };
          } catch (error) {
            console.error("Error processing booking:", error, booking);
            return booking; // Return original on error
          }
        });
        
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [selectedDate]);

  const createISOForBackend = (date: Date, timeString: string): string => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const isPM = period.toUpperCase() === 'PM';
    let hour24 = hours;
    if (isPM && hours < 12) {
      hour24 += 12;
    }
    if (!isPM && hours === 12) { // Midnight case (12 AM)
      hour24 = 0;
    }

    const isoDate = new Date(date);
    // We use UTC hours because the backend expects UTC timestamps
    isoDate.setUTCHours(hour24, minutes, 0, 0);
    return isoDate.toISOString();
  };

  useEffect(() => {
      const calculatePrice = async () => {
          if (selection.startTime && selection.endTime && selectedDate) {
              setIsCalculatingPrice(true);
              setPriceDetails(null);
              setError(null);

              try {
                  const startTimeISO = createISOForBackend(selectedDate, selection.startTime);
                  const endTimeISO = createISOForBackend(selectedDate, selection.endTime);

                  const response = await fetch(`${API.BASE_URL}/calculate-price`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          locationId: LOCATION_IDS.CHERRY_HILL,
                          startTime: startTimeISO,
                          endTime: endTimeISO,
                      }),
                  });

                  if (!response.ok) {
                      const err = await response.json();
                      throw new Error(err.error || 'Failed to calculate price');
                  }

                  const data = await response.json();
                  setPriceDetails(data);

              } catch (err: any) {
                  console.error('Error calculating price:', err);
                  setError(err.message);
                  setPriceDetails(null);
              } finally {
                  setIsCalculatingPrice(false);
              }
          } else {
            // Clear price if selection is incomplete
            setPriceDetails(null);
          }
      };

      calculatePrice();
  }, [selection.startTime, selection.endTime, selectedDate]);

  // Check if a slot is booked
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
        const slotInCheck = timeSlots[i];
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
    
    if (isCalculatingPrice || !priceDetails) {
        setError("Price is still being calculated or an error occurred. Please wait.");
        return;
    }

    // Calculate duration
    const startIndex = timeToIndex(selection.startTime, timeSlots);
    const endIndex = timeToIndex(selection.endTime, timeSlots);
    const durationMinutes = (endIndex - startIndex + 1) * TIME_INTERVAL_MINUTES; // +1 to include the end slot
    const duration = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;
    
    // Prepare booking details for checkout
    const bookingDetails = {
      selectedDate,
      bayId: selection.bayId,
      startTime: selection.startTime,
      endTime: selection.endTime,
      duration,
      price: priceDetails.total / 100 // convert cents to dollars
    };
    
    // Navigate to checkout page with booking details
    navigate('/checkout', { state: { bookingDetails } });
    
  }, [selection, selectedDate, timeSlots, navigate, priceDetails, isCalculatingPrice]);

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
                  selectedDate={selectedDate}
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
          onConfirmBooking={handleBookingConfirm}
          onClearSelection={handleClearSelection}
          priceDetails={priceDetails}
          isCalculatingPrice={isCalculatingPrice}
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
