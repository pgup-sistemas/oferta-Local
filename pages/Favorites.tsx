
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, FilterX } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MOCK_BUSINESSES, CATEGORIES } from '../services/mockData';
import PromoCard from '../components/PromoCard';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, promotions } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 1. Get all favorited promotions
  const allFavorites = promotions.filter(p => favorites.includes(p.id));

  // 2. Filter by selected category
  const filteredFavorites = allFavorites.filter(p => 
    selectedCategory === 'all' || p.category === selectedCategory
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="text-red-500 fill-current" /> Meus Favoritos
          </h1>
          <p className="text-gray-500 text-sm">
            {allFavorites.length} oferta(s) salva(s)
          </p>
        </div>
      </div>

      {/* Category Filter Bar */}
      {allFavorites.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Tudo ({allFavorites.length})
          </button>
          
          {CATEGORIES.map(cat => {
            // Count items in this category to show/hide or disable if needed (optional UX)
            const count = allFavorites.filter(p => p.category === cat.slug).length;
            if (count === 0) return null; // Hide categories with no favorites

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.slug
                    ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name} <span className="opacity-60 text-[10px] ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results Grid */}
      {allFavorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Heart size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum favorito ainda</h2>
          <p className="text-gray-500 max-w-xs mb-6">
            Salve ofertas clicando no ícone de coração para acessá-las rapidamente aqui.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
          >
            Explorar Ofertas
          </button>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full mb-3 shadow-sm">
            <FilterX size={32} className="text-gray-400" />
          </div>
          <h2 className="font-bold text-gray-900">Categoria vazia</h2>
          <p className="text-sm text-gray-500 mb-4">
            Você não tem favoritos nesta categoria.
          </p>
          <button 
            onClick={() => setSelectedCategory('all')}
            className="text-primary-600 font-bold text-sm hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {filteredFavorites.map(promo => {
            const business = MOCK_BUSINESSES.find(b => b.id === promo.business_id);
            if (!business) return null;
            return (
              <PromoCard 
                key={promo.id} 
                promotion={promo} 
                business={business}
                onClick={() => navigate(`/promo/${promo.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
