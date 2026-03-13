# Weekly Workflow - Product Management App

## Overview

Weekly Workflow is a sophisticated task management application designed for product managers to plan their week and execute daily. The application features a modern glassmorphic UI inspired by Linear and Notion, with Apple's design language influence. It provides three views: Table (grid), Board (kanban), and List, with drag-and-drop support. Tasks are organized by workstreams (customizable categories) and days of the week, with a backlog bucket for unscheduled tasks. The app supports multi-user access with email-based passwordless authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing.

**State Management**: TanStack Query (React Query) for server state management. WorkflowContext wraps API calls with mutations that invalidate query cache on changes.

**Authentication Flow**:
- LoginPage component handles email + 6-digit OTP code entry
- App.tsx gates access behind auth check (`/api/auth/me`)
- `getQueryFn({ on401: "returnNull" })` used for auth check to avoid throwing on 401
- Logout clears all query cache and re-renders

**UI Component System**: 
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library ("new-york" style variant)
- Custom components built on top of shadcn/ui base components
- Component structure organized with business logic components in `/components` and reusable UI primitives in `/components/ui`

**Styling Approach**:
- Tailwind CSS with custom design tokens
- Dark theme as default (glassmorphic design)
- CSS variables for theming with HSL color values
- Custom spacing scale and typography system
- Utility classes for glassmorphic effects (backdrop blur, gradients, shadows)

**Design System**:
- Follows a reference-based approach inspired by Linear, Notion, and Apple's design language
- Glassmorphic cards with subtle borders, gradients, and backdrop blur
- System font stack for optimal rendering
- Strict spacing primitives (multiples of 2, 3, 4, 6, 8, 10, 12, 16, 18)
- Workstream-based color coding (user-customizable colors)

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Pattern**: RESTful API design with routes prefixed with `/api`.

**Authentication**:
- Email-based passwordless OTP (6-digit codes, 10-minute expiry)
- Verification codes logged to server console (no email service yet)
- express-session with connect-pg-simple for PostgreSQL-backed sessions
- Session cookies: 30-day expiry, httpOnly, sameSite: lax
- `requireAuth` middleware on all data routes

**Development Setup**:
- Vite middleware integration for HMR in development
- Static file serving in production from built client assets
- Request logging middleware for API monitoring

**Storage Interface**: 
- Abstract storage interface (`IStorage`) in `server/storage.ts`
- `DatabaseStorage` class implements all CRUD operations against PostgreSQL via Drizzle ORM
- All data queries scoped by userId for multi-user isolation

**Build Process**:
- Client built with Vite
- Server bundled with esbuild
- Separate build outputs: client to `dist/public`, server to `dist/index.cjs`

### Data Layer

**ORM**: Drizzle ORM configured for PostgreSQL via `pg` (node-postgres) driver.

**Database Connection**: `server/db.ts` creates a pg.Pool and passes it to Drizzle.

**Schema Design** (`shared/schema.ts`):
- `users`: id (UUID), email (unique), createdAt
- `verification_codes`: id (UUID), email, code, expiresAt, used
- `workstreams`: id (UUID), userId (FK), name, color, order, isActive
- `labels`: id (UUID), userId (FK), workstreamId (FK with cascade delete), name, color
- `tasks`: id (UUID), userId (FK), title, workstreamId (FK with cascade delete), dayIndex (-1=backlog, 0-6=Mon-Sun), weekOf (nullable text, ISO Monday date e.g. "2026-03-09"), completed, labelIds (text[]), priority, description, externalLink, timeEstimate
- `ai_suggestions`: id (UUID), userId (FK), title, description, suggestedWorkstreamId (FK set null on delete), suggestedDayIndex, priority, source (gmail/slack/jira/general), sourcePreview, status (pending/accepted/declined), createdAt
- All IDs are varchar with gen_random_uuid() defaults
- Insert schemas generated via drizzle-zod with auto-generated fields omitted

**Session Storage**: PostgreSQL via connect-pg-simple (auto-creates `session` table)

**Migration Strategy**: Drizzle Kit with push-based workflow (`npm run db:push`).

**Default Data Seeding**: On first login, each user gets 5 default workstreams and 8 default labels seeded automatically.

### API Routes

**Auth Routes**:
- `POST /api/auth/send-code` - Send OTP to email (logged to console)
- `POST /api/auth/verify-code` - Verify OTP, create user if new, start session
- `GET /api/auth/me` - Get current user (401 if not authenticated)
- `POST /api/auth/logout` - Destroy session

**Data Routes** (all require auth):
- `GET/POST /api/workstreams` - List/create workstreams
- `PATCH/DELETE /api/workstreams/:id` - Update/delete workstream
- `PUT /api/workstreams/reorder` - Reorder workstreams by ID array
- `GET/POST /api/labels` - List/create labels
- `PATCH/DELETE /api/labels/:id` - Update/delete label
- `GET/POST /api/tasks` - List/create tasks
- `PATCH/DELETE /api/tasks/:id` - Update/delete task

**AI & Integration Routes** (all require auth):
- `GET /api/integrations/status` - Get connection status for Gmail, Slack, Jira
- `POST /api/integrations/:service/connect` - Placeholder for OAuth connection
- `GET /api/ai/suggestions` - Get pending AI suggestions
- `POST /api/ai/suggest` - Generate new AI task suggestions via Claude
- `PATCH /api/ai/suggestions/:id/accept` - Accept suggestion (creates task)
- `PATCH /api/ai/suggestions/:id/decline` - Decline suggestion

### Application Features

**Task Management**:
- Create tasks with title, workstream, day assignment, labels, priority, description, external links, time estimates
- Mark tasks as complete/incomplete
- Delete tasks
- Drag-and-drop between days and workstreams (via @dnd-kit)
- Backlog bucket (dayIndex=-1) for unscheduled tasks
- Week navigation: prev/next/today buttons in the header; tasks are anchored to a specific calendar week via `weekOf` field

**Week Navigation**:
- Tasks are anchored to a specific week via the `weekOf` field (ISO date string of Monday, e.g. "2026-03-09")
- Backlog tasks (dayIndex=-1) have weekOf=null and always appear regardless of week
- Navigating weeks issues a fresh API query filtered to that week
- Column day headers show actual calendar dates for the selected week

**Views**:
- Table view: Weekly grid with workstream rows and day columns
- Board view: 7-column kanban board (one per day) with drag-and-drop
- List view: Grouped by day with task details

**Workstream Configuration**:
- Add/edit/delete workstreams with custom names and colors
- Toggle workstream active/inactive
- Reorder workstreams via drag-and-drop
- Per-workstream labels with custom names and colors

## External Dependencies

### Core Framework Dependencies
- **React 18** + **React DOM**: UI framework
- **Vite**: Build tool and dev server
- **Express.js**: Backend server framework
- **TypeScript**: Type safety across the stack

### UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible component primitives
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library
- **@dnd-kit**: Drag-and-drop toolkit (core, sortable, utilities)

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx** + **tailwind-merge**: Conditional class name utilities

### Data Management
- **TanStack Query (React Query)**: Server state management and data fetching
- **Drizzle ORM**: TypeScript ORM for database operations
- **pg (node-postgres)**: PostgreSQL client driver
- **Zod**: Schema validation and type inference
- **drizzle-zod**: Bridge between Drizzle schemas and Zod validation

### Authentication & Sessions
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Routing & Navigation
- **Wouter**: Lightweight client-side routing

### AI
- **@anthropic-ai/sdk**: Claude AI for generating task suggestions (via Replit AI Integrations)

### Date Handling
- **date-fns**: Modern date utility library for formatting, comparison, and manipulation
