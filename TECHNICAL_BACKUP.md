# StudyPro - Backup Técnico e Configurações

## 🔧 Configurações Importantes

### Package.json Frontend
```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.5",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "tailwind-merge": "^2.1.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^4.5.0"
  }
}
```

### Tailwind CSS Config
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
```

### Vite Config
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
```

---

## 📁 Estrutura de Componentes Principais

### AuthStore (Zustand)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription?: {
    plan: string;
    expiresAt: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}
```

### Router Structure
```typescript
// Rotas públicas
/ - HomePage
/login - LoginPage  
/register - RegisterPage
/course/:id - CourseDetailsPage

// Rotas especiais (sem layout)
/course/:courseId/learn - CourseLearningPage
/simulations/:examId/take - ExamTakingPage
/simulations/:examId/results - ExamResultsPage

// Rotas protegidas (com layout)
/dashboard - DashboardPage
/courses - CoursesPage
/my-courses - MyCoursesPage
/simulations - SimuladosPage
/schedule - UnderDevelopment
/flashcards - UnderDevelopment
/questions - UnderDevelopment
/summaries - UnderDevelopment
/legislation - UnderDevelopment
/tactical - UnderDevelopment
/subscription - UnderDevelopment
/settings - UnderDevelopment
```

### Component Props Patterns
```typescript
// Button Component
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

// Logo Component
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';
  className?: string;
  animated?: boolean;
}
```

---

## 🎨 Design Tokens

### Cores Principais
```css
/* Primary Blue Scale */
--primary-50: #f0f9ff;
--primary-600: #0284c7;
--primary-900: #0c4a6e;

/* Accent Orange Scale */
--accent-400: #f59e0b;
--accent-500: #d97706;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography Scale
```css
/* Headings */
h1: text-3xl font-bold (30px)
h2: text-2xl font-bold (24px)
h3: text-xl font-bold (20px)
h4: text-lg font-semibold (18px)

/* Body Text */
body: text-base (16px)
small: text-sm (14px)
tiny: text-xs (12px)
```

### Spacing System
```css
/* Tailwind Spacing */
p-2: 8px
p-4: 16px
p-6: 24px
p-8: 32px

gap-2: 8px
gap-4: 16px
gap-6: 24px
```

---

## 🔍 Padrões de Código

### Naming Conventions
```typescript
// Components: PascalCase
const CourseCard = () => {}
const SimuladosPage = () => {}

// Functions: camelCase  
const handleSubmit = () => {}
const formatTime = () => {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_QUESTIONS = 120;
const DEFAULT_DURATION = 180;

// Props: camelCase with interface
interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}
```

### File Organization
```
pages/
  public/       # Public pages (no auth required)
  auth/         # Authentication pages
  student/      # Protected student pages

components/
  layout/       # Layout components
  ui/           # Reusable UI components

utils/          # Helper functions
store/          # State management
assets/         # Static assets
```

### Import Organization
```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play } from 'lucide-react';

// 2. Internal components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 3. Utils and stores
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';

// 4. Types (if separate file)
import type { Course, Exam } from '@/types';
```

---

## 🚀 Performance Optimizations

### Code Splitting
```typescript
// Lazy loading for large pages
const DashboardPage = lazy(() => import('./pages/student/DashboardPage'));
const SimuladosPage = lazy(() => import('./pages/student/SimuladosPage'));
```

### Image Optimization
```typescript
// Use appropriate formats and sizes
<img 
  src="https://images.unsplash.com/photo-xxx?w=400&h=250&fit=crop"
  alt="Course thumbnail"
  loading="lazy"
  className="w-full h-48 object-cover"
/>
```

### Bundle Analysis
```bash
# Build analysis
npm run build
npx vite-bundle-analyzer dist
```

---

## 🔐 Security Considerations

### Route Protection
```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

### Input Sanitization
```typescript
// Always sanitize user inputs
const sanitizedInput = searchTerm.toLowerCase().trim();

