# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pret Pour TCF** - A Next.js 15 frontend application for TCF (Test de Connaissance du Français) exam preparation. Features authentication, practice management, streak tracking, subscription management, and analytics dashboards for both students and administrators.

## Development Commands

### Essential Commands
```bash
# Development
npm run dev              # Start development server (http://localhost:3000)

# Building
npm run build           # Production build
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without modifying files
```

### Testing Individual Features
Since this is a Next.js app, test individual routes by navigating to:
- `/login` - Authentication testing
- `/dashboard` - Admin dashboard (requires admin/super_admin role)
- `/compte` - Client account area (requires client role)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context + TanStack React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios with custom interceptors
- **Real-time**: Socket.io client
- **Charts**: Recharts
- **Analytics**: Google Analytics (production only)

### Directory Structure

```
src/
├── app/                 # Next.js App Router (pages & layouts)
│   ├── (auth)/         # Authentication routes (login, signup, etc.)
│   ├── (protected)/    # Admin dashboard routes
│   ├── (public)/       # Public landing page
│   └── compte/         # Client account routes
├── components/
│   ├── ui/             # Base shadcn/Radix components
│   └── organisms/      # Complex domain components (admin-sidebar, dashboard, practices, streaks, etc.)
├── contexts/           # React Context providers
│   ├── auth-context.tsx         # User authentication state
│   └── permission-context.tsx   # Role-based access control
├── hooks/              # Custom React hooks with React Query
├── services/           # API service layer (Axios-based)
├── screens/            # Page-level smart components
├── lib/                # Utilities
│   ├── api-client.ts   # Axios instance with auth interceptors
│   ├── socket.ts       # Socket.io connection
│   └── utils.ts        # General utilities
├── config/             # Configuration
│   ├── index.ts        # Environment variables & API config
│   └── permissions.ts  # RBAC permission definitions
├── types/              # TypeScript definitions
└── middleware.tsx      # Route protection & auth checks
```

### State Management Pattern

1. **Authentication & Permissions**: React Context (`auth-context.tsx`, `permission-context.tsx`)
2. **Server State**: React Query with 1-minute stale time, 10-minute cache time
3. **Persistence**: localStorage for tokens and user data

### API Integration Pattern

All API calls go through the service layer (`src/services/`):

```typescript
// Pattern used across all services
export const exampleService = {
  getAll: async () => apiClient.get<BackendApiResponse<T[]>>('/endpoint'),
  getById: async (id: string) => apiClient.get<BackendApiResponse<T>>(`/endpoint/${id}`),
  create: async (data: CreateData) => apiClient.post<BackendApiResponse<T>>('/endpoint', data),
  update: async (id: string, data: UpdateData) => apiClient.patch<BackendApiResponse<T>>(`/endpoint/${id}`, data),
  delete: async (id: string) => apiClient.delete(`/endpoint/${id}`),
}
```

