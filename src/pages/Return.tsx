import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, LayoutDashboard, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentStatus {
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'canceled' | string;
  amount?: number;
  currency?: string;
}

const Return = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const paymentIntent = urlParams.get('payment_intent');
    
    if (!paymentIntent) {
      setLoading(false);
      setError('No payment information found. Please return to the booking page.');
      return;
    }

    // Fetch the payment intent status
    fetch(`${import.meta.env.VITE_API_URL}/payment-intent-status?payment_intent=${paymentIntent}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to retrieve payment status');
        }
        return res.json();
      })
      .then((data) => {
        setPaymentStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching payment status:', err);
        setError('Failed to retrieve payment status. Please contact support.');
        setLoading(false);
      });
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Checking payment status...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (paymentStatus?.status === 'succeeded') {
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
            {paymentStatus.amount && (
              <p className="mt-4 font-medium">
                Amount paid: ${(paymentStatus.amount / 100).toFixed(2)} {paymentStatus.currency?.toUpperCase()}
              </p>
            )}
          </div>
          <div className="pt-4 flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/booking')}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Book Another Session
            </Button>
          </div>
        </div>
      );
    }

    // Payment is still processing or failed
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-amber-100 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-amber-500" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Payment {paymentStatus?.status === 'processing' ? 'Processing' : 'Incomplete'}
          </h2>
          <p className="text-muted-foreground">
            {paymentStatus?.status === 'processing'
              ? 'Your payment is being processed. We will notify you once it completes.'
              : 'Your payment was not completed. Please try again or contact support.'}
          </p>
          {paymentStatus?.status && (
            <p className="mt-2 font-medium text-sm">
              Status: {paymentStatus.status}
            </p>
          )}
        </div>
        <div className="pt-4 flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/booking')}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Return to Booking
          </Button>
        </div>
      </div>
    );
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
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderContent()}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Return; 