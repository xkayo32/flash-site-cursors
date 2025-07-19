import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { UnderDevelopment } from './components/ui/UnderDevelopment';
import { 
  GraduationCap, 
  Calendar, 
  Trophy, 
  Brain, 
  FileQuestion, 
  FileText, 
  Scale, 
  Target, 
  CreditCard, 
  Settings 
} from 'lucide-react';

// Páginas públicas
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Páginas protegidas
import DashboardPage from './pages/student/DashboardPage';
import CoursesPage from './pages/student/CoursesPage';
import CourseDetailsPage from './pages/student/CourseDetailsPage';
import MyCoursesPage from './pages/student/MyCoursesPage';
import CourseLearningPage from './pages/student/CourseLearningPage';
import SimuladosPage from './pages/student/SimuladosPage';
import ExamTakingPage from './pages/student/ExamTakingPage';
import ExamResultsPage from './pages/student/ExamResultsPage';
import FlashcardsPage from './pages/student/FlashcardsPage';
import SchedulePage from './pages/student/SchedulePage';
import QuestionsPage from './pages/student/QuestionsPage';
import SummariesPage from './pages/student/SummariesPage';
import LegislationPage from './pages/student/LegislationPage';
import TacticalPanelPage from './pages/student/TacticalPanelPage';
import SubscriptionPage from './pages/student/SubscriptionPage';
import SettingsPage from './pages/student/SettingsPage';

// Componente para rotas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function Router() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/course/:id" element={<CourseDetailsPage />} />
      
      {/* Rotas de learning e exames sem layout padrão */}
      <Route 
        path="/course/:courseId/learn" 
        element={
          <ProtectedRoute>
            <CourseLearningPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/simulations/:examId/take" 
        element={
          <ProtectedRoute>
            <ExamTakingPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/simulations/:examId/results" 
        element={
          <ProtectedRoute>
            <ExamResultsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas protegidas com layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/simulations" element={<SimuladosPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/summaries" element={<SummariesPage />} />
        <Route path="/legislation" element={<LegislationPage />} />
        <Route path="/tactical" element={<TacticalPanelPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      {/* Rota padrão */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default Router;