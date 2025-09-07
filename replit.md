# Marquelytix - Real-time Customer Sentiment Monitoring SaaS

## Overview

Marquelytix is a full-stack SaaS web application designed for real-time customer sentiment monitoring targeted at micro and small businesses. The platform provides a Brand24-style experience with comprehensive sentiment analysis capabilities across multiple social media platforms and review sources. The application flows from a public landing page through authentication to an authenticated dashboard experience with extensive analytics and reporting features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing with protected route patterns
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **UI Framework**: Tailwind CSS with shadcn/ui component library providing consistent design system
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Charts**: Custom Chart.js implementations for data visualization with responsive design
- **Authentication**: Session-based authentication with automatic redirects and route protection

### Backend Architecture
- **Runtime**: Node.js with Express.js providing RESTful API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **Authentication**: Passport.js with local strategy and express-session for session management
- **Validation**: Zod schemas for runtime type validation and data sanitization
- **Storage**: In-memory storage with JSON file persistence for development, designed to easily migrate to PostgreSQL
- **Session Store**: Memory-based session storage with support for PostgreSQL session store

### Data Storage Architecture
- **Current**: File-based JSON storage with in-memory caching for rapid development
- **Planned**: PostgreSQL with Drizzle ORM for production deployment
- **Schema Design**: Well-defined TypeScript interfaces shared between client and server
- **Data Models**: Users, Comments, Authors, Snapshots, and Configuration entities with proper relationships

### API Design
- **Sentiment Analysis**: Integration with Hugging Face API for ML-powered sentiment analysis with fallback demo mode
- **RESTful Endpoints**: Structured API with proper HTTP status codes and error handling
- **Filtering System**: Advanced filtering capabilities for comments by source, sentiment, date ranges, and influence scores
- **Real-time Updates**: Query invalidation patterns for real-time data synchronization

### External Dependencies

- **Hugging Face API**: Primary sentiment analysis service using the "siebert/sentiment-roberta-large-english" model for production-grade sentiment classification
- **Neon Database**: PostgreSQL database service configured via Drizzle for production data persistence
- **Font APIs**: Google Fonts integration for typography (Inter, DM Sans, Fira Code, Geist Mono)
- **Chart.js**: Dynamic import pattern for client-side data visualization without SSR issues
- **Replit Integration**: Development-specific plugins for runtime error overlay and cartographer for enhanced development experience