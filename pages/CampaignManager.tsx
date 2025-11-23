
import React, { useState } from 'react';
import { 
  Megaphone, Plus, Copy, Share2, Play, Pause, 
  Calendar, Layers, Package, X, Search, CheckCircle, Edit2, Save
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { Campaign, CampaignStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const CampaignManager: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    campaigns, 
    promotions, 
    addCampaign, 
    updateCampaign,
    updateCampaignStatus, 
    duplicateCampaign, 
    setCampaignProducts 
  } = useStore();
  
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  // Form State
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });
  
  // Product Selection State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const myCampaigns = campaigns.filter(c => c.business_id === (user?.id || 'b1'));
  const myPromotions = promotions.filter(p => p.business_id === (user?.id || 'b1'));

  const openCreateModal = () => {
    setEditingCampaign(null);
    setFormData({
      title: '',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16)
    });
    setShowModal(true);
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      startDate: new Date(campaign.start_date).toISOString().slice(0, 16),
      endDate: new Date(campaign.end_date).toISOString().slice(0, 16)
    });
    setShowModal(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCampaign) {
      // Update existing
      updateCampaign({
        ...editingCampaign,
        title: formData.title,
        start_date: new Date(formData.startDate).toISOString(),
        end_date: new Date(formData.endDate).toISOString()
      });
    } else {
      // Create new
      const newCampaign: Campaign = {
        id: `camp-${Date.now()}`,
        business_id: user?.id || 'b1',
        title: formData.title,
        status: CampaignStatus.DRAFT,
        start_date: new Date(formData.startDate).toISOString(),
        end_date: new Date(formData.endDate).toISOString(),
        created_at: new Date().toISOString()
      };
      addCampaign(newCampaign);
    }
    
    setShowModal(false);
  };

  const handleShare = (campaignId: string) => {
    const url = `${window.location.origin}/#/c/${campaignId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Confira nossas ofertas!',
        text: 'Veja nosso folheto digital com as melhores promoções da semana.',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link do folheto copiado!');
    }
  };

  const openProductModal = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    // Pre-select products already in this campaign
    const productsInCampaign = myPromotions
      .filter(p => p.campaign_id === campaignId)
      .map(p => p.id);
    setSelectedProductIds(productsInCampaign);
    setShowProductModal(true);
  };

  const saveProductSelection = () => {
    if (selectedCampaignId) {
      setCampaignProducts(selectedCampaignId, selectedProductIds);
      setShowProductModal(false);
      setSelectedCampaignId(null);
    }
  };

  const toggleProductSelection = (promoId: string) => {
    if (selectedProductIds.includes(promoId)) {
      setSelectedProductIds(prev => prev.filter(id => id !== promoId));
    } else {
      setSelectedProductIds(prev => [...prev, promoId]);
    }
  };

  const filteredPromotions = myPromotions.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="text-primary-600" /> Campanhas
          </h1>
          <p className="text-gray-500 text-sm">Crie folhetos digitais e agrupe suas ofertas.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 shadow-sm"
        >
          <Plus size={18} /> Nova Campanha
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myCampaigns.length > 0 ? (
          myCampaigns.map(campaign => {
            const itemCount = promotions.filter(p => p.campaign_id === campaign.id).length;
            
            return (
              <div key={campaign.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{campaign.title}</h3>
                      <button 
                        onClick={() => openEditModal(campaign)}
                        className="p-1 text-gray-400 hover:text-primary-600 rounded-full transition-colors"
                        title="Editar Título/Datas"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                        campaign.status === CampaignStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                        campaign.status === CampaignStatus.DRAFT ? 'bg-gray-100 text-gray-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {campaign.status === CampaignStatus.DRAFT ? 'Rascunho' : 
                         campaign.status === CampaignStatus.ACTIVE ? 'Ativa' : 'Pausada'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> 
                        {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => duplicateCampaign(campaign.id)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={() => handleShare(campaign.id)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Compartilhar Link"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Layers size={16} className="text-primary-500" />
                    <span className="font-bold">{itemCount}</span> produtos
                  </div>

                  <div className="flex gap-2">
                    {/* Manage Products Button */}
                    <button 
                      onClick={() => openProductModal(campaign.id)}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 flex items-center gap-1.5"
                    >
                      <Package size={14} /> Produtos
                    </button>

                    {/* Status Toggle */}
                    {campaign.status === CampaignStatus.ACTIVE ? (
                      <button 
                        onClick={() => updateCampaignStatus(campaign.id, CampaignStatus.PAUSED)}
                        className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-100 flex items-center gap-1.5"
                      >
                        <Pause size={14} /> Pausar
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateCampaignStatus(campaign.id, CampaignStatus.ACTIVE)}
                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 flex items-center gap-1.5"
                      >
                        <Play size={14} /> Ativar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <Megaphone size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900">Nenhuma campanha criada</h3>
            <p className="text-gray-500 text-sm mb-4">Crie folhetos digitais para divulgar no WhatsApp.</p>
            <button 
              onClick={openCreateModal}
              className="text-primary-600 font-bold text-sm hover:underline"
            >
              Criar minha primeira campanha
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
            </h2>
            <form onSubmit={handleSaveCampaign}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da Campanha</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Ofertas de Fim de Semana"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Início</label>
                    <input 
                      type="datetime-local" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fim</label>
                    <input 
                      type="datetime-local" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  {editingCampaign ? <><Save size={16} /> Salvar</> : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gerenciar Produtos</h2>
                <p className="text-xs text-gray-500">Selecione os produtos para esta campanha</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 pb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar no estoque..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredPromotions.length > 0 ? (
                <div className="space-y-1">
                  {filteredPromotions.map(promo => {
                    const isSelected = selectedProductIds.includes(promo.id);
                    return (
                      <div 
                        key={promo.id}
                        onClick={() => toggleProductSelection(promo.id)}
                        className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors border ${
                          isSelected 
                            ? 'bg-primary-50 border-primary-200' 
                            : 'bg-white border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'bg-primary-500 border-primary-500' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle size={14} className="text-white" />}
                        </div>
                        
                        <img src={promo.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                            {promo.product_name}
                          </p>
                          <p className="text-xs text-gray-500">R$ {promo.price_now.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Nenhum produto encontrado.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">
                {selectedProductIds.length} selecionados
              </span>
              <button 
                onClick={saveProductSelection}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-primary-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CampaignManager;
