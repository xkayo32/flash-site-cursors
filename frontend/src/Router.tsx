import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';

// Páginas públicas
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CheckoutPage from './pages/public/CheckoutPage';

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
import PaymentSettingsPage from './pages/student/PaymentSettingsPage';

// Páginas do Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentManager from './pages/admin/ContentManager';
import UserManager from './pages/admin/UserManager';
import QuestionEditor from './pages/admin/QuestionEditor';
import Analytics from './pages/admin/Analytics';
import CourseEditor from './pages/admin/CourseEditor';
import SummaryEditor from './pages/admin/SummaryEditor';
import LegislationManager from './pages/admin/LegislationManager';
import ImportManager from './pages/admin/ImportManager';
import CategoryManager from './pages/admin/CategoryManager';
import AdminLayout from './components/layout/AdminLayout';

// Componente para rotas protegidas
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'student' }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    // Se é admin tentando acessar rota de student, redireciona para admin
    if (user?.role === 'admin' && requiredRole === 'student') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Se é student tentando acessar rota de admin, redireciona para dashboard
    if (user?.role === 'student' && requiredRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    // Fallback
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function Router() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
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
        <Route path="/payment-settings" element={<PaymentSettingsPage />} />
      </Route>
      
      {/* Rotas do Admin */}
      <Route
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/content" element={<ContentManager />} />
        <Route path="/admin/courses" element={<CourseEditor />} />
        <Route path="/admin/summaries" element={<SummaryEditor />} />
        <Route path="/admin/legislation" element={<LegislationManager />} />
        <Route path="/admin/users" element={<UserManager />} />
        <Route path="/admin/questions" element={<QuestionEditor />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/import" element={<ImportManager />} />
        <Route path="/admin/categories" element={<CategoryManager />} />
      </Route>
      
      {/* Rota padrão */}
      <Route path="*" element={
        <Navigate 
          to={isAuthenticated ? (user?.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/'} 
          replace 
        />
      } />
    </Routes>
  );
}

export default Router;