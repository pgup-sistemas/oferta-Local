
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Store, MapPin, Phone, Mail, CheckCircle, ArrowLeft, Loader2, User, Building2, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../services/mockData';
import { UserRole, PlanType } from '../types';

interface MerchantFormData {
  ownerName: string;
  email: string;
  password: string;
  businessName: string;
  cnpj: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  whatsapp: string;
  plan: PlanType;
}

const MerchantSignup: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithData } = useAuth();
  const { addBusiness } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.FREE);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<MerchantFormData>({
    defaultValues: {
      plan: PlanType.FREE
    }
  });

  // Input Masking Helpers
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
    
    setValue('cnpj', value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    
    setValue('whatsapp', value);
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    
    setValue('zip', value);
  };

  const onSubmit = async (data: MerchantFormData) => {
    setIsSubmitting(true);

    // Simulate API latency
    setTimeout(() => {
      const newBusinessId = `b-${Date.now()}`;
      const newUserId = `u-${Date.now()}`;

      // 1. Add Business to Global Store
      addBusiness({
        id: newBusinessId,
        name: data.businessName,
        category: data.category,
        description: `Bem-vindo ao ${data.businessName}`,
        address: `${data.address}, ${data.zip}`,
        city: data.city,
        state: data.state,
        whatsapp: data.whatsapp.replace(/\D/g, ''), // Store clean number
        logo_url: 'https://via.placeholder.com/150', // Placeholder
        rating: 0,
        total_reviews: 0,
        verified: false, // Requires admin approval in real app
        plan_type: selectedPlan,
        distance: 0
      });

      // 2. Create User Session
      loginWithData({
        id: newUserId,
        name: data.ownerName,
        email: data.email,
        role: UserRole.BUSINESS,
        avatar_url: 'https://via.placeholder.com/100',
        saved_promotions: []
      });

      setIsSubmitting(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Cadastro de Parceiro</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="text-primary-600 h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Impulsione suas vendas</h2>
            <p className="text-gray-500">Cadastre seu estabelecimento em minutos</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Section 1: Owner Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                <User size={20} className="text-primary-600" /> Dados de Acesso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável</label>
                  <input
                    {...register('ownerName', { required: 'Nome é obrigatório' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    placeholder="Seu nome completo"
                  />
                  {errors.ownerName && <span className="text-xs text-red-500">{errors.ownerName.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    {...register('email', { required: 'Email é obrigatório', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    placeholder="seu@email.com"
                  />
                  {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    {...register('password', { required: 'Senha é obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                    type="password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    placeholder="******"
                  />
                  {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                </div>
              </div>
            </div>

            {/* Section 2: Business Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                <Building2 size={20} className="text-primary-600" /> Dados do Estabelecimento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                  <input
                    {...register('businessName', { required: 'Nome do negócio é obrigatório' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    placeholder="Ex: Mercado São João"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ (Opcional)</label>
                  <input
                    {...register('cnpj')}
                    onChange={handleCNPJChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    {...register('category', { required: 'Selecione uma categoria' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none bg-white"
                  >
                    <option value="">Selecione...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Comercial</label>
                  <input
                    {...register('whatsapp', { required: 'WhatsApp é obrigatório' })}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Address */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                <MapPin size={20} className="text-primary-600" /> Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                  <input
                    {...register('address', { required: 'Endereço é obrigatório' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    placeholder="Rua, Número, Bairro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    {...register('city', { required: 'Cidade é obrigatória' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input
                    {...register('state', { required: 'UF é obrigatório', maxLength: 2 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input
                    {...register('zip', { required: 'CEP é obrigatório' })}
                    onChange={handleZipChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Plan Selection */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                <CreditCard size={20} className="text-primary-600" /> Escolha seu Plano
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free Plan */}
                <label className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${selectedPlan === PlanType.FREE ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    value={PlanType.FREE} 
                    checked={selectedPlan === PlanType.FREE}
                    onChange={() => setSelectedPlan(PlanType.FREE)}
                    className="absolute top-4 right-4 accent-primary-600"
                  />
                  <h4 className="font-bold text-gray-900">Gratuito (Trial)</h4>
                  <p className="text-2xl font-bold text-primary-600 my-2">R$ 0</p>
                  <p className="text-xs text-gray-500">Teste por 90 dias com todas as funcionalidades.</p>
                  <ul className="mt-3 space-y-1">
                    <li className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle size={10} className="text-green-500" /> 3 Ofertas Ativas</li>
                    <li className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle size={10} className="text-green-500" /> Alcance de 2km</li>
                  </ul>
                </label>

                {/* Basic Plan */}
                <label className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${selectedPlan === PlanType.BASIC ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    value={PlanType.BASIC} 
                    checked={selectedPlan === PlanType.BASIC}
                    onChange={() => setSelectedPlan(PlanType.BASIC)}
                    className="absolute top-4 right-4 accent-primary-600"
                  />
                  <h4 className="font-bold text-gray-900">Básico</h4>
                  <p className="text-2xl font-bold text-gray-900 my-2">R$ 49<span className="text-sm font-normal text-gray-500">/mês</span></p>
                  <ul className="mt-3 space-y-1">
                    <li className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle size={10} className="text-green-500" /> 15 Ofertas Ativas</li>
                    <li className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle size={10} className="text-green-500" /> Alcance de 5km</li>
                  </ul>
                </label>

                 {/* Pro Plan */}
                 <label className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all ${selectedPlan === PlanType.PRO ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    value={PlanType.PRO} 
                    checked={selectedPlan === PlanType.PRO}
                    onChange={() => setSelectedPlan(PlanType.PRO)}
                    className="absolute top-4 right-4 accent-primary-600"
                  />
                  <h4 className="font-bold text-gray-900">Pro</h4>
                  <p className="text-2xl font-bold text-gray-900 my-2">R$ 99<span className="text-sm font-normal text-gray-500">/mês</span></p>
                  <ul className="mt-3 space-y-1">
                    <li className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle size={10} className="text-green-500" /> Ofertas Ilimitadas</li>
                    <li className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle size={10} className="text-green-500" /> Dashboard Avançado</li>
                  </ul>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Criando Conta...
                  </>
                ) : (
                  'Finalizar Cadastro'
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default MerchantSignup;
