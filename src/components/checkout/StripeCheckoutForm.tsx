import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutFormProps {
  amount: number;
  clientSecret: string;
  onSuccess?: () => void;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export function StripeCheckoutForm({ amount, clientSecret, onSuccess }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Update payment intent with user information
      await fetch('http://localhost:4242/update-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0],
          email: user?.email,
          firstName: profile?.full_name?.split(' ')[0] || '',
          lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
          phone: profile?.phone || '',
        }),
      });

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/return`,
          payment_method_data: {
            billing_details: {
              name: profile?.full_name || '',
              email: user?.email || '',
              phone: profile?.phone || '',
            },
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: error.message || "An error occurred while processing your payment.",
        });
      } else {
        toast({
          title: "Payment processing",
          description: "Your payment is being processed. Please wait...",
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: profile?.full_name || '',
                email: user?.email || '',
                phone: profile?.phone || '',
              },
            },
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>
    </form>
  );
} 