import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, X, ChevronDown, Loader2, RefreshCw } from 'lucide-react';
import PromoCard from '../components/PromoCard';
import { CATEGORIES } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { UserRole, Business } from '../types';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { calculateDistance } from '../utils/location';
import LocationMap from '../components/LocationMap';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { promotions, businesses } = useStore();
  const { location, error: geoError, loading: geoLoading, retry: retryGeo } = useGeoLocation();
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  
  // Advanced Filters Toggle
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'discount'>('distance');
  const [maxDistance, setMaxDistance] = useState(20); // km

  useEffect(() => {
    // Redirect merchants to dashboard immediately
    if (user?.role === UserRole.BUSINESS) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Filter & Sort Logic
  const filteredPromotions = promotions.filter(promo => {
    const matchesCategory = selectedCategory === 'all' || promo.category === selectedCategory;
    const matchesSearch = promo.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const business = businesses.find(b => b.id === promo.business_id);
    
    // Distance Calculation
    let distanceKm = Infinity;
    if (location && business?.lat && business?.lng) {
      distanceKm = calculateDistance(location.lat, location.lng, business.lat, business.lng);
    } else if (business?.distance) {
      // Fallback to mock distance if geo fails (convert meters to km)
      distanceKm = business.distance / 1000; 
    }

    const matchesDistance = distanceKm <= maxDistance;

    return matchesCategory && matchesSearch && matchesDistance;
  }).map(promo => {
    // Attach calculated distance for sorting
    const business = businesses.find(b => b.id === promo.business_id);
    let dist = Infinity;
    if (location && business?.lat && business?.lng) {
      dist = calculateDistance(location.lat, location.lng, business.lat, business.lng) * 1000; // meters
    } else {
      dist = business?.distance || 0;
    }
    return { ...promo, calculatedDistance: dist };
  }).sort((a, b) => {
    // Sorting Logic
    if (sortBy === 'discount') return b.discount_percent - a.discount_percent;
    if (sortBy === 'price') return a.price_now - b.price_now;
    // Default distance sort
    return a.calculatedDistance - b.calculatedDistance;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Location Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600 bg-white p-3 rounded-xl shadow-sm border border-gray-100 transition-all">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${geoError ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'}`}>
            <MapPin size={16} className={geoLoading ? 'animate-bounce' : ''} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Próximo a</span>
            <span className="font-bold text-gray-900">
              {geoLoading ? 'Detectando...' : 
               geoError ? 'Localização Indisponível' : 
               location ? 'Localização Atual' : 'São Paulo (Padrão)'}
            </span>
          </div>
        </div>
        
        {geoError && (
          <button 
            onClick={retryGeo}
            className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
          >
            <RefreshCw size={10} /> Tentar Novamente
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 relative z-20">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="O que você procura hoje?" 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          aria-label={showFilters ? "Fechar filtros" : "Abrir filtros"}
          className={`
            p-3 rounded-xl border shadow-sm transition-all duration-200 
            active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-100
            flex items-center justify-center aspect-square
            ${showFilters 
              ? 'bg-primary-50 text-primary-600 border-primary-200' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }
          `}
        >
          {showFilters ? <X size={22} /> : <SlidersHorizontal size={22} strokeWidth={2} />}
        </button>
      </div>

      {/* Advanced Filters Panel (Collapsible) */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Visualização</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMap(false)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${!showMap ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${showMap ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  Mapa
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Ordenar por</label>
              <div className="flex gap-2">
                {[
                  { id: 'distance', label: '📍 Mais Perto' },
                  { id: 'discount', label: '🏷️ Maior Desconto' },
                  { id: 'price', label: '💰 Menor Preço' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      sortBy === opt.id 
                        ? 'bg-primary-50 text-primary-700 border-primary-200' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Distância Máxima</label>
                <span className="text-xs font-bold text-primary-600">{maxDistance} km</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={maxDistance} 
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>1km</span>
                <span>100km</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Categorias</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-xl border transition-all ${
              selectedCategory === 'all' 
                ? 'bg-primary-50 border-primary-200 shadow-sm transform scale-105' 
                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">🏠</span>
            <span className={`text-xs font-medium ${selectedCategory === 'all' ? 'text-primary-700' : 'text-gray-600'}`}>Tudo</span>
          </button>

          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-xl border transition-all ${
                selectedCategory === cat.slug 
                  ? 'bg-primary-50 border-primary-200 shadow-sm transform scale-105' 
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`text-xs font-medium ${selectedCategory === cat.slug ? 'text-primary-700' : 'text-gray-600'}`}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content: Map or Grid */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-gray-900">Ofertas em Destaque</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            {filteredPromotions.length} resultados
          </span>
        </div>
        
        {filteredPromotions.length > 0 ? (
          showMap ? (
            <div className="h-[60vh] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <LocationMap 
                userLocation={location}
                businesses={businesses.filter(b => filteredPromotions.some(p => p.business_id === b.id))}
                promotions={filteredPromotions}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromotions.map(promo => {
                const business = businesses.find(b => b.id === promo.business_id);
                if (!business) return null;
                
                // Use the dynamically calculated distance for the card
                const displayBusiness = {
                  ...business,
                  distance: Math.round(promo.calculatedDistance)
                };

                return (
                  <PromoCard 
                    key={promo.id} 
                    promotion={promo} 
                    business={displayBusiness}
                    onClick={() => navigate(`/promo/${promo.id}`)}
                  />
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-16 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg font-medium text-gray-900 mb-1">Nenhuma oferta encontrada</p>
            <p className="text-sm mb-4">Tente aumentar o raio de busca ou mudar a categoria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setMaxDistance(50);
              }}
              className="text-primary-600 font-bold text-sm hover:underline"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;