// Use proper validation
if (!email.includes('@')) {
  throw new Error('Invalid email');
}
```

### Environment Variables
```typescript
// Use environment variables for sensitive data
const API_URL = import.meta.env.VITE_API_URL;
const APP_ENV = import.meta.env.VITE_APP_ENV;
```

---

## 🎯 Testing Strategy

### Unit Tests (Planned)
```typescript
// Component testing with React Testing Library
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### E2E Tests (Planned)
```typescript
// Cypress or Playwright for full user flows
describe('Exam Taking Flow', () => {
  it('should complete exam successfully', () => {
    cy.visit('/simulations/1/take');
    cy.get('[data-testid=question-1]').click();
    cy.get('[data-testid=submit-exam]').click();
    cy.url().should('include', '/results');
  });
});
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Tailwind Breakpoints */
sm: 640px
md: 768px  
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Grid Patterns
```typescript
// Common responsive patterns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
className="flex flex-col lg:flex-row gap-4"
className="hidden lg:block" // Desktop only
className="lg:hidden" // Mobile only
```

---

## 🔄 State Management Patterns

### Local State
```typescript
// Use useState for component-specific state
const [isLoading, setIsLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
```

### Global State (Zustand)
```typescript
// Use Zustand for app-wide state
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    // Implementation
  },
}));
```

### URL State
```typescript
// Use URL params for shareable state
const { examId } = useParams();
const [searchParams, setSearchParams] = useSearchParams();
```

---

## 🎨 Animation Guidelines

### Framer Motion Patterns
```typescript
// Page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// List animations
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
))}

// Hover effects
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

### CSS Animations
```css
/* Utility animations in Tailwind */
.animate-fade-in
.animate-slide-up
.animate-bounce-subtle
```

---

## 📦 Build and Deployment

### Build Configuration
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### Environment Setup
```bash
# Development
npm run dev

# Production build
npm run build
npm run preview

# Type checking
npm run type-check
```

### Docker Configuration
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

---

## 🔄 Git Workflow

### Branch Strategy
```bash
main              # Production ready
develop           # Integration branch
feature/*         # Feature branches
hotfix/*          # Emergency fixes
```

### Commit Messages
```bash
# Format: type(scope): description
feat(simulados): add exam taking functionality
fix(auth): resolve login validation issue
docs(readme): update installation instructions
style(ui): improve button component styling
```

### Current Branch
```bash
feature/frontend-setup  # Current working branch
```

---

## 📚 Documentation Standards

### Component Documentation
```typescript
/**
 * ExamCard - Displays exam information in card format
 * 
 * @param exam - The exam object containing all exam data
 * @param onClick - Optional click handler for the card
 * @returns JSX element representing the exam card
 */
interface ExamCardProps {
  exam: MockExam;
  onClick?: () => void;
}
```

### Function Documentation
```typescript
/**
 * Formats time in seconds to human readable format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "2h 30min")
 */
const formatTime = (seconds: number): string => {
  // Implementation
};
```

---

## 🎯 Key Implementation Files

### Critical Files to Backup
1. `src/Router.tsx` - Route configuration
2. `src/store/authStore.ts` - Authentication state
3. `src/utils/cn.ts` - Utility functions
4. `src/components/ui/` - UI component library
5. `src/pages/student/` - All main pages
6. `tailwind.config.js` - Styling configuration
7. `vite.config.ts` - Build configuration

### Mock Data Locations
- `SimuladosPage.tsx` - Exam list data
- `ExamTakingPage.tsx` - Question data
- `ExamResultsPage.tsx` - Results data
- `CoursesPage.tsx` - Course catalog data
- `MyCoursesPage.tsx` - Enrolled courses data

---

**Backup Date**: 19 de Janeiro de 2025  
**Version**: 1.0.0-frontend-complete  
**Branch**: feature/frontend-setup

*Este backup contém todas as informações técnicas necessárias para continuar o desenvolvimento do projeto.*