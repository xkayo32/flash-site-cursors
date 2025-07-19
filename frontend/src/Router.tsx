import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';

// Páginas públicas
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Páginas protegidas
import DashboardPage from './pages/student/DashboardPage';

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
        <Route path="/courses" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Catálogo de Cursos</h2><p>Lista completa de cursos disponíveis na plataforma - Em desenvolvimento</p></div>} />
        <Route path="/schedule" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Cronograma Personalizado</h2><p>Plano de estudos gerado por IA baseado na data da prova e edital - Em desenvolvimento</p></div>} />
        <Route path="/simulations" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Simulados</h2><p>Simulados com condições reais de prova - Em desenvolvimento</p></div>} />
        <Route path="/flashcards" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Flashcards</h2><p>Sistema de repetição espaçada (SRS) para memorização - Em desenvolvimento</p></div>} />
        <Route path="/questions" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Banco de Questões</h2><p>Questões organizadas por disciplina, banca e ano - Em desenvolvimento</p></div>} />
        <Route path="/summaries" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Resumos Interativos</h2><p>Conteúdo didático com flashcards e questões incorporados - Em desenvolvimento</p></div>} />
        <Route path="/legislation" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Legislação</h2><p>Textos de leis relevantes para os cursos - Em desenvolvimento</p></div>} />
        <Route path="/tactical" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Painel Tático</h2><p>Dashboard avançado com cruzamento de dados de desempenho - Em desenvolvimento</p></div>} />
        <Route path="/subscription" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Gerenciar Assinatura</h2><p>Visualizar, atualizar ou cancelar assinatura - Em desenvolvimento</p></div>} />
        <Route path="/settings" element={<div className="p-6"><h2 className="text-2xl font-bold mb-4">Configurações</h2><p>Preferências do usuário e configurações da conta - Em desenvolvimento</p></div>} />
      </Route>
      
      {/* Rota padrão */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default Router;