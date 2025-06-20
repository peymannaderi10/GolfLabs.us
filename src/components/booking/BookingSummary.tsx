import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, ShoppingCart, Trash2, Info, DollarSign } from 'lucide-react';
import type { SelectionState } from '@/pages/Booking'; // Import SelectionState
import { timeToIndex, TIME_INTERVAL_MINUTES, generateTimeSlots } from '@/pages/Booking'; // Import generateTimeSlots
import { BAY_NUMBERS } from '@/constants';
import { useLocation } from '@/contexts/LocationContext';

export interface BookingSummaryProps {
  selectedDate: Date | null;
  selection: SelectionState;
  onConfirmBooking: () => void;
  onClearSelection: () => void;
  priceDetails: { total: number; breakdown: any[] } | null;
  isCalculatingPrice: boolean;
  className?: string;
}
 
export const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedDate,
  selection,
  onConfirmBooking,
  onClearSelection,
  priceDetails,
  isCalculatingPrice,
  className,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const { currentLocation } = useLocation();

  const { bayId, startTime, endTime } = selection;

  // Use the same time slot generation as the main booking page
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const calculatedDurationMinutes = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const startIndex = timeToIndex(startTime, timeSlots);
    const endIndex = timeToIndex(endTime, timeSlots);
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return 0;
    return (endIndex - startIndex) * TIME_INTERVAL_MINUTES;
  }, [startTime, endTime, timeSlots]);

  const isSelectionValid = useMemo(() => {
    return !!(selectedDate && bayId && startTime && endTime && calculatedDurationMinutes > 0 && priceDetails && !isCalculatingPrice);
  }, [selectedDate, bayId, startTime, endTime, calculatedDurationMinutes, priceDetails, isCalculatingPrice]);

  const formatDuration = (minutes: number): string => {
    if (minutes <= 0) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    let str = "";
    if (h > 0) str += `${h}h`;
    if (m > 0) str += `${h > 0 ? ' ' : ''}${m}m`;
    return str;
  };

  const getBayNumber = (bayId: string | null): string => {
    if (!bayId || !BAY_NUMBERS || typeof BAY_NUMBERS !== 'object') {
      return 'N/A';
    }
    return BAY_NUMBERS[bayId]?.toString() ?? 'N/A';
  };

  const minimizedTitle = useMemo(() => {
    if (isSelectionValid) {
      const bayNumber = getBayNumber(bayId);
      const duration = formatDuration(calculatedDurationMinutes);
      const price = priceDetails ? `$${(priceDetails.total / 100).toFixed(2)}` : '';
      return `Bay ${bayNumber} - ${duration} - ${price}`;
    }
    return "Booking Details";
  }, [isSelectionValid, bayId, calculatedDurationMinutes, priceDetails]);

  if (!selectedDate && !bayId && !startTime && !endTime) {
    // If nothing is selected at all, perhaps don't render the floating component yet,
    // or render it minimized by default with a generic message.
    // For now, let's render it but it will appear mostly empty if minimized.
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
        isMinimized ? "w-auto" : "w-full max-w-sm md:max-w-md",
        className
      )}
    >
      <Card className={cn("shadow-2xl rounded-lg overflow-hidden bg-card/95 backdrop-blur-sm border-border", isMinimized ? "p-0" : "")}>
        <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
          <div className="flex items-center">
            {/* Simplified icon rendering to prevent reconciliation issues */}
            {isMinimized && (
              isSelectionValid ? (
                <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              ) : (
                <Info className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
              )
            )}
            <span className="font-semibold text-sm text-foreground">
              {isMinimized ? minimizedTitle : "Booking Summary"}
            </span>
          </div>
          <button 
            type="button"
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {!isMinimized && (
          <>
            <CardContent className="p-4 space-y-3 text-sm">
              {selectedDate ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" /> 
                    <span>Date:</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {selectedDate.toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" /> 
                  <span>Select a date.</span>
                </div>
              )}

              {bayId ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" /> 
                    <span>Bay:</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {`Bay ${getBayNumber(bayId)}`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" /> 
                  <span>Select a bay.</span>
                </div>
              )}

              {startTime ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" /> 
                    <span>Start Time:</span>
                  </div>
                  <span className="font-medium text-foreground">{startTime}</span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" /> 
                  <span>Select start time.</span>
                </div>
              )}

              {endTime ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" /> 
                    <span>End Time:</span>
                  </div>
                  <span className="font-medium text-foreground">{endTime}</span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" /> 
                  <span>Select end time.</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                <div className="flex items-center text-muted-foreground font-semibold">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" /> 
                  <span>Duration:</span>
                </div>
                <span className="font-bold text-primary text-base">
                  {formatDuration(calculatedDurationMinutes)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center text-muted-foreground font-semibold">
                  <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" /> 
                  <span>Total Price:</span>
                </div>
                {isCalculatingPrice ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                ) : (
                    <span className="font-bold text-primary text-base">
                    {priceDetails ? `$${(priceDetails.total / 100).toFixed(2)}` : '$0.00'}
                    </span>
                )}
              </div>

              {priceDetails && priceDetails.breakdown && priceDetails.breakdown.length > 0 && currentLocation && (
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="text-sm font-semibold text-muted-foreground">Price Breakdown:</div>
                  {priceDetails.breakdown.map((segment, index) => {
                    // Convert UTC times to location timezone for display
                    const startDate = new Date(segment.start);
                    const endDate = new Date(segment.end);
                    
                    // Format times in 12-hour format using location timezone
                    const startTime = startDate.toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                      timeZone: currentLocation.timezone
                    });
                    const endTime = endDate.toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                      timeZone: currentLocation.timezone
                    });

                    return (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <span className="text-muted-foreground">{segment.rateName}:</span>
                          <span className="ml-2 text-foreground">{startTime} - {endTime}</span>
                        </div>
                        <span className="font-medium">${(segment.rate / 100).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>

            <div className="border-t border-border p-3 bg-muted/10">
              <div className="flex gap-2">
                <Button 
                  onClick={onClearSelection} 
                  variant="outline" 
                  className="w-full text-sm flex-1 group hover:border-destructive hover:bg-destructive/5"
                  disabled={!bayId && !startTime && !endTime}
                >
                  <Trash2 className="h-4 w-4 mr-1.5 text-muted-foreground group-hover:text-destructive transition-colors" />
                  <span>Clear</span>
                </Button>
                <Button 
                  onClick={onConfirmBooking} 
                  disabled={!isSelectionValid}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm flex-1 group"
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5 group-hover:animate-pulse" />
                  <span>Checkout</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};