**API Client** (`src/lib/api-client.ts`):
- Automatically attaches Bearer token to all requests
- Handles 401 errors with automatic token refresh
- Retries failed requests after token refresh
- Base URL: `NEXT_PUBLIC_API_URL` (default: http://localhost:8000/api)

### Authentication Flow

1. **Login/Signup** → Tokens stored in localStorage + cookie
2. **Middleware** (`middleware.tsx`) → Verifies cookie on protected routes
3. **API Client** → Attaches Bearer token to requests, auto-refreshes on 401
4. **Auth Context** → Manages user state, initializes socket connection
5. **Permission Context** → Provides `hasPermission()` helpers based on user role

**User Roles**: `super_admin`, `admin`, `client`

**Role-Based Redirects**:
- `client` → `/compte`
- `admin` or `super_admin` → `/dashboard`

### Route Protection

Protected routes:
- `/dashboard/*` - Admin/super_admin only
- `/compte/*` - Authenticated users only

Public routes:
- `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`

## Important Patterns & Conventions

### Component Organization
- **UI Components** (`components/ui/`): Basic Radix/shadcn primitives
- **Organisms** (`components/organisms/`): Complex, domain-specific components
- **Screens** (`screens/`): Page-level components with data fetching

### Naming Conventions
- **Components**: PascalCase (e.g., `DashboardOverview`)
- **Functions/Hooks**: camelCase (e.g., `useDashboardStats`)
- **Files**: kebab-case for utilities (e.g., `api-client.ts`), PascalCase for components
- **Path Alias**: `@/*` maps to `src/*`

### Data Fetching with React Query
Custom hooks wrap React Query for each domain:

```typescript
// Example: src/hooks/useDashboard.ts
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    retry: 2,
  })
}
```

### Permission-Based Rendering
Use `usePermissions()` from `permission-context.tsx`:

```typescript
const { hasPermission } = usePermissions()

if (hasPermission('manage_users')) {
  // Render admin-only UI
}
```

### Error Handling
- Toast notifications via Sonner for user feedback
- Try-catch blocks in async operations
- Graceful fallbacks with loading states

### Form Validation
All forms use React Hook Form + Zod:

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
})
```

## Key Features

### 1. Admin Dashboard (`/dashboard`)
- Overview statistics (practices, users, subscriptions, streaks)
- User management with CRUD operations
- Practice management (create, edit, delete with media support)
- Streak tracking and management
- Subscription & plan management
- Transaction history
- Permission-based menu filtering (`admin-sidebar.tsx`)

### 2. Practice System
- Multiple practice types: listening (CO), reading (CE), writing (EO), speaking (EE)
- CEFR levels: A1, A2, B1, B2, C1, C2
- Question management with media (images, audio, video)
- Practice session tracking
- Analytics and scoring

### 3. Streak Feature
- Gamification with reward system (badges, certificates, points, features)
- Premium-only feature with eligibility checking
- Burn deadline tracking (12-hour window)
- Streak history and statistics
- Real-time countdown timers
- See `STREAK_FRONTEND.md` for complete documentation

### 4. Subscription System
- Plan types: trial, premium
- Feature toggles: CO, CE, EO, EE, correction, streak, history
- Active subscription tracking
- Days remaining calculations

### 5. Client Account Area (`/compte`)
- Practice series management (`/compte/series`)
- History and analytics (`/compte/historique`)
- Account settings and profile management

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
CLOUDFLARE_R2_PUBLIC_URL=<CDN_URL>
```

## Common Development Workflows

### Adding a New Protected Route
1. Create page in `src/app/(protected)/` or `src/app/compte/`
2. Middleware automatically protects it
3. Add menu item to `admin-sidebar.tsx` with permission check
4. Define permission in `src/config/permissions.ts` if needed

### Adding a New API Service
1. Create service file in `src/services/` (e.g., `feature.ts`)
2. Define TypeScript types in `src/types/index.ts`
3. Create custom hook in `src/hooks/` using React Query
4. Use hook in screen component

### Creating a New Component
1. UI primitives → `src/components/ui/`
2. Domain components → `src/components/organisms/[feature]/`
3. Page-level components → `src/screens/[feature]/`
4. Use existing shadcn components when possible

### Adding a New Permission
1. Define permission in `src/config/permissions.ts` under `ROLE_PERMISSIONS`
2. Use `hasPermission('permission_name')` in components
3. Filter menu items in `admin-sidebar.tsx`

## Localization

The application is primarily in French:
- "Séries" (Streaks)
- "Compte" (Account)
- "Tableau de bord" (Dashboard)
- "Exercices" (Exercises)

Keep this in mind when adding new features or UI text.

## Build Configuration

**Important**: The Next.js config currently has:
- `eslint.ignoreDuringBuilds: true`
- `typescript.ignoreBuildErrors: true`

This means builds will succeed even with linting/type errors. Always run `npm run lint` and check TypeScript errors manually during development.

## Real-time Features

Socket.io connection (`src/lib/socket.ts`) is initialized on user login. Used for:
- Live notifications
- Real-time updates (implement listeners in relevant components)

## Performance Considerations

- React Query caching with stale-while-revalidate strategy
- Next.js Image optimization (Cloudflare R2 CDN configured)
- Skeleton loading states for async data
- Mobile-responsive design with Tailwind breakpoints
- Background refetching for dashboard stats (5-minute intervals)

## Type Safety

- Strict TypeScript mode enabled
- All API responses typed with `BackendApiResponse<T>`
- Zod schemas for runtime validation
- Generic type parameters in service methods

## Code Style

- Prettier configured for consistent formatting
- ESLint for code quality
- Use `npm run format` before committing
- Follow existing patterns for consistency
