
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import PromoCard from '../components/PromoCard';
import { ArrowLeft, Share2, Calendar, Store, AlertCircle } from 'lucide-react';
import { CampaignStatus } from '../types';

const CampaignView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns, promotions, businesses } = useStore();

  const campaign = campaigns.find(c => c.id === id);
  const business = campaign ? businesses.find(b => b.id === campaign.business_id) : null;
  const campaignPromotions = promotions.filter(p => p.campaign_id === id);

  if (!campaign || !business) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <AlertCircle size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Campanha não encontrada</h2>
        <p className="text-gray-500 mb-6">O link pode estar expirado ou incorreto.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Ver outras ofertas
        </button>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: `Confira as ofertas de ${business.name}: ${campaign.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <button 
              onClick={() => navigate('/')}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            >
              <Share2 size={20} />
            </button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4 border border-white/10">
              <Store size={14} /> {business.name}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">{campaign.title}</h1>
            <div className="flex items-center justify-center gap-2 text-primary-100 text-sm">
              <Calendar size={14} />
              Válido até {new Date(campaign.end_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        {campaignPromotions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaignPromotions.map(promo => (
              <PromoCard 
                key={promo.id} 
                promotion={promo} 
                business={business}
                onClick={() => navigate(`/promo/${promo.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">Nenhum produto cadastrado nesta campanha ainda.</p>
          </div>
        )}
      </div>

      <div className="text-center mt-12 text-gray-400 text-sm">
        <p>Ofertas sujeitas a disponibilidade de estoque.</p>
      </div>
    </div>
  );
};

export default CampaignView;
