# Frontend Application Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [File Structure Analysis](#file-structure-analysis)
5. [Features Inventory](#features-inventory)
6. [Components Documentation](#components-documentation)
7. [Routing Structure](#routing-structure)
8. [State Management](#state-management)
9. [Styling and Theming](#styling-and-theming)
10. [Configuration and Settings](#configuration-and-settings)

---

## Project Overview

**StudyPro** is a comprehensive e-learning platform focused on public exam preparation (concursos públicos) in Brazil. The frontend is a modern React application built with TypeScript, featuring a responsive design with dark/light theme support, role-based access control, and a rich set of educational tools.

### Key Features Implemented
- **User Authentication & Authorization** with role-based access (Student/Admin)
- **Interactive Learning Tools** including flashcards with spaced repetition
- **Question Bank** with advanced filtering and analytics
- **Exam Simulations** with realistic conditions
- **Study Planning** with AI-powered scheduling
- **Performance Analytics** with detailed progress tracking
- **Payment Integration** (Stripe simulation)
- **Dark/Light Theme Support** with system preference detection
- **Responsive Design** optimized for all devices

---

## Technology Stack

### Core Technologies
- **React 19.1.0** - UI library with latest features
- **TypeScript 5.8.3** - Type safety and developer experience
- **Vite 4.5.3** - Fast build tool and development server
- **React Router DOM 6.22.0** - Client-side routing

### State Management & Data Fetching
- **Zustand 5.0.6** - Lightweight state management
- **TanStack React Query 5.83.0** - Server state management and caching
- **Axios 1.10.0** - HTTP client for API calls

### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 12.23.6** - Animation library
- **Lucide React 0.525.0** - Icon library
- **Class Variance Authority 0.7.1** - Component variant styling
- **Tailwind Merge 3.3.1** - Conditional Tailwind classes

### Additional Libraries
- **React Hot Toast 2.5.2** - Toast notifications
- **Date-fns 4.1.0** - Date manipulation
- **Recharts 3.1.0** - Chart components
- **Stripe (React & JS) 3.7.0 & 7.5.0** - Payment processing

### Development Tools
- **ESLint 9.30.1** - Code linting
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixes

---

## Architecture Overview

### Component Architecture
The application follows a modular component architecture with clear separation of concerns:

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── layout/         # Layout components (Sidebar, AdminLayout)
│   ├── payment/        # Payment-related components
│   └── ui/             # Basic UI components (Button, Card, etc.)
├── contexts/           # React contexts (Theme)
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── admin/          # Admin-specific pages
│   ├── auth/           # Authentication pages
│   ├── public/         # Public pages
│   └── student/        # Student-specific pages
├── services/           # API services
├── store/              # Global state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Design Patterns
- **Compound Components** - Card, CardHeader, CardContent structure
- **Render Props** - Custom hooks for state logic
- **Higher-Order Components** - ProtectedRoute wrapper
- **Context Pattern** - Theme management
- **Custom Hooks** - Reusable stateful logic

---

## File Structure Analysis

### `/src/components/`

#### Layout Components
- **`Layout.tsx`** - Main student layout with sidebar
- **`AdminLayout.tsx`** - Admin dashboard layout with navigation
- **`Sidebar.tsx`** - Collapsible sidebar with animated menu items

#### UI Components
- **`Button.tsx`** - Versatile button component with variants
- **`Card.tsx`** - Flexible card container with header/content
- **`Logo.tsx`** - Animated logo with icon/full variants
- **`ThemeToggle.tsx`** - Theme switcher component
- **`Badge.tsx`** - Status badges with color variants
- **`Skeleton.tsx`** - Loading skeletons for different content types

#### Payment Components
- **`StripeCheckout.tsx`** - Complete checkout form with validation

### `/src/pages/`

#### Public Pages
- **`HomePage.tsx`** - Landing page with marketing content
- **`CheckoutPage.tsx`** - Subscription plan selection and purchase

#### Authentication Pages
- **`LoginPage.tsx`** - User login interface
- **`RegisterPage.tsx`** - User registration form

#### Student Pages (14 pages)
- **`DashboardPage.tsx`** - Main dashboard with stats and quick actions
- **`CoursesPage.tsx`** - Course catalog and enrollment
- **`CourseDetailsPage.tsx`** - Individual course information
- **`MyCoursesPage.tsx`** - Enrolled courses management
- **`CourseLearningPage.tsx`** - Learning interface
- **`SimuladosPage.tsx`** - Exam simulations listing
- **`ExamTakingPage.tsx`** - Exam taking interface
- **`ExamResultsPage.tsx`** - Exam results and analytics
- **`FlashcardsPage.tsx`** - Flashcard study system
- **`QuestionsPage.tsx`** - Question bank with filters
- **`SummariesPage.tsx`** - Interactive study summaries
- **`LegislationPage.tsx`** - Legal document access
- **`TacticalPanelPage.tsx`** - Performance analytics
- **`SchedulePage.tsx`** - Study schedule management
- **`SubscriptionPage.tsx`** - Subscription management
- **`SettingsPage.tsx`** - User preferences

#### Admin Pages (10 pages)
- **`AdminDashboard.tsx`** - Admin overview with system stats
- **`ContentManager.tsx`** - Content management interface
- **`UserManager.tsx`** - User administration
- **`QuestionEditor.tsx`** - Question creation and editing
- **`CourseEditor.tsx`** - Course management
- **`SummaryEditor.tsx`** - Summary content editing
- **`LegislationManager.tsx`** - Legal content management
- **`ImportManager.tsx`** - Bulk content import
- **`CategoryManager.tsx`** - Category organization
- **`Analytics.tsx`** - System analytics and reports
- **`AdminSettings.tsx`** - System configuration

### `/src/services/`
- **`api.ts`** - Axios configuration with interceptors

### `/src/store/`
- **`authStore.ts`** - Authentication state with persistence

### `/src/contexts/`
- **`ThemeContext.tsx`** - Theme management with system detection

---

## Features Inventory

### Authentication & Authorization
- **User Registration/Login** - Complete auth flow
- **Role-based Access Control** - Student/Admin/Instructor roles
- **Protected Routes** - Route guards based on authentication
- **Persistent Sessions** - Zustand persistence for auth state

### Student Features

#### Learning Tools
- **Question Bank** - Advanced filtering, difficulty levels, exam simulation
- **Flashcards System** - Spaced repetition algorithm (SRS)
- **Interactive Summaries** - Content with embedded questions
- **Legislation Access** - Searchable legal documents

#### Study Management
- **Course Enrollment** - Progress tracking and completion
- **Study Schedule** - AI-powered scheduling
- **Performance Analytics** - Detailed progress reports
- **Tactical Panel** - Advanced analytics dashboard

#### Assessments
- **Exam Simulations** - Realistic exam conditions
- **Question Practice** - Subject-based practice sessions
- **Performance Tracking** - Accuracy and improvement metrics

### Admin Features

#### Content Management
- **Course Creation** - Rich course builder
- **Question Editor** - Advanced question authoring
- **Summary Editor** - Interactive content creation
- **Bulk Import** - CSV/Excel content import

#### User Management
- **User Administration** - User lifecycle management
- **Analytics Dashboard** - System-wide statistics
- **Content Moderation** - Approval workflows

#### System Administration
- **Category Management** - Content organization
- **Legislation Management** - Legal content updates
- **System Settings** - Platform configuration

### UI/UX Features
- **Dark/Light Theme** - System preference detection
- **Responsive Design** - Mobile-first approach
- **Animations** - Framer Motion throughout
- **Accessibility** - ARIA labels and keyboard navigation
- **Progressive Loading** - Skeleton screens and lazy loading

### Payment & Subscription
- **Stripe Integration** - Secure payment processing
- **Plan Management** - Multiple subscription tiers
- **Billing History** - Transaction records

---

## Components Documentation

### Core UI Components

#### Button Component
```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}
```

**Variants:**
- `default` - Primary blue button
- `secondary` - Light blue background
- `outline` - Border with transparent background
- `ghost` - Transparent with hover effect
- `danger` - Red for destructive actions
- `success` - Green for positive actions

#### Card Component
```typescript
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient';
  noPadding?: boolean;
}
```

**Variants:**
- `default` - Standard card with border and shadow
- `glass` - Glassmorphism effect with backdrop blur
- `gradient` - Subtle gradient background

#### Logo Component
```typescript
interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full';
  className?: string;
  animated?: boolean;
}
```

**Features:**
- SVG-based with unique IDs to prevent conflicts
- Theme-aware color adaptation
- Animated lightning bolt effect
- Responsive sizing

### Layout Components

#### Sidebar Component
**Features:**
- Collapsible with animation
- Tooltips for collapsed state
- Theme toggle integration
- User profile display
- Role-based menu items

#### AdminLayout Component
**Features:**
- Admin-specific navigation
- Breadcrumb system
- Mobile-responsive design
- User management controls

### Custom Hooks
**Location:** Currently implemented as inline logic, could be extracted to `/src/hooks/`

**Potential Hooks:**
- `useAuth()` - Authentication state management
- `useTheme()` - Theme management (already exists)
- `useLocalStorage()` - Local storage abstraction
- `useDebounce()` - Debounced values
- `useApi()` - API request management

---

## Routing Structure

### Public Routes
- `/` - Landing page (HomePage)
- `/login` - Authentication
- `/register` - User registration
- `/checkout` - Plan selection and payment
- `/course/:id` - Public course preview

### Protected Student Routes
All routes require authentication and student role:

```typescript
// Routes with layout
/dashboard              - Main dashboard
/courses               - Course catalog
/my-courses           - Enrolled courses
/schedule             - Study planning
/simulations          - Exam simulations
/flashcards           - Flashcard system
/questions            - Question bank
/summaries            - Study summaries
/legislation          - Legal documents
/tactical             - Analytics panel
/subscription         - Plan management
/settings             - User preferences

// Routes without layout (full-screen)
/course/:courseId/learn           - Learning interface
/simulations/:examId/take         - Exam taking
/simulations/:examId/results      - Exam results
```

### Protected Admin Routes
All routes require authentication and admin role:

```typescript
/admin                 - Redirect to dashboard
/admin/dashboard       - Admin overview
/admin/content         - Content management
/admin/courses         - Course management
/admin/summaries       - Summary editing
/admin/legislation     - Legal content
/admin/users           - User management
/admin/questions       - Question editing
/admin/analytics       - System analytics
/admin/import          - Bulk import
/admin/categories      - Category management
/admin/settings        - System settings
```

### Route Protection
```typescript
function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  // Redirect logic based on authentication and role
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && user?.role !== requiredRole) {
    // Smart redirection based on user role
  }
  
  return <>{children}</>;
}
```

---

## State Management

### Global State (Zustand)

#### Authentication Store
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  clearAuth: () => void;
}
```

**Features:**
- Automatic persistence to localStorage
- Token management with automatic cleanup
- Type-safe user data

#### User Interface
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'instructor';
  avatar?: string;
  subscription?: {
    plan: string;
    expiresAt: string | null;
    status: 'active' | 'expired' | 'cancelled';
  };
}
```

### Context-Based State

#### Theme Context
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}
```

**Features:**
- System preference detection
- Automatic persistence
- CSS class management
- Smooth transitions

### Server State (React Query)
```typescript
// Example configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});
```

**Benefits:**
- Automatic caching and synchronization
- Background refetching
- Optimistic updates
- Error handling

---

## Styling and Theming

### Tailwind CSS Configuration

#### Custom Colors
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#e6e8ea',
        // ... other shades
        600: '#14242f', // Main brand color
        // ... darker shades
      },
      accent: {
        // Blue accent colors for CTAs
        500: '#0073e6',
        // ... other shades
      }
    }
  }
}
```

#### Dark Mode Implementation
- **Strategy:** `darkMode: 'class'` - Class-based dark mode
- **CSS Variables:** HSL-based color system for smooth transitions
- **Component Integration:** Dark variants for all components

### CSS Architecture

#### Base Styles (`index.css`)
```css
@layer base {
  :root {
    /* Light theme variables */
    --background: 0 0% 100%;
    --foreground: 203 44% 13%;
    /* ... more variables */
  }

  .dark {
    /* Dark theme variables */
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```

#### Utility Classes
```css
@layer utilities {
  .text-primary-900 {
    @apply dark:text-white;
  }
  /* ... responsive text utilities */
}
```

### Animation System

#### Framer Motion Integration
- **Page Transitions:** Staggered animations for content sections
- **Component Animations:** Hover states, loading states
- **Gesture Support:** Drag, tap, and hover interactions

#### Animation Patterns
```typescript
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

---

## Configuration and Settings

### Environment Configuration

#### Vite Configuration (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Docker compatibility
    port: 5173,
    watch: {
      usePolling: true, // Hot reload in Docker
    },
  },
})
```

#### Environment Variables
```typescript
// API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});
```

**Required Environment Variables:**
- `VITE_API_URL` - Backend API endpoint

### Package Dependencies

#### Production Dependencies
```json
{
  "@stripe/react-stripe-js": "^3.7.0",
  "@stripe/stripe-js": "^7.5.0",
  "@tanstack/react-query": "^5.83.0",
  "axios": "^1.10.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^4.1.0",
  "framer-motion": "^12.23.6",
  "lucide-react": "^0.525.0",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-hot-toast": "^2.5.2",
  "react-router-dom": "^6.22.0",
  "recharts": "^3.1.0",
  "tailwind-merge": "^3.3.1",
  "zustand": "^5.0.6"
}
```

#### Development Dependencies
```json
{
  "@eslint/js": "^9.30.1",
  "@types/react": "^19.1.8",
  "@types/react-dom": "^19.1.6",
  "@vitejs/plugin-react": "^4.6.0",
  "autoprefixer": "^10.4.21",
  "eslint": "^9.30.1",
  "postcss": "^8.5.6",
  "tailwindcss": "^3.4.1",
  "typescript": "~5.8.3",
  "vite": "^4.5.3"
}
```

### Build Configuration

#### TypeScript Configuration
- **App Config:** `tsconfig.app.json` - Application-specific settings
- **Node Config:** `tsconfig.node.json` - Build tool settings
- **Base Config:** `tsconfig.json` - Shared configuration

#### ESLint Configuration
- **Modern Configuration:** Using flat config format
- **React Integration:** React hooks and refresh plugins
- **TypeScript Support:** Full TypeScript linting

### API Integration

#### Axios Configuration
```typescript
// Request interceptor - Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Auto-logout on auth failure
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Development Guidelines

### Code Organization
- **Absolute Imports:** Using `@/` alias for clean imports
- **Type Safety:** Comprehensive TypeScript usage
- **Component Structure:** Consistent file organization
- **State Management:** Clear separation of concerns

### Performance Optimizations
- **Code Splitting:** Route-based code splitting
- **Image Optimization:** Responsive images and lazy loading
- **Bundle Analysis:** Vite's built-in bundle analyzer
- **Caching:** React Query for server state caching

### Accessibility
- **Semantic HTML:** Proper heading hierarchy
- **ARIA Labels:** Screen reader support
- **Keyboard Navigation:** Full keyboard accessibility
- **Color Contrast:** WCAG AA compliance

### Mobile Responsiveness
- **Mobile-First:** Tailwind's mobile-first approach
- **Touch Targets:** Appropriate button and link sizes
- **Viewport:** Proper viewport configuration
- **PWA Ready:** Service worker registration prepared

---

This documentation provides a comprehensive overview of the StudyPro frontend application. The application demonstrates modern React development practices with a focus on user experience, performance, and maintainability.