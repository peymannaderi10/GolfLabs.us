import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API } from '@/constants';

export interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  timezone: string;
  status: string;
  settings?: any;
}

interface LocationContextType {
  currentLocation: Location | null;
  allLocations: Location[];
  isLoading: boolean;
  error: string | null;
  setCurrentLocation: (location: Location) => void;
  formatDateInLocationTimezone: (date: Date | string, format?: Intl.DateTimeFormatOptions) => string;
  getLocationTimezone: () => string;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCATION_STORAGE_KEY = 'golflabs_selected_location';

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocationState] = useState<Location | null>(null);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocationId = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (savedLocationId && allLocations.length > 0) {
      const savedLocation = allLocations.find(loc => loc.id === savedLocationId);
      if (savedLocation) {
        setCurrentLocationState(savedLocation);
      }
    }
  }, [allLocations]);

  // Fetch all locations on mount
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API.BASE_URL}/locations`);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const locations: Location[] = await response.json();
      setAllLocations(locations);

      // If no current location is set and we have locations
      if (!currentLocation && locations.length > 0) {
        // Check for saved location first
        const savedLocationId = localStorage.getItem(LOCATION_STORAGE_KEY);
        let locationToSet = locations[0]; // Default to first location

        if (savedLocationId) {
          const savedLocation = locations.find(loc => loc.id === savedLocationId);
          if (savedLocation) {
            locationToSet = savedLocation;
          }
        }

        setCurrentLocationState(locationToSet);
        localStorage.setItem(LOCATION_STORAGE_KEY, locationToSet.id);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const setCurrentLocation = (location: Location) => {
    setCurrentLocationState(location);
    localStorage.setItem(LOCATION_STORAGE_KEY, location.id);
  };

  const formatDateInLocationTimezone = (
    date: Date | string,
    format: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const timezone = currentLocation?.timezone || 'America/New_York';
    
    return dateObj.toLocaleString('en-US', {
      ...format,
      timeZone: timezone
    });
  };

  const getLocationTimezone = (): string => {
    return currentLocation?.timezone || 'America/New_York';
  };

  const refreshLocations = async () => {
    await fetchLocations();
  };

  const contextValue: LocationContextType = {
    currentLocation,
    allLocations,
    isLoading,
    error,
    setCurrentLocation,
    formatDateInLocationTimezone,
    getLocationTimezone,
    refreshLocations
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}; 