# SEO Toolbox

## Overview

SEO Toolbox is a comprehensive web application that provides essential SEO tools for content creators and digital marketers. The application offers six main tools: Meta Description Generator (AI-powered), Title Case Converter, Keyword Density Analyzer, Blog Outline Generator (AI-powered), Blog Post Writer (SEO-optimized), and Article Writer (Professional). Built as a modern full-stack application with React frontend and Express backend, it features a clean, responsive design using shadcn/ui components and provides both instant processing tools and AI-enhanced content generation capabilities with comprehensive SEO scoring and optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side uses a modern React architecture with TypeScript, built around a component-based design system. The application leverages shadcn/ui for consistent UI components and implements client-side routing with wouter. State management is handled through React Query for server state and React Hook Form for form validation with Zod schemas. The design system is built on Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes.

### Backend Architecture
The server follows a RESTful API design using Express.js with TypeScript. The architecture separates concerns through dedicated route handlers, with API endpoints for each tool (`/api/meta-description`, `/api/title-case`, `/api/keyword-density`, `/api/blog-outline`, `/api/blog-post`, `/api/article`). Business logic is abstracted into service functions, and the application includes comprehensive error handling middleware with structured logging. The writing tools feature advanced SEO scoring algorithms, automatic keyword integration, and template-based content generation that works without external API dependencies.

### Data Storage Solutions
The application uses a dual-storage approach: a PostgreSQL database with Drizzle ORM for production data persistence, and an in-memory storage implementation for development/testing. Database migrations are managed through Drizzle Kit, with schema definitions centralized in the shared directory for type safety across frontend and backend.

### Authentication and Authorization
Currently implements a basic user system with in-memory storage for development. The architecture supports user creation and retrieval by ID or username, with the storage interface designed to easily swap between memory and database implementations.

### Form Validation and Type Safety
Implements comprehensive type safety using Zod schemas shared between frontend and backend. All API requests and responses are validated against these schemas, ensuring data consistency. React Hook Form integrates with Zod resolvers for client-side validation with real-time feedback.

### Content Generation and SEO Optimization
The application uses a dual approach for content generation: AI-powered features through Hugging Face's Inference API and intelligent template-based generation that works without external dependencies. For AI features, the system uses the `google/flan-t5-small` model for generating meta descriptions and blog outlines, with configurable parameters for temperature and token limits. The Blog Post Writer and Article Writer tools feature comprehensive SEO scoring algorithms that analyze content length, keyword density, header structure, paragraph organization, and readability metrics. All tools include graceful fallbacks and user-friendly error messages, ensuring consistent functionality regardless of external API availability.

### Build and Development System
Uses Vite for frontend development with hot module replacement and React support. The build process handles both client and server bundling, with esbuild for server-side compilation. Development includes specialized Replit integrations for enhanced debugging and error reporting.

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with TypeScript support
- **Express.js**: Backend web framework
- **Vite**: Build tool and development server
- **Node.js**: Runtime environment

### Database and ORM
- **PostgreSQL**: Primary database (via Neon serverless)
- **Drizzle ORM**: Type-safe database toolkit
- **Drizzle Kit**: Database migration tool

### UI and Styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library

### Form Handling and Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation library
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### State Management and Data Fetching
- **TanStack Query (React Query)**: Server state management
- **wouter**: Lightweight client-side router

### AI and External Services
- **Hugging Face Inference API**: AI model integration for content generation
- **Google Flan-T5-Small**: Language model for text generation

### Development and Build Tools
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast JavaScript bundler
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### Replit-Specific Integrations
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-runtime-error-modal**: Error reporting