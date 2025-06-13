// Location IDs
export const LOCATION_IDS = {
  CHERRY_HILL: '6f4dfdfe-a5a3-46c5-bd09-70db1ce2d0aa',
} as const;

// Bay IDs mapped to their numbers
export const BAY_IDS = {
  1: '831f2e6e-d76d-4c9c-aee0-6b767b6b38ee', // Bay 1
  2: '0abd1bc9-0ee9-43c0-a2d2-61fe47f097d8', // Bay 2
  3: '72a5da5d-3667-4751-b9b8-ea37e5d7a170', // Bay 3
  4: '312cddf3-a8ea-4205-82ee-cc5b66e6278f', // Bay 4
  5: 'a30afe47-bfc6-4914-a6dc-762e9d91c458', // Bay 5
  6: '6ce16a3a-6418-43b9-98f7-eede14db7091', // Bay 6
  7: '5de081da-adb1-4c1a-b53f-a4a3caec1227', // Bay 7
  8: 'f67e401c-9069-4e1b-90a7-7793688b902d', // Bay 8
} as const;

// Reverse mapping of bay IDs to numbers
export const BAY_NUMBERS = Object.entries(BAY_IDS).reduce((acc, [number, id]) => {
  acc[id] = Number(number);
  return acc;
}, {} as Record<string, number>);

// Test user ID (for development)
export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

// Pricing configuration
export const PRICING = {
  DAY_RATE: 35, // $35/hr from 9am to 10pm
  NIGHT_RATE: 25, // $25/hr from 10pm to 9am
  DAY_START: 9, // 9am
  DAY_END: 22, // 10pm
} as const;

// Booking configuration
export const BOOKING = {
  TIME_INTERVAL_MINUTES: 15,
  MAX_BAYS: 8,
  MIN_SLOTS_DURATION: 1, // 1 * 15 minutes = 15 minutes
  MAX_SLOTS_DURATION: (24 * 60) / 15, // 24 hours = 96 slots
} as const;

// API configuration
export const API = {
  BASE_URL: import.meta.env.VITE_API_URL,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
} as const; 