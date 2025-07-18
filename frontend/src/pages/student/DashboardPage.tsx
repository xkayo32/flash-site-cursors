import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Olá, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Questões Resolvidas</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Flashcards Revisados</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Taxa de Acerto</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">0%</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Dias de Estudo</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Início Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <h3 className="font-semibold">Resolver Questões</h3>
              <p className="text-sm text-gray-600 mt-1">Pratique com nosso banco de questões</p>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <h3 className="font-semibold">Revisar Flashcards</h3>
              <p className="text-sm text-gray-600 mt-1">Revise seus cards do dia</p>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <h3 className="font-semibold">Fazer Simulado</h3>
              <p className="text-sm text-gray-600 mt-1">Teste seus conhecimentos</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;