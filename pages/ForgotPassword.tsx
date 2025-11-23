
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';

interface ForgotPasswordData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>();

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Password reset requested for:', data.email);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={() => navigate('/login')} 
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Recuperar Senha</h1>
        </div>

        {isSuccess ? (
          <div className="text-center py-8 animate-in fade-in">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500 h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Email Enviado!</h2>
            <p className="text-gray-500 mb-6">
              Se existir uma conta associada a este email, você receberá um link para redefinir sua senha em instantes.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Voltar para Login
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6">
              Digite seu email abaixo e enviaremos as instruções para você criar uma nova senha.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...register('email', { 
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Enviando...
                  </>
                ) : (
                  'Enviar Instruções'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
