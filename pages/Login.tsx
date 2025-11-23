
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { loginAsUser, loginAsMerchant, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleUserLogin = () => {
    loginAsUser();
    navigate('/');
  };

  const handleMerchantLogin = () => {
    loginAsMerchant();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-primary-50 p-4 rounded-2xl mb-6">
        <Store className="text-primary-600 h-12 w-12" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Oferta Local</h1>
      <p className="text-gray-500 mb-8 max-w-xs">
        Economize nas compras do dia a dia ou aumente suas vendas locais.
      </p>

      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={handleUserLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 p-4 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
        >
          <div className="bg-gray-100 p-2 rounded-full group-hover:bg-white transition-colors">
            <User size={20} className="text-gray-600 group-hover:text-primary-600" />
          </div>
          <div className="text-left flex-1">
            <span className="block font-bold text-gray-900">Sou Consumidor</span>
            <span className="text-xs text-gray-500">Quero ver ofertas</span>
          </div>
        </button>

        <button
          onClick={handleMerchantLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 p-4 rounded-xl hover:border-gray-800 hover:bg-gray-50 transition-all group"
        >
          <div className="bg-gray-100 p-2 rounded-full group-hover:bg-white transition-colors">
            <Store size={20} className="text-gray-600 group-hover:text-gray-900" />
          </div>
          <div className="text-left flex-1">
            <span className="block font-bold text-gray-900">Sou Comerciante</span>
            <span className="text-xs text-gray-500">Quero vender mais</span>
          </div>
        </button>
      </div>
      
      <div className="mt-8 space-y-3 text-sm">
        <Link to="/forgot-password" className="block text-primary-600 hover:underline">
          Esqueceu sua senha?
        </Link>
        
        <div className="border-t border-gray-100 pt-4">
          <p className="text-gray-500 mb-2">Ainda não tem conta?</p>
          <Link to="/merchant-signup" className="font-bold text-primary-600 hover:underline">
            Cadastrar meu Estabelecimento
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400">
        Demo Mode: Clique em uma das opções acima.
      </p>
    </div>
  );
};

export default Login;
