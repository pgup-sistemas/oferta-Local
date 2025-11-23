
import React from 'react';
import { MapPin, Clock, Heart, ArrowRight } from 'lucide-react';
import { Promotion, Business } from '../types';
import { useStore } from '../store/useStore';

interface PromoCardProps {
  promotion: Promotion;
  business: Business;
  onClick: () => void;
}

const PromoCard: React.FC<PromoCardProps> = ({ promotion, business, onClick }) => {
  const { isFavorite, toggleFavorite } = useStore();
  const favorited = isFavorite(promotion.id);

  const timeLeft = new Date(promotion.valid_until).getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const isExpired = timeLeft < 0;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(promotion.id);
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group ${isExpired ? 'opacity-75 grayscale' : ''}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={promotion.photo_url} 
          alt={promotion.product_name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
          <span className="text-xs font-bold text-gray-800">{business.distance}m</span>
        </div>
        <div className="absolute bottom-3 left-3 bg-primary-500 text-white px-3 py-1 rounded-full shadow-md">
          <span className="text-sm font-bold">{promotion.discount_percent}% OFF</span>
        </div>
        {isExpired && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
             <span className="text-white font-bold border-2 border-white px-4 py-1 rounded-lg transform -rotate-12">EXPIRADO</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{promotion.product_name}</h3>
            <div className="flex items-center text-gray-500 text-sm gap-1">
              <MapPin size={14} />
              <span className="truncate max-w-[150px]">{business.name}</span>
            </div>
          </div>
          <button 
            onClick={handleFavorite}
            className={`transition-colors p-1 rounded-full hover:bg-gray-100 ${favorited ? 'text-red-500 fill-current' : 'text-gray-300 hover:text-red-400'}`}
          >
            <Heart size={20} fill={favorited ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="text-2xl font-bold text-primary-600">R$ {promotion.price_now.toFixed(2).replace('.', ',')}</span>
          <span className="text-sm text-gray-400 line-through mb-1">R$ {promotion.price_before.toFixed(2).replace('.', ',')}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${daysLeft <= 2 ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'}`}>
            <Clock size={14} />
            <span className="font-medium">
              {isExpired ? 'Expirado' : daysLeft === 0 ? 'Vence hoje' : `Vence em ${daysLeft} dias`}
            </span>
          </div>
          
          <div className="flex items-center text-primary-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
            Ver Oferta <ArrowRight size={16} className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCard;
