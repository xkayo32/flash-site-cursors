import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-600 to-primary-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Plataforma de Estudos
          </h1>
          <p className="text-xl text-primary-100 mb-8">
            Questões, Flashcards e Simulados para sua aprovação
          </p>
          
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-block px-8 py-3 bg-accent-500 text-white font-medium rounded-lg hover:bg-accent-600 transform hover:scale-105 transition duration-200 shadow-lg"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-primary-50 transform hover:scale-105 transition duration-200 shadow-lg"
            >
              Cadastrar
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition duration-300">
            <h3 className="text-xl font-semibold mb-2 text-white">Questões</h3>
            <p className="text-primary-100">
              Banco com milhares de questões organizadas por disciplina
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition duration-300">
            <h3 className="text-xl font-semibold mb-2 text-white">Flashcards</h3>
            <p className="text-primary-100">
              Sistema de repetição espaçada para memorização eficiente
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition duration-300">
            <h3 className="text-xl font-semibold mb-2 text-white">Simulados</h3>
            <p className="text-primary-100">
              Teste seus conhecimentos com simulados cronometrados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;