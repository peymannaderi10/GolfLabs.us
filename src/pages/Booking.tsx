import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, AlertTriangle, ChevronLeft } from 'lucide-react';
import { BookingCalendar } from '../components/booking/BookingCalendar';
import { BayTimeTable } from '../components/booking/BayTimeTable';
import { BookingSummary } from '../components/booking/BookingSummary';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { BOOKING, API } from '@/constants';
import { useLocation } from '@/contexts/LocationContext';
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

// Generate time slots from 00:00 to 23:45 with 15-minute intervals, plus 23:59
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
  
  // Add the final slot at 11:59 PM
  slots.push('11:59 PM');
  
  return slots;
};

// Convert time to index in timeSlots array
export const timeToIndex = (timeString: string, timeSlots: string[]): number => {
  return timeSlots.findIndex(t => t === timeString);
};

// Helper function to check if a time slot is in the past for the current day
const isTimeSlotInPast = (selectedDate: Date, timeSlot: string, timezone: string): boolean => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selectedDay = new Date(selectedDate);
  selectedDay.setHours(0, 0, 0, 0);
  
  // If the selected date is not today, don't restrict
  if (selectedDay.getTime() !== today.getTime()) {
    return false;
  }
  
  // Parse the time slot (e.g., "8:00 PM" or "8:15 AM")
  const [time, period] = timeSlot.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  // Create a date object for the time slot on the selected date in the location's timezone
  const slotTime = new Date(selectedDate);
  slotTime.setHours(hour24, minutes, 0, 0);
  
  // Convert current time to location timezone for comparison
  const nowInLocationTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  // Check if the slot time is before the current time
  return slotTime < nowInLocationTz;
};

// --- Interfaces ---
export interface Booking {
  id: string;
  bayId: string;
  startTime: string; // Already formatted time string from backend
  endTime: string;   // Already formatted time string from backend
}

