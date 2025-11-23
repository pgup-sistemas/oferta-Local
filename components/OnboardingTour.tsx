
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  QrCode, 
  Heart, 
  Bell, 
  BarChart2, 
  PlusCircle, 
  CheckCircle, 
  X, 
  ChevronRight, 
  Store, 
  ArrowRight 
} from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
  path?: string; // Optional path to navigate to during this step
  highlight?: string; // ID of element to highlight (future enhancement)
}

const USER_STEPS: Step[] = [
  {
    title: "Bem-vindo ao Oferta Local!",
    description: "Descubra as melhores promoções no seu bairro. Vamos fazer um tour rápido?",
    icon: Store,
    path: "/"
  },
  {
    title: "Encontre Ofertas Próximas",
    description: "No feed inicial, você vê promoções baseadas na sua localização e categorias favoritas.",
    icon: MapPin,
    path: "/"
  },
  {
    title: "Salve seus Favoritos",
    description: "Gostou de algo? Marque como favorito para acessar rapidamente depois.",
    icon: Heart,
    path: "/favorites"
  },
  {
    title: "Resgate com QR Code",
    description: "Na loja, use o scanner para ler o código e validar seu desconto na hora!",
    icon: QrCode,
    path: "/scanner"
  },
  {
    title: "Tudo pronto!",
    description: "Você já sabe o básico. Aproveite as ofertas!",
    icon: CheckCircle,
    path: "/"
  }
];

const MERCHANT_STEPS: Step[] = [
  {
    title: "Painel do Comerciante",
    description: "Bem-vindo! Aqui você gerencia suas ofertas e acompanha seus resultados em tempo real.",
    icon: BarChart2,
    path: "/dashboard"
  },
  {
    title: "Crie Novas Ofertas",
    description: "Publique promoções em segundos. Defina preços, estoque e validade facilmente.",
    icon: PlusCircle,
    path: "/new-promo"
  },
  {
    title: "Valide Vendas",
    description: "Use o scanner para validar o QR Code do cliente e dar baixa no estoque automaticamente.",
    icon: QrCode,
    path: "/validate"
  },
  {
    title: "Perfil e Assinatura",
    description: "Gerencie os dados da sua loja e seu plano de assinatura aqui.",
    icon: Store,
    path: "/profile"
  },
  {
    title: "Vamos vender!",
    description: "Seu estabelecimento está pronto para alcançar mais clientes.",
    icon: CheckCircle,
    path: "/dashboard"
  }
];

const OnboardingTour: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Check localStorage on mount to see if tour has been completed
  useEffect(() => {
    if (user) {
      const hasSeenTour = localStorage.getItem(`onboarding_completed_${user.id}`);
      if (!hasSeenTour) {
        // Small delay to allow page to load
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  if (!user || !isOpen) return null;

  const steps = user.role === UserRole.BUSINESS ? MERCHANT_STEPS : USER_STEPS;
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      
      // Navigate if the next step has a path
      if (steps[nextIndex].path) {
        navigate(steps[nextIndex].path as string);
      }
    }
  };

  const completeTour = () => {
    setIsOpen(false);
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    // Ensure we end up on the home/dashboard
    navigate(user.role === UserRole.BUSINESS ? '/dashboard' : '/');
  };

  const handleSkip = () => {
    completeTour();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        {/* Header / Illustration Area */}
        <div className="bg-primary-50 p-8 flex justify-center items-center h-40 relative">
          <button 
            onClick={handleSkip}
            className="absolute top-4 right-4 text-primary-700/60 hover:text-primary-700 font-bold text-xs uppercase tracking-wider"
          >
            Pular
          </button>
          
          <div className="bg-white p-4 rounded-full shadow-lg shadow-primary-100 transform transition-all duration-500 scale-110">
            <currentStep.icon size={48} className="text-primary-600" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="flex justify-center gap-1 mb-6">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex ? 'w-6 bg-primary-600' : 'w-1.5 bg-gray-200'
                }`} 
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {currentStep.title}
          </h2>
          <p className="text-gray-500 text-center text-sm leading-relaxed mb-8 min-h-[3rem]">
            {currentStep.description}
          </p>

          <button
            onClick={handleNext}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            {isLastStep ? 'Começar!' : 'Próximo'}
            {!isLastStep && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
