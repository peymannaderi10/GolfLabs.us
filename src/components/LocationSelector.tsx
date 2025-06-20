import React from 'react';
import { useLocation } from '@/contexts/LocationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationSelectorProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  className,
  variant = 'ghost'
}) => {
  const { 
    currentLocation, 
    allLocations, 
    isLoading, 
    error, 
    setCurrentLocation 
  } = useLocation();

  if (isLoading) {
    return (
      <Button variant={variant} disabled className={cn("gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (error || !currentLocation) {
    return (
      <Button variant={variant} disabled className={cn("gap-2", className)}>
        <MapPin className="h-4 w-4" />
        Location Error
      </Button>
    );
  }

  // If there's only one location, just display it without dropdown
  if (allLocations.length <= 1) {
    return (
      <Button variant={variant} disabled className={cn("gap-2", className)}>
        <MapPin className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLocation.name}</span>
        <span className="sm:hidden">{currentLocation.city}</span>
      </Button>
    );
  }

  // Multiple locations - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={cn("gap-2", className)}>
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLocation.name}</span>
          <span className="sm:hidden">{currentLocation.city}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {allLocations.map((location) => (
          <DropdownMenuItem
            key={location.id}
            onClick={() => setCurrentLocation(location)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              currentLocation.id === location.id && "bg-accent"
            )}
          >
            <MapPin className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">{location.name}</span>
              <span className="text-xs text-muted-foreground">
                {location.city}, {location.state}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 