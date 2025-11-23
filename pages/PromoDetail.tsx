import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, MessageCircle, MapPin, Star, X, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';

const PromoDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { promotions, businesses, isFavorite, toggleFavorite } = useStore();
  const [showQR, setShowQR] = useState(false);

  const promo = promotions.find(p => p.id === id);
  const business = promo ? businesses.find(b => b.id === promo.business_id) : null;
  
  const favorited = promo ? isFavorite(promo.id) : false;

  if (!promo || !business) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-gray-500 mb-4">Promoção não encontrada.</p>
        <button 
          onClick={() => navigate('/')}
          className="text-primary-600 font-bold hover:underline"
        >
          Voltar para o início
        </button>
      </div>
    );
  }

  const handleFavorite = () => {
    toggleFavorite(promo.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: promo.product_name,
          text: `Olha essa oferta no ${business.name}: ${promo.product_name} por R$ ${promo.price_now.toFixed(2)}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert('Link copiado para a área de transferência!');
      // In a real app, write to clipboard here
    }
  };

  return (
    <div className="bg-white min-h-[80vh] rounded-3xl shadow-sm overflow-hidden relative">
      {/* Header Image */}
      <div className="relative h-64 md:h-80">
        <img 
          src={promo.photo_url} 
          alt={promo.product_name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-24"></div>
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors border border-white/20"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={handleShare}
            className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors border border-white/20"
          >
            <Share2 size={24} />
          </button>
          <button 
            onClick={handleFavorite}
            className={`bg-white/20 backdrop-blur-md p-2 rounded-full transition-colors border border-white/20 ${
              favorited ? 'text-red-500 bg-white' : 'text-white hover:bg-white/30'
            }`}
          >
            <Heart size={24} fill={favorited ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="p-6 -mt-6 relative bg-white rounded-t-3xl">
        {/* Business Info */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-6">
          <img 
            src={business.logo_url || "https://via.placeholder.com/50"} 
            alt={business.name} 
            className="w-12 h-12 rounded-full border border-gray-200 object-cover" 
          />
          <div className="flex-1 cursor-pointer" onClick={() => navigate('/') /* In real app, navigate to Business Profile */}>
            <h3 className="font-bold text-gray-900 leading-none mb-1">{business.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md">
                <Star size={10} fill="currentColor" /> {business.rating}
              </span>
              <span>•</span>
              <span>{business.total_reviews} avaliações</span>
            </div>
          </div>
          <a 
            href={`https://wa.me/${business.whatsapp}`} 
            target="_blank" 
            rel="noreferrer"
            className="bg-green-50 text-green-600 p-3 rounded-full hover:bg-green-100 transition-colors shadow-sm"
          >
            <MessageCircle size={22} />
          </a>
        </div>

        {/* Promo Details */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{promo.product_name}</h1>
          </div>
          
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-primary-600 tracking-tight">R$ {promo.price_now.toFixed(2).replace('.', ',')}</span>
            <div className="flex flex-col mb-1.5">
              <span className="text-gray-400 line-through text-sm">R$ {promo.price_before.toFixed(2).replace('.', ',')}</span>
              <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                {promo.discount_percent}% OFF
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-2xl mb-6">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">Descrição</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {promo.description || "Sem descrição detalhada."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 p-3 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                <MapPin size={18} />
              </div>
              <div className="text-xs text-gray-500">
                <p className="font-bold text-gray-900">{business.distance || '?'}m</p>
                <p>Distância</p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 p-3 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="bg-purple-50 p-2 rounded-lg text-purple-500">
                <Clock size={18} />
              </div>
              <div className="text-xs text-gray-500">
                <p className="font-bold text-gray-900">{new Date(promo.valid_until).toLocaleDateString()}</p>
                <p>Validade</p>
              </div>
            </div>
          </div>
          
          {promo.quantity === 'limited' && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm bg-orange-50 text-orange-700 py-2 rounded-xl font-medium">
               <span>⚠️</span>
               Restam apenas <span className="font-bold">{promo.stock_count}</span> unidades
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="sticky bottom-4 z-10">
          <button 
            onClick={() => setShowQR(true)}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Pegar Oferta 🚀
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 relative text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">Valide sua Oferta</h2>
            <p className="text-sm text-gray-500 mb-8">Apresente este código ao caixa para garantir seu desconto.</p>
            
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-4 mb-6 inline-block relative group">
               {/* Simulated QR Code */}
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${promo.qr_code}&bgcolor=ffffff`} 
                 alt="QR Code"
                 className="w-56 h-56 object-contain rounded-xl"
               />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 font-mono font-bold text-xl text-gray-900 pointer-events-none">
                 {promo.qr_code}
               </div>
            </div>
            
            <div className="bg-gray-100 rounded-xl py-3 px-4 mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Código da Promoção</p>
              <p className="font-mono font-bold text-2xl text-gray-900 tracking-widest">{promo.qr_code}</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 py-3 rounded-xl">
              <Clock size={14} />
              Esta oferta pode expirar em breve
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoDetail;