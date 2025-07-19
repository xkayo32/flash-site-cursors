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
        <Route path="/schedule" element={
          <UnderDevelopment 
            title="Cronograma Personalizado" 
            description="Plano de estudos gerado por IA baseado na data da prova e edital" 
            icon={Calendar}
          />
        } />
        <Route path="/simulations" element={
          <UnderDevelopment 
            title="Simulados" 
            description="Simulados com condições reais de prova" 
            icon={Trophy}
          />
        } />
        <Route path="/flashcards" element={
          <UnderDevelopment 
            title="Flashcards" 
            description="Sistema de repetição espaçada (SRS) para memorização" 
            icon={Brain}
          />
        } />
        <Route path="/questions" element={
          <UnderDevelopment 
            title="Banco de Questões" 
            description="Questões organizadas por disciplina, banca e ano" 
            icon={FileQuestion}
          />
        } />
        <Route path="/summaries" element={
          <UnderDevelopment 
            title="Resumos Interativos" 
            description="Conteúdo didático com flashcards e questões incorporados" 
            icon={FileText}
          />
        } />
        <Route path="/legislation" element={
          <UnderDevelopment 
            title="Legislação" 
            description="Textos de leis relevantes para os cursos" 
            icon={Scale}
          />
        } />
        <Route path="/tactical" element={
          <UnderDevelopment 
            title="Painel Tático" 
            description="Dashboard avançado com cruzamento de dados de desempenho" 
            icon={Target}
          />
        } />
        <Route path="/subscription" element={
          <UnderDevelopment 
            title="Gerenciar Assinatura" 
            description="Visualizar, atualizar ou cancelar assinatura" 
            icon={CreditCard}
          />
        } />
        <Route path="/settings" element={
          <UnderDevelopment 
            title="Configurações" 
            description="Preferências do usuário e configurações da conta" 
            icon={Settings}
          />
        } />
      </Route>
      
      {/* Rota padrão */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default Router;