
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, Calendar, DollarSign, Tag, Package, Image as ImageIcon, Loader2, Megaphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../services/mockData';
import { PromotionStatus } from '../types';

interface PromoFormData {
  product_name: string;
  description: string;
  category: string;
  campaign_id?: string; // Added campaign_id to form data
  price_before: number;
  price_now: number;
  quantity: 'unlimited' | 'limited';
  stock_count?: number;
  valid_until: string;
}

const NewPromo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPromotion, campaigns } = useStore();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Filter campaigns for this user
  const myCampaigns = campaigns.filter(c => c.business_id === (user?.id || 'b1'));

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PromoFormData>({
    defaultValues: {
      quantity: 'unlimited',
      price_before: 0,
      price_now: 0
    }
  });

  const priceBefore = watch('price_before');
  const priceNow = watch('price_now');
  const quantityType = watch('quantity');

  useEffect(() => {
    if (priceBefore > 0 && priceNow > 0) {
      const disc = Math.round(((priceBefore - priceNow) / priceBefore) * 100);
      setDiscount(disc);
    } else {
      setDiscount(0);
    }
  }, [priceBefore, priceNow]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const onSubmit = async (data: PromoFormData) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newPromo = {
        id: `new-${Date.now()}`,
        business_id: user?.id || 'b1',
        ...data,
        // Ensure empty string from select becomes undefined
        campaign_id: data.campaign_id === "" ? undefined : data.campaign_id,
        discount_percent: discount,
        photo_url: imagePreview || 'https://via.placeholder.com/400x300?text=No+Image',
        qr_code: `PROMO-${user?.id.split('-')[1] || 'BIZ'}-${Date.now().toString().slice(-6)}`,
        status: PromotionStatus.ACTIVE,
        views_count: 0,
        saves_count: 0,
        qr_scans: 0,
        created_at: new Date().toISOString()
      };

      addPromotion(newPromo);
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nova Oferta</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Image Upload */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-primary-500" /> Foto do Produto
          </h2>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain rounded-lg" />
            ) : (
              <>
                <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                  <Upload size={24} className="text-primary-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Clique para fazer upload</p>
                <p className="text-xs text-gray-400 mt-1">JPG ou PNG (Máx 5MB)</p>
              </>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Tag size={20} className="text-primary-500" /> Informações Básicas
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
            <input
              {...register('product_name', { required: 'Nome é obrigatório', minLength: 3 })}
              type="text"
              placeholder="Ex: Tomate Italiano Kg"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
            />
            {errors.product_name && <span className="text-xs text-red-500">{errors.product_name.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                {...register('category', { required: 'Selecione uma categoria' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Selecione...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Megaphone size={14} className="text-gray-400" /> Campanha (Opcional)
              </label>
              <select
                {...register('campaign_id')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Sem campanha</option>
                {myCampaigns.map(camp => (
                  <option key={camp.id} value={camp.id}>{camp.title}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Vincular a uma campanha agrupa esta oferta no folheto digital.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Detalhes sobre o produto, marca, condições..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Price & Discount */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DollarSign size={20} className="text-primary-500" /> Preço e Desconto
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Original (R$)</label>
              <input
                {...register('price_before', { 
                  required: true, 
                  valueAsNumber: true,
                  validate: value => value > 0 || 'Deve ser maior que 0'
                })}
                type="number"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Promocional (R$)</label>
              <input
                {...register('price_now', { 
                  required: true, 
                  valueAsNumber: true,
                  validate: value => value < priceBefore || 'Deve ser menor que o original'
                })}
                type="number"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-primary-50/30 text-primary-900 font-bold focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
          {errors.price_now && <span className="text-xs text-red-500">Preço promocional deve ser menor que o original</span>}

          {discount > 0 && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-xl text-sm font-bold animate-in fade-in">
              <Tag size={16} />
              Desconto de {discount}% aplicado!
            </div>
          )}
        </div>

        {/* Inventory & Validity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package size={20} className="text-primary-500" /> Estoque e Validade
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Estoque</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${quantityType === 'unlimited' ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" {...register('quantity')} value="unlimited" className="hidden" />
                Ilimitado
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${quantityType === 'limited' ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" {...register('quantity')} value="limited" className="hidden" />
                Limitado
              </label>
            </div>
          </div>

          {quantityType === 'limited' && (
             <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade em Estoque</label>
              <input
                {...register('stock_count', { required: quantityType === 'limited', min: 1 })}
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Válido Até</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                {...register('valid_until', { required: 'Data é obrigatória' })}
                type="datetime-local"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 pb-8">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Publicando...
              </>
            ) : (
              'Publicar Oferta 🚀'
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default NewPromo;
