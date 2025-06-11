import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ 
  amount, 
  clientSecret,
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  // Form fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Input handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(null);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
    setFirstNameError(null);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
    setLastNameError(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    setPhoneError(null);
  };

  // Validation handlers
  const handleEmailBlur = () => {
    if (!email) return;
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    }
  };

  const handlePhoneBlur = () => {
    if (!phone) return;
    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number');
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    }

    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    }

    return isValid;
  };

  const updatePaymentIntentMetadata = async () => {
    try {
      // Extract payment intent ID from client secret
      // Client secret format: pi_xxxxx_secret_xxxxx
      const paymentIntentId = clientSecret.split('_secret_')[0];

      const response = await fetch(`${import.meta.env.VITE_API_URL}/update-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          phone: phone
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment intent');
      }

      return true;
    } catch (error) {
      console.error('Error updating payment intent:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Update payment intent with customer metadata before confirming
      const updateSuccess = await updatePaymentIntentMetadata();
      if (!updateSuccess) {
        setMessage('Failed to save customer information. Please try again.');
        setIsLoading(false);
        return;
      }

      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/return`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              name: `${firstName} ${lastName}`,
              email: email,
              phone: phone,
            }
          }
        },
      });

      if (error) {
        setMessage(error.message || 'An error occurred during payment');
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Information</h3>
        
        {/* Name Fields - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={handleFirstNameChange}
              placeholder="John"
              className={firstNameError ? "border-destructive" : ""}
            />
            {firstNameError && (
              <p className="text-sm text-destructive">{firstNameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={handleLastNameChange}
              placeholder="Doe"
              className={lastNameError ? "border-destructive" : ""}
            />
            {lastNameError && (
              <p className="text-sm text-destructive">{lastNameError}</p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="john.doe@example.com"
            className={emailError ? "border-destructive" : ""}
          />
          {emailError && (
            <p className="text-sm text-destructive">{emailError}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            placeholder="(555) 123-4567"
            className={phoneError ? "border-destructive" : ""}
          />
          {phoneError && (
            <p className="text-sm text-destructive">{phoneError}</p>
          )}
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        <PaymentElement id="payment-element" />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Processing...
          </div>
        ) : (
          `Pay $${(amount / 100).toFixed(2)} now`
        )}
      </Button>

      {/* Error Message */}
      {message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};