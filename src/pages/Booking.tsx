
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { TimeSlotSelector } from '@/components/booking/TimeSlotSelector';
import { DurationSelector } from '@/components/booking/DurationSelector';
import { BookingSummary } from '@/components/booking/BookingSummary';

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  const handleBooking = () => {
    if (selectedDate && selectedTimeSlot) {
      console.log('Booking:', {
        date: selectedDate,
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Session</h1>
          <p className="text-xl opacity-90">Select your preferred date, time, and duration</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
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

            {selectedDate && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Available Time Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimeSlotSelector
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    onTimeSlotSelect={setSelectedTimeSlot}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DurationSelector
                  duration={selectedDuration}
                  onDurationChange={setSelectedDuration}
                />
                
                <BookingSummary
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  duration={selectedDuration}
                />

                <Button 
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className="w-full"
                  size="lg"
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
