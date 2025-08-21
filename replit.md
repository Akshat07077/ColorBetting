# ColorPredict - Real-Time Betting Game

## Overview

ColorPredict is a real-time betting game application where players can place bets on color predictions during timed rounds. The system features live game rounds with countdown timers, color-based betting mechanics, and real-time balance updates. Players can bet on five different colors (red, green, blue, purple, orange) with a 2x payout multiplier for winning bets.

**Key Features:**
- 30-second game rounds with intelligent betting phases
- Betting closes at 25 seconds with 5-second transaction finalization period
- PostgreSQL database persistence for all game data
- Real-time UI updates with smart status indicators

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with custom gaming theme (electric blue, gold accent colors)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: Polling-based approach with different intervals for game state (1s), user data (5s), and bets (2s)

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful endpoints with structured JSON responses
- **Game Logic**: Automated game loop using setInterval for 30-second betting rounds
- **Storage Strategy**: In-memory storage for development (MemStorage class implementing IStorage interface)
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)

### Data Storage Solutions
- **Production Storage**: PostgreSQL database with Drizzle ORM for all persistent data
- **Database Schema**: Complete schema for users, game rounds, and bets with proper relationships
- **Migration System**: Drizzle Kit for database migrations and schema management  
- **Connection**: Neon Database serverless PostgreSQL with automated initialization
- **Data Integrity**: All game rounds, user bets, and balance changes persisted to database

### Game Mechanics
- **Round System**: 30-second total rounds with smart phases:
  - 0-25 seconds: Active betting period
  - 25-28 seconds: "Wrapping Up" - betting closed, transactions finalizing
  - 28-30 seconds: "Processing" - results calculation and new round preparation
- **Betting Logic**: Players can bet on 5 colors with 2x multiplier for wins
- **Balance Management**: Real-time balance updates with win/loss calculations
- **Statistics Tracking**: Player stats including games played, win rate, total winnings, and favorite colors

### Authentication and Authorization
- **User System**: Simple username-based identification without passwords (demo/development setup)
- **Session Management**: Express sessions for maintaining user state
- **Default User**: Automatic creation of demo user "Player123" with ₹1000 starting balance

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm & drizzle-zod**: Type-safe database ORM with Zod schema validation
- **express**: Node.js web framework for API server
- **@tanstack/react-query**: Server state management and caching

### UI and Styling
- **@radix-ui/react-***: Comprehensive accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Dynamic class name generation for component variants
- **clsx & tailwind-merge**: Conditional class name utilities

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development plugins for error handling and debugging

### Session and Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **nanoid**: Unique ID generation for various entities

### Additional Utilities
- **date-fns**: Date manipulation and formatting
- **wouter**: Lightweight routing library
- **cmdk**: Command palette component for enhanced UX