export interface Bay {
  id: string;
  bay_number: number;
  name: string;
  status: string;
  location_id: string;
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
  const [bays, setBays] = useState<Bay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceDetails, setPriceDetails] = useState<{ total: number; breakdown: any[] } | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  const navigate = useNavigate();
  const { currentLocation, getLocationTimezone } = useLocation();
  
  // Time slots generation (00:00 to 23:45 in 15-minute intervals)
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Filter out past time slots for the current day using location timezone
  const availableTimeSlots = useMemo(() => {
    if (!currentLocation) return timeSlots;
    return timeSlots.filter(timeSlot => !isTimeSlotInPast(selectedDate, timeSlot, currentLocation.timezone));
  }, [timeSlots, selectedDate, currentLocation]);

  // Fetch bays when component mounts or location changes
  useEffect(() => {
    const fetchBays = async () => {
      if (!currentLocation) return;
      
      try {
        const response = await fetch(`${API.BASE_URL}/bays?locationId=${currentLocation.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch bays');
        }
        
        const data = await response.json();
        // Sort bays by bay_number for consistent ordering
        const sortedBays = data.sort((a: Bay, b: Bay) => a.bay_number - b.bay_number);
        setBays(sortedBays);
      } catch (error) {
        console.error('Error fetching bays:', error);
        setError('Failed to load bay information. Please try again.');
      }
    };
    
    fetchBays();
  }, [currentLocation]);

  // Fetch bookings when the selected date or location changes
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentLocation) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Format date as YYYY-MM-DD for API
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        const response = await fetch(`${API.BASE_URL}/bookings?locationId=${currentLocation.id}&date=${formattedDate}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        
        // Backend now returns properly formatted booking data, no conversion needed
        const formattedBookings = data.map((booking: any) => ({
          id: booking.id,
          bayId: booking.bayId,
          startTime: booking.startTime,
          endTime: booking.endTime
        }));
        
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [selectedDate, currentLocation]);

  // Helper function to create ISO timestamp for backend
  const createISOTimestamp = (date: Date, timeString: string): string => {
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
    isoDate.setHours(hour24, minutes, 0, 0);
    return isoDate.toISOString();
  };

  useEffect(() => {
      const calculatePrice = async () => {
          if (selection.startTime && selection.endTime && selectedDate && currentLocation) {
              setIsCalculatingPrice(true);
              setPriceDetails(null);
              setError(null);

              try {
                  const startTimeISO = createISOTimestamp(selectedDate, selection.startTime);
                  const endTimeISO = createISOTimestamp(selectedDate, selection.endTime);

                  const response = await fetch(`${API.BASE_URL}/calculate-price`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          locationId: currentLocation.id,
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
  }, [selection.startTime, selection.endTime, selectedDate, currentLocation]);

  // Check if a slot is booked
  const isSlotBooked = useCallback((bayId: string, timeSlot: string): boolean => {
    const targetSlotIndex = timeToIndex(timeSlot, availableTimeSlots);
    return bookings.some(booking => {
      if (booking.bayId !== bayId) return false;
      const bookingStartIndex = timeToIndex(booking.startTime, availableTimeSlots);
      const bookingEndIndex = timeToIndex(booking.endTime, availableTimeSlots);
      return targetSlotIndex >= bookingStartIndex && targetSlotIndex <= bookingEndIndex;
    });
  }, [bookings, availableTimeSlots]);

  const handleSlotClick = useCallback((bayId: string, clickedTimeSlot: string) => {
    setError(null); // Clear previous errors

    // Find the bay to check its status
    const selectedBay = bays.find(bay => bay.id === bayId);
    if (!selectedBay || selectedBay.status !== 'available') {
      setError("This bay is currently unavailable.");
      return;
    }

    if (isSlotBooked(bayId, clickedTimeSlot)) {
      setError("This time slot is already booked.");
      return;
    }

    const clickedSlotIndex = timeToIndex(clickedTimeSlot, availableTimeSlots);

    setSelection(prevSelection => {
      // Case 1: No start time selected OR different bay selected
      if (!prevSelection.startTime || prevSelection.bayId !== bayId) {
        return { bayId, startTime: clickedTimeSlot, endTime: null };
      }

      // Case 2: Same bay selected
      const currentStartTimeIndex = timeToIndex(prevSelection.startTime!, availableTimeSlots);

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
        const slotInCheck = availableTimeSlots[i];
        if (i > currentStartTimeIndex && isSlotBooked(bayId, slotInCheck)) {
          hasConflict = true;
          break;
        }
      }

      if (hasConflict) {
        setError("Selected range includes a booked slot. Please select a clear range or a new start time.");
        return { bayId, startTime: clickedTimeSlot, endTime: null };
      }

      // Calculate the actual time duration (not slot count) for validation
      // This matches the calculation in handleBookingConfirm
      const timeDifferenceSlots = potentialEndTimeIndex - currentStartTimeIndex;
      const durationMinutes = timeDifferenceSlots * TIME_INTERVAL_MINUTES;
      
      if (durationMinutes < MIN_SLOTS_DURATION * TIME_INTERVAL_MINUTES) {
         setError("Selection is too short. Minimum booking is 15 minutes.");
         return { bayId, startTime: clickedTimeSlot, endTime: null };
      }
      if (durationMinutes > MAX_SLOTS_DURATION * TIME_INTERVAL_MINUTES) {
        setError(`Selection is too long. Maximum booking is 4 hours (${MAX_SLOTS_DURATION * TIME_INTERVAL_MINUTES / 60} hours).`);
        return { bayId, startTime: clickedTimeSlot, endTime: null };
      }
      
      // Valid selection
      return { ...prevSelection, endTime: potentialEndTime };
    });
  }, [availableTimeSlots, isSlotBooked, bays]);

  const handleBookingConfirm = useCallback(() => {
    if (!selection.bayId || !selection.startTime || !selection.endTime || !selectedDate) {
      setError("Invalid selection. Please select a date, bay, start and end time.");
      return;
    }
    
    if (isCalculatingPrice || !priceDetails) {
        setError("Price is still being calculated or an error occurred. Please wait.");
        return;
    }

    // Calculate duration - properly calculate time difference between start and end
    const startIndex = timeToIndex(selection.startTime, availableTimeSlots);
    const endIndex = timeToIndex(selection.endTime, availableTimeSlots);
    
    // For duration calculation, we need the actual time difference, not slot count
    // If someone selects 9:00 PM to 9:15 PM, that's 15 minutes (not 30)
    // If someone selects 9:00 PM to 9:30 PM, that's 30 minutes (not 45)
    const durationMinutes = (endIndex - startIndex) * TIME_INTERVAL_MINUTES;
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
    
  }, [selection, selectedDate, availableTimeSlots, navigate, priceDetails, isCalculatingPrice]);

  const handleClearSelection = useCallback(() => {
    setSelection({ bayId: null, startTime: null, endTime: null });
    setError(null);
  }, []);

  // Show loading or error if location is not available
  if (!currentLocation) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading location...</h2>
          <p className="text-muted-foreground">Please wait while we load the location information.</p>
        </div>
      </div>
    );
  }

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
          <p className="text-muted-foreground">{currentLocation.name}</p>
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
              {selectedDate && bays.length > 0 ? (
                <BayTimeTable
                  bays={bays}
                  timeSlots={availableTimeSlots}
                  bookings={bookings}
                  selection={selection}
                  selectedDate={selectedDate}
                  onSlotClick={handleSlotClick}
                  isSlotBooked={isSlotBooked}
                />
              ) : (
                <p className="text-muted-foreground text-center py-10">
                  {bays.length === 0 ? 'Loading bay information...' : 'Select a date to see availability.'}
                </p>
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
