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
import ExamTakingPageNew from './pages/student/ExamTakingPageNew';
import ExamResultsPage from './pages/student/ExamResultsPage';
import FlashcardsPage from './pages/student/FlashcardsPage';
import MyFlashcards from './pages/student/MyFlashcards';
import NewStudentFlashcard from './pages/student/NewStudentFlashcard';
import NewStudentDeck from './pages/student/NewStudentDeck';
import NewStudentDeckSimple from './pages/student/NewStudentDeckSimple';
import DeckView from './pages/student/DeckView';
import StudyDeck from './pages/student/StudyDeck';
import StudentFlashcardManager from './pages/student/StudentFlashcardManager';
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
import NewUser from './pages/admin/NewUser';
import QuestionEditor from './pages/admin/QuestionEditor';
import QuestionView from './pages/admin/QuestionView';
import NewQuestion from './pages/admin/NewQuestion';
import CourseEditor from './pages/admin/CourseEditor';
import CourseView from './pages/admin/CourseView';
import SummaryEditor from './pages/admin/SummaryEditor';
import LegislationManager from './pages/admin/LegislationManager';
import NewLegislation from './pages/admin/NewLegislation';
import CategoryManager from './pages/admin/CategoryManagerImproved';
import AdminSettings from './pages/admin/AdminSettings';
import CourseForm from './pages/admin/CourseForm';
import SummaryForm from './pages/admin/SummaryForm';
import FlashcardManager from './pages/admin/FlashcardManager';
import NewFlashcardDeck from './pages/admin/NewFlashcardDeck';
import NewFlashcardDeckSimple from './pages/admin/NewFlashcardDeckSimple';
import FlashcardEditor from './pages/admin/FlashcardEditor';
import IndividualFlashcards from './pages/admin/IndividualFlashcards';
import NewFlashcard from './pages/admin/NewFlashcard';
import MockExamManagerSimple from './pages/admin/MockExamManagerSimple';
import PreviousExamsManagerSimple from './pages/admin/PreviousExamsManagerSimple';
import MockExamsPageSimple from './pages/student/MockExamsPageSimple';
import PreviousExamsMilitary from './pages/student/PreviousExamsMilitary';
import SimulationDetailsPage from './pages/student/SimulationDetailsPage';
import ExamAttemptPage from './pages/student/ExamAttemptPage';
import ExamResultsDetailPage from './pages/student/ExamResultsDetailPage';
import AdminLayout from './components/layout/AdminLayout';

// Componente para rotas protegidas
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'student' }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  // Debug: Log de tentativas de acesso
  console.log('ProtectedRoute - User:', user?.email, 'Role:', user?.role, 'Required:', requiredRole);
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Redirecionando para login: usuário não autenticado');
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    // Se é admin tentando acessar rota de student, redireciona para admin
    if (user?.role === 'admin' && requiredRole === 'student') {
      console.log('ProtectedRoute - Admin tentando acessar rota de student, redirecionando para admin dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Se é student tentando acessar rota de admin, redireciona para dashboard
    if (user?.role === 'student' && requiredRole === 'admin') {
      console.log('ProtectedRoute - Student tentando acessar rota de admin, redirecionando para dashboard');
      return <Navigate to="/dashboard" replace />;
    }
    // Fallback
    console.log('ProtectedRoute - Redirecionamento fallback para home');
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
        path="/simulations/:examType/:examId/take" 
        element={
          <ProtectedRoute>
            <ExamTakingPageNew />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/simulations/:examId/results/:sessionId" 
        element={
          <ProtectedRoute>
            <ExamResultsPage />
          </ProtectedRoute>
        } 
      />
      {/* Legacy route for backward compatibility */}
      <Route 
        path="/simulations/:examId/take" 
        element={
          <ProtectedRoute>
            <ExamTakingPageNew />
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
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/simulations" element={<MockExamsPageSimple />} />
        <Route path="/simulations/:examId/details" element={<SimulationDetailsPage />} />
        {/* Removidas rotas duplicadas - usando as rotas fora do Layout */}
        <Route path="/exam/:attemptId" element={<ExamAttemptPage />} />
        <Route path="/exam-results/:attemptId" element={<ExamResultsDetailPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/my-flashcards" element={<MyFlashcards />} />
        <Route path="/student/flashcards/new" element={<NewStudentFlashcard />} />
        <Route path="/student/flashcards/:id/edit" element={<NewStudentFlashcard />} />
        <Route path="/student/flashcards/manager" element={<StudentFlashcardManager />} />
        <Route path="/student/decks/new" element={<NewStudentDeckSimple />} />
        <Route path="/student/decks/:id" element={<DeckView />} />
        <Route path="/student/decks/:id/study" element={<StudyDeck />} />
        <Route path="/student/decks/:deckId/cards" element={<StudyDeck />} />
        <Route path="/student/decks/:id/edit" element={<NewStudentDeck />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/previous-exams" element={<PreviousExamsMilitary />} />
        <Route path="/summaries" element={<SummariesPage />} />
        <Route path="/legislation" element={<LegislationPage />} />
        <Route path="/tactical" element={<TacticalPanelPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/payment" element={<PaymentSettingsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
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
        <Route path="/admin/courses/new" element={<CourseForm />} />
        <Route path="/admin/courses/edit/:id" element={<CourseForm />} />
        <Route path="/admin/courses/view/:id" element={<CourseView />} />
        <Route path="/admin/summaries" element={<SummaryEditor />} />
        <Route path="/admin/summaries/new" element={<SummaryForm />} />
        <Route path="/admin/summaries/edit/:id" element={<SummaryForm />} />
        <Route path="/admin/legislation" element={<LegislationManager />} />
        <Route path="/admin/legislation/new" element={<NewLegislation />} />
        <Route path="/admin/users" element={<UserManager />} />
        <Route path="/admin/users/new" element={<NewUser />} />
        <Route path="/admin/questions" element={<QuestionEditor />} />
        <Route path="/admin/questions/new" element={<NewQuestion />} />
        <Route path="/admin/questions/view/:id" element={<QuestionView />} />
        <Route path="/admin/questions/edit/:id" element={<NewQuestion />} />
        <Route path="/admin/flashcards" element={<FlashcardManager />} />
        <Route path="/admin/flashcards/new" element={<NewFlashcardDeckSimple />} />
        <Route path="/admin/flashcards/:deckId/edit" element={<FlashcardEditor />} />
        <Route path="/admin/flashcards/:deckId/cards" element={<FlashcardEditor />} />
        <Route path="/admin/flashcards/cards" element={<IndividualFlashcards />} />
        <Route path="/admin/flashcards/cards/new" element={<NewFlashcard />} />
        <Route path="/admin/flashcards/cards/:cardId/edit" element={<NewFlashcard />} />
        <Route path="/admin/mock-exams" element={<MockExamManagerSimple />} />
        <Route path="/admin/previous-exams" element={<PreviousExamsManagerSimple />} />
        <Route path="/admin/categories" element={<CategoryManager />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
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