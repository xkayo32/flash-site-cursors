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
        <Route path="/questions" element={<div>Questões - Em breve</div>} />
        <Route path="/flashcards" element={<div>Flashcards - Em breve</div>} />
        <Route path="/courses" element={<div>Cursos - Em breve</div>} />
        <Route path="/simulations" element={<div>Simulados - Em breve</div>} />
        <Route path="/summaries" element={<div>Resumos - Em breve</div>} />
        <Route path="/performance" element={<div>Desempenho - Em breve</div>} />
        <Route path="/schedule" element={<div>Cronograma - Em breve</div>} />
        <Route path="/subscription" element={<div>Assinatura - Em breve</div>} />
        <Route path="/settings" element={<div>Configurações - Em breve</div>} />
      </Route>
      
      {/* Rota padrão */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default Router;