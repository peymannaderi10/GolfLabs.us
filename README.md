# GolfLabs - Public Website

## Business Overview

GolfLabs is a 24/7 self-service golf simulator facility located in Cherryhill, New Jersey, serving the greater Philadelphia area. Our business model addresses a significant gap in the local market by providing:

- **24/7 Access**: Book and play anytime, day or night
- **Affordable Pricing**: $35/hour with no membership requirements
- **Self-Service Technology**: Fully automated booking, access, and bay management
- **Premium Equipment**: 8 bays equipped with Uneekor QED launch monitors and GS Pro software

Unlike traditional golf simulator facilities that require memberships ($200+ monthly) or charge premium rates ($75+ per hour), our automated system eliminates staffing costs, allowing us to offer competitive pricing while maintaining profitability.

## Technology Stack

This repository contains the public-facing marketing website built with modern web technologies:

### Core Framework
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server

### UI & Styling
- **shadcn/ui** - High-quality component library built on Radix UI primitives
- **Radix UI** - Unstyled, accessible component primitives
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library for animations

### State Management & Data
- **TanStack Query** - Powerful data synchronization for React
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

### Navigation & UX
- **React Router DOM** - Declarative routing for React
- **next-themes** - Theme switching functionality
- **Sonner** - Toast notifications
- **Lucide React** - Beautiful & consistent icon set

## Repository Purpose

This repository specifically contains:
- Marketing website with business information
- Pricing and facility details
- Contact and location information
- Responsive design optimized for mobile and desktop

**Note**: This is separate from our booking system and facility management software, which are maintained in private repositories for security reasons.

## System Architecture Overview

The complete GolfLabs system consists of three main components:

1. **Public Website** (this repo) - Marketing and information
2. **Booking System** (private) - Real-time reservations and payments
3. **Facility Management** (private) - Access control, bay management, and monitoring

All systems work together to provide a seamless, fully automated customer experience from initial discovery through facility access and golf simulation.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Status

- ✅ Public website design and development
- 🚧 Booking system integration (in development)
- 📋 Facility management system (planned)
- 📋 Physical facility construction (planned)

---

*GolfLabs - Redefining accessible golf simulation in the Philadelphia area*