import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, DollarSign, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from '../components/checkout/StripeCheckoutForm';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper function to parse time string (e.g., "2:30 PM") and return hours and minutes
const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  const isPM = period === 'PM';
  const hour24 = isPM ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours);
  return { hours: hour24, minutes };
};

// Helper function to create ISO timestamp from date and time string
const createISOTimestamp = (date: Date, timeStr: string): string => {
  const { hours, minutes } = parseTimeString(timeStr);
  const timestamp = new Date(date);
  timestamp.setHours(hours, minutes, 0, 0);
  return timestamp.toISOString();
};

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface BookingDetails {
  selectedDate: Date;
  bayId: number;
  startTime: string;
  endTime: string;
  duration: string;
  price: number;
}

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDetails = location.state?.bookingDetails as BookingDetails;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingDetails) {
      setIsLoading(false);
      return;
    }

    // Create PaymentIntent as soon as the page loads
    setIsLoading(true);
    
    const requestBody = {
      amount: Math.round(bookingDetails.price * 100), // Convert to cents
      bookingDetails: {
        date: bookingDetails.selectedDate.toISOString(),
        bayId: bookingDetails.bayId,
        startTime: createISOTimestamp(bookingDetails.selectedDate, bookingDetails.startTime),
        endTime: createISOTimestamp(bookingDetails.selectedDate, bookingDetails.endTime),
        duration: bookingDetails.duration,
        locationId: '6f4dfdfe-a5a3-46c5-bd09-70db1ce2d0aa', // Default location ID
        userId: crypto.randomUUID(), // Generate a random UUID for the user
      }
    };

    console.log('Sending booking details:', requestBody); // Debug log

    fetch(`${import.meta.env.VITE_API_URL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to create payment intent');
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setError(error.message || 'An error occurred while setting up payment');
        setIsLoading(false);
      });
}, [bookingDetails]);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-center mb-4">Invalid Booking</h2>
            <p className="text-muted-foreground text-center mb-6">No booking details found. Please return to the booking page.</p>
            <Button 
              onClick={() => navigate('/booking')} 
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
                onClick={() => navigate('/booking')}
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
              
              {/* Booking Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" /> Date:
                  </div>
                  <span className="font-medium text-foreground">
                    {new Date(bookingDetails.selectedDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" /> Bay:
                  </div>
                  <span className="font-medium text-foreground">{bookingDetails.bayId}</span>
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
                    onSuccess={() => {
                      // Payment will be processed by Stripe and the user will be redirected to the return_url
                      console.log('Initiating payment process');
                    }}
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