# Project Structure

This document provides a comprehensive overview of the project structure and organization.

## Directory Structure

```
web-frontend/
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore rules
├── .env.local                  # Environment variables (not in repo)
├── components.json             # shadcn/ui configuration
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── README.md                   # Project documentation
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
│
├── public/                     # Static assets
│   ├── favicon.ico
│   └── images/
│
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── login/              # Authentication
│   │   ├── admin/              # Admin routes
│   │   │   └── dashboard/      # Admin dashboard
│   │   ├── driver/             # Driver routes
│   │   │   └── dashboard/      # Driver dashboard
│   │   └── parent/             # Parent routes
│   │       └── dashboard/      # Parent dashboard
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # UI components
│   │   │   ├── button.tsx      # shadcn/ui button
│   │   │   ├── card.tsx        # shadcn/ui card
│   │   │   ├── input.tsx       # shadcn/ui input
│   │   │   ├── badge.tsx       # shadcn/ui badge
│   │   │   ├── progress.tsx    # shadcn/ui progress
│   │   │   ├── dialog.tsx      # shadcn/ui dialog
│   │   │   ├── dropdown-menu.tsx # shadcn/ui dropdown
│   │   │   ├── select.tsx      # shadcn/ui select
│   │   │   ├── separator.tsx   # shadcn/ui separator
│   │   │   ├── avatar.tsx      # shadcn/ui avatar
│   │   │   ├── alert.tsx       # shadcn/ui alert
│   │   │   ├── sheet.tsx       # shadcn/ui sheet
│   │   │   ├── sonner.tsx      # Toast notifications
│   │   │   │
│   │   │   # Custom Components
│   │   │   ├── action-card.tsx           # Action cards
│   │   │   ├── bus-status-card.tsx       # Bus status display
│   │   │   ├── bus-management-table.tsx  # Fleet management
│   │   │   ├── route-timeline.tsx        # Route progress
│   │   │   ├── student-card.tsx          # Student profiles
│   │   │   ├── stats-card.tsx            # Statistics display
│   │   │   ├── loading.tsx               # Loading states
│   │   │   ├── floating-action-button.tsx # FAB component
│   │   │   └── index.ts                  # Component exports
│   │   │
│   │   ├── Navigation.tsx      # Main navigation
│   │   ├── ProtectedRoute.tsx  # Route protection
│   │   ├── ThemeToggle.tsx     # Dark/Light theme
│   │   ├── LogoutButton.tsx    # Logout functionality
│   │   ├── Map.tsx             # Map component
│   │   └── DynamicMap.tsx      # Dynamic map loading
│   │
│   └── lib/                    # Utilities and configurations
│       ├── supabaseClient.ts   # Supabase client setup
│       ├── auth.ts             # Authentication utilities
│       └── utils.ts            # General utilities
│
└── supabase/                   # Supabase configuration
    ├── migrations/             # Database migrations
    ├── functions/              # Edge functions
    │   ├── send-notification/  # Notification service
    │   └── delete-user/        # User management
    └── config.toml             # Supabase config
```

## Component Categories

### 1. **Core shadcn/ui Components**
Standard UI components from the shadcn/ui library:
- Form elements (Button, Input, Select)
- Layout components (Card, Separator)
- Feedback components (Alert, Badge, Progress)
- Overlay components (Dialog, Sheet, Dropdown)

### 2. **Custom School Bus Components**
Purpose-built components for the school bus tracking system:
- `BusStatusCard` - Real-time bus monitoring
- `RouteTimeline` - Route progress visualization
- `StudentCard` - Student profile management
- `BusManagementTable` - Fleet management interface

### 3. **Utility Components**
General-purpose components for common functionality:
- `LoadingScreen` - Loading states
- `StatsCard` - Statistics display
- `ActionCard` - Action buttons with icons

### 4. **Layout Components**
Components that provide structure and navigation:
- `Navigation` - Main navigation bar
- `ProtectedRoute` - Authentication wrapper
- `ThemeToggle` - Dark/Light theme switcher

## Page Organization

### **App Router Structure**
Using Next.js 13+ App Router with nested layouts:

```
app/
├── layout.tsx              # Root layout (authentication, theme)
├── page.tsx                # Landing page
├── login/page.tsx          # Authentication page
├── admin/
│   ├── layout.tsx          # Admin-specific layout
│   └── dashboard/
│       ├── page.tsx        # Admin dashboard
│       ├── users/page.tsx  # User management
│       ├── buses/page.tsx  # Fleet management
│       └── routes/page.tsx # Route management
├── driver/
│   ├── layout.tsx          # Driver-specific layout
│   └── dashboard/page.tsx  # Driver dashboard
└── parent/
    ├── layout.tsx          # Parent-specific layout
    └── dashboard/page.tsx  # Parent dashboard
```

## State Management

### **Local State**
- React useState for component-level state
- useEffect for side effects and data fetching
- Custom hooks for shared logic

### **Global State**
- Supabase real-time subscriptions for live data
- Context API for theme and authentication state
- URL state for navigation and filters

## Styling Architecture

### **Tailwind CSS**
- Utility-first CSS framework
- Custom design tokens in `tailwind.config.ts`
- Responsive design classes
- Dark mode support

### **CSS Variables**
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 92%;
  --destructive: 0 62.8% 30.6%;
}
```

### **Component Styling**
- shadcn/ui variants system
- Custom CSS classes for animations
- Glass morphism effects
- Smooth transitions

## Data Flow

### **Authentication Flow**
1. User logs in via Supabase Auth
2. JWT token stored in browser
3. Protected routes check authentication
4. Role-based access control

### **Real-time Updates**
1. Supabase real-time subscriptions
2. WebSocket connections for live data
3. Optimistic updates for better UX
4. Error handling and retry logic

### **API Integration**
- Supabase client for database operations
- Row Level Security (RLS) policies
- Edge functions for complex operations
- Real-time subscriptions for live updates

## Development Workflow

### **Code Organization**
- Feature-based component organization
- Shared utilities in `/lib`
- Type definitions co-located with components
- Consistent naming conventions

### **Build Process**
1. TypeScript compilation
2. ESLint code quality checks
3. Tailwind CSS processing
4. Next.js optimization
5. Production build generation

This structure ensures maintainability, scalability, and developer experience while following Next.js and React best practices.