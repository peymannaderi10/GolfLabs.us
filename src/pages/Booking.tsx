
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { BookingTable } from '@/components/booking/BookingTable';
import { DurationSelector } from '@/components/booking/DurationSelector';
import { BookingSummary } from '@/components/booking/BookingSummary';

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBay, setSelectedBay] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  const handleSlotSelect = (bay: number, timeSlot: string) => {
    setSelectedBay(bay);
    setSelectedTimeSlot(timeSlot);
  };

  const handleBooking = () => {
    if (selectedDate && selectedTimeSlot && selectedBay) {
      console.log('Booking:', {
        date: selectedDate,
        bay: selectedBay,
        time: selectedTimeSlot,
        duration: selectedDuration
      });
      // Handle booking logic here
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Golf Bay</h1>
          <p className="text-xl opacity-90">Select your preferred date, bay, and time slot</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Date Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BookingCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card className="mt-6 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DurationSelector
                  duration={selectedDuration}
                  onDurationChange={setSelectedDuration}
                />
                
                <BookingSummary
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  selectedBay={selectedBay}
                  duration={selectedDuration}
                />

                <Button 
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTimeSlot || !selectedBay}
                  className="w-full"
                  size="lg"
                >
                  Book Bay {selectedBay || '#'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bay and Time Selection Table */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Available Time Slots & Bays
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a bay and time slot. Red slots are already booked.
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <BookingTable
                    selectedDate={selectedDate}
                    selectedBay={selectedBay}
                    selectedTimeSlot={selectedTimeSlot}
                    onSlotSelect={handleSlotSelect}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
