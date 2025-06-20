import React, { useEffect, useState } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, DollarSign, ChevronLeft, CheckCircle, AlertCircle, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from '../components/checkout/StripeCheckoutForm';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BAY_NUMBERS, API } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { format } from 'date-fns';

// Session storage utilities for booking details
const BOOKING_SESSION_KEY = 'golflabs_checkout_booking';
const RESERVATION_SESSION_KEY = 'golflabs_checkout_reservation';

const saveBookingToSession = (bookingDetails: BookingDetails) => {
  try {
    sessionStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify({
      ...bookingDetails,
      selectedDate: bookingDetails.selectedDate.toISOString()
    }));
  } catch (error) {
    console.warn('Failed to save booking to session storage:', error);
  }
};

const loadBookingFromSession = (): BookingDetails | null => {
  try {
    const stored = sessionStorage.getItem(BOOKING_SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        selectedDate: new Date(parsed.selectedDate)
      };
    }
  } catch (error) {
    console.warn('Failed to load booking from session storage:', error);
  }
  return null;
};

const saveReservationToSession = (bookingId: string, expiresAt: string) => {
  try {
    sessionStorage.setItem(RESERVATION_SESSION_KEY, JSON.stringify({
      bookingId,
      expiresAt,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to save reservation to session storage:', error);
  }
};

const loadReservationFromSession = (): { bookingId: string; expiresAt: string } | null => {
  try {
    const stored = sessionStorage.getItem(RESERVATION_SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if the stored reservation is still valid (not expired)
      const expiresAt = new Date(parsed.expiresAt);
      if (expiresAt > new Date()) {
        return parsed;
      } else {
        // Clean up expired reservation
        sessionStorage.removeItem(RESERVATION_SESSION_KEY);
      }
    }
  } catch (error) {
    console.warn('Failed to load reservation from session storage:', error);
  }
  return null;
};

const clearCheckoutSession = () => {
  try {
    sessionStorage.removeItem(BOOKING_SESSION_KEY);
    sessionStorage.removeItem(RESERVATION_SESSION_KEY);
  } catch (error) {
    console.warn('Failed to clear checkout session:', error);
  }
};

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(API.STRIPE_PUBLISHABLE_KEY);

interface BookingDetails {
  selectedDate: Date;
  bayId: string;
  startTime: string;
  endTime: string;
  duration: string;
  price: number;
}

interface ExistingReservation {
  id: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  expiresAt: string;
  bayId: string;
  locationId: string;
  bayName: string;
  bayNumber: string;
}

const CheckoutPage = () => {
  const location = useRouterLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLocation, formatDateInLocationTimezone } = useLocation();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [existingReservation, setExistingReservation] = useState<ExistingReservation | null>(null);
  
  // Timer state - 2 minutes = 120 seconds
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerExpired, setTimerExpired] = useState(false);

  // Initialize booking details from location state or session storage
  useEffect(() => {
    const locationBookingDetails = location.state?.bookingDetails as BookingDetails;
    
    if (locationBookingDetails) {
      // Save to session storage for persistence
      saveBookingToSession(locationBookingDetails);
      setBookingDetails(locationBookingDetails);
    } else {
      // Try to load from session storage
      const sessionBookingDetails = loadBookingFromSession();
      if (sessionBookingDetails) {
        setBookingDetails(sessionBookingDetails);
      }
    }
  }, [location.state]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setTimerExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setTimerExpired(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Check for existing reservations and handle booking creation
  useEffect(() => {
    if (!bookingDetails || !user || !currentLocation) {
      setIsLoading(false);
      return;
    }

    const handleBookingFlow = async () => {
      try {
        setIsLoading(true);
        
        // First, check if we have a valid reservation in session storage
        const sessionReservation = loadReservationFromSession();
        if (sessionReservation) {
          console.log('Found existing reservation in session:', sessionReservation.bookingId);
          
          // Validate that this booking is still valid by checking its status
          try {
            const validationResponse = await fetch(`${API.BASE_URL}/users/${user.id}/bookings/reserved`);
            if (validationResponse.ok) {
              const validationData = await validationResponse.json();
              const activeReservation = validationData.reservation;
              
              // Check if the session booking matches an active reservation
              if (!activeReservation || activeReservation.id !== sessionReservation.bookingId) {
                console.log('Session booking is no longer valid, clearing session and creating new booking');
                clearCheckoutSession();
                await createNewReservation();
                return;
              }
              
              // Session booking is still valid, use it
              setBookingId(sessionReservation.bookingId);
              
              // Calculate remaining time
              const expiresAt = new Date(sessionReservation.expiresAt);
              const now = new Date();
              const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
              setTimeLeft(remainingSeconds);
              
              // Create payment intent for existing reservation
              await createPaymentIntent(sessionReservation.bookingId);
              return;
            } else {
              // Unable to validate, clear session and create new booking
              console.log('Unable to validate session booking, creating new one');
              clearCheckoutSession();
              await createNewReservation();
              return;
            }
          } catch (validationError) {
            console.warn('Error validating session booking:', validationError);
            clearCheckoutSession();
            await createNewReservation();
            return;
          }
        }

        // Check for existing reservations in the database
        const reservationResponse = await fetch(`${API.BASE_URL}/users/${user.id}/bookings/reserved`);
        if (reservationResponse.ok) {
          const reservationData = await reservationResponse.json();
          
          if (reservationData.reservation) {
            console.log('Found existing reservation in database:', reservationData.reservation);
            const reservation = reservationData.reservation;
            
            // Check if this reservation matches our current booking details
            const reservationDate = new Date(reservation.startTime).toDateString();
            const bookingDate = bookingDetails.selectedDate.toDateString();
            
            if (reservationDate === bookingDate && 
                reservation.bayId === bookingDetails.bayId) {
              // This is the same booking, use the existing reservation
              setBookingId(reservation.id);
              setExistingReservation(reservation);
              
              // Save to session storage
              saveReservationToSession(reservation.id, reservation.expiresAt);
              
              // Calculate remaining time
              const expiresAt = new Date(reservation.expiresAt);
              const now = new Date();
              const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
              setTimeLeft(remainingSeconds);
              
              // Create payment intent for existing reservation
              await createPaymentIntent(reservation.id);
              return;
            } else {
              // Different booking, show error
              setError('You already have a pending reservation. Please complete or cancel it before making a new booking.');
              setIsLoading(false);
              return;
            }
          }
        }

        // No existing reservation, create a new one
        await createNewReservation();

      } catch (error) {
        console.error('Error in booking flow:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while setting up your booking');
        setIsLoading(false);
      }
    };

    const createNewReservation = async () => {
        const reservationResponse = await fetch(`${API.BASE_URL}/bookings/reserve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          date: format(bookingDetails.selectedDate, 'yyyy-MM-dd'),
            bayId: bookingDetails.bayId,
            startTime: bookingDetails.startTime,
            endTime: bookingDetails.endTime,
          partySize: 1,
          userId: user.id,
            locationId: currentLocation.id,
          totalAmount: bookingDetails.price,
          }),
        });

        if (!reservationResponse.ok) {
          const errorData = await reservationResponse.json();
        if (reservationResponse.status === 409 || errorData.error?.includes('no longer available')) {
            throw new Error('This time slot is no longer available. Please select a different time.');
          }
        throw new Error(errorData.error || 'Failed to create reservation');
        }

        const reservationData = await reservationResponse.json();
        setBookingId(reservationData.bookingId);

      // Save reservation to session storage
      saveReservationToSession(reservationData.bookingId, reservationData.expiresAt);

      // Create payment intent
      await createPaymentIntent(reservationData.bookingId);
    };

    const createPaymentIntent = async (bookingId: string) => {
      const paymentResponse = await fetch(`${API.BASE_URL}/bookings/${bookingId}/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          amount: Math.round(bookingDetails.price * 100),
          }),
        });

        if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        if (paymentResponse.status === 410) {
          // Reservation expired
          clearCheckoutSession();
          setTimerExpired(true);
          return;
        }
        throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const paymentData = await paymentResponse.json();
        setClientSecret(paymentData.clientSecret);
        setIsLoading(false);
    };

    handleBookingFlow();
  }, [bookingDetails, user, currentLocation]);

  // Clean up session storage when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Only clear if payment was successful or user explicitly navigated away
      if (window.location.pathname !== '/checkout') {
        clearCheckoutSession();
      }
    };
  }, []);

  if (!bookingDetails || !currentLocation) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-center mb-4">Invalid Booking</h2>
            <p className="text-muted-foreground text-center mb-6">No booking details found. Please return to the booking page.</p>
            <Button 
              onClick={() => {
                clearCheckoutSession();
                navigate('/booking');
              }} 
              className="w-full"
            >
              Return to Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appearance = {
    theme: 'flat' as const,
    variables: {
      colorPrimary: '#0f172a',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    },
  };

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
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                onClick={() => {
                  clearCheckoutSession();
                  navigate('/booking');
                }}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Booking
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Reservation Timer */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className={`${timerExpired ? 'border-destructive bg-destructive/10' : timeLeft <= 30 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-primary bg-primary/10'}`}>
                  <div className="flex items-center">
                    <Timer className={`h-4 w-4 mr-2 flex-shrink-0 ${timerExpired ? 'text-destructive' : timeLeft <= 30 ? 'text-orange-500' : 'text-primary'}`} />
                    <AlertDescription className={`font-medium ${timerExpired ? 'text-destructive' : timeLeft <= 30 ? 'text-orange-600 dark:text-orange-400' : 'text-primary'}`}>
                      {timerExpired ? (
                        'Time expired! Your reservation has been released. Please book again.'
                      ) : (
                        <>
                          Reserved spot expires in: <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
                        </>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              </motion.div>
              
              {/* Booking Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" /> Date:
                  </div>
                  <span className="font-medium text-foreground">
                    {formatDateInLocationTimezone(bookingDetails.selectedDate, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" /> Bay:
                  </div>
                  <span className="font-medium text-foreground">Bay {BAY_NUMBERS[bookingDetails.bayId]}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" /> Time:
                  </div>
                  <span className="font-medium text-foreground">
                    {bookingDetails.startTime} - {bookingDetails.endTime}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center text-muted-foreground font-semibold">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" /> Duration:
                  </div>
                  <span className="font-bold text-primary text-base">{bookingDetails.duration}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center text-muted-foreground font-semibold">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" /> Total Price:
                  </div>
                  <span className="font-bold text-primary text-base">${bookingDetails.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Form */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-4 text-muted-foreground">Setting up payment...</p>
                </div>
              ) : timerExpired ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <h3 className="text-lg font-semibold text-destructive">Reservation Expired</h3>
                  <p className="text-muted-foreground text-center">Your 2-minute reservation window has expired. Please return to booking to select a new time slot.</p>
                  <Button 
                    onClick={() => {
                      clearCheckoutSession();
                      navigate('/booking');
                    }} 
                    className="mt-4"
                  >
                    Return to Booking
                  </Button>
                </div>
              ) : clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret,
                    appearance,
                  }}
                >
                  <StripeCheckoutForm 
                    amount={Math.round(bookingDetails.price * 100)}
                    clientSecret={clientSecret}
                  />
                </Elements>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Unable to initialize payment form. Please try again later.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage; 