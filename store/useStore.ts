
import { create } from 'zustand';
import { Promotion, Notification, Business, PromotionStatus, Campaign, CampaignStatus, Review } from '../types';
import { MOCK_PROMOTIONS, MOCK_NOTIFICATIONS, MOCK_BUSINESSES, MOCK_CAMPAIGNS, MOCK_REVIEWS } from '../services/mockData';

interface AppState {
  // Data
  promotions: Promotion[];
  campaigns: Campaign[];
  businesses: Business[];
  favorites: string[]; 
  notifications: Notification[];
  reviews: Review[]; // New State
  
  // Actions
  setPromotions: (promotions: Promotion[]) => void;
  addPromotion: (promotion: Promotion) => void;
  bulkCreatePromotions: (newPromotions: Promotion[]) => void;
  addBusiness: (business: Business) => void;
  verifyBusiness: (businessId: string) => void; // Admin Action
  deleteBusiness: (businessId: string) => void; // Admin Action
  toggleFavorite: (promotionId: string) => void;
  isFavorite: (promotionId: string) => boolean;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: (userId: string) => void;
  
  // Inventory Management
  updateStock: (promotionId: string, newQuantity: number) => void;
  updatePromotionStatus: (promotionId: string, status: PromotionStatus) => void;
  
  // Campaign Management
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (campaign: Campaign) => void;
  updateCampaignStatus: (campaignId: string, status: CampaignStatus) => void;
  duplicateCampaign: (campaignId: string) => void;
  setCampaignProducts: (campaignId: string, promotionIds: string[]) => void;
  
  // Business Logic
  registerScan: (qrCode: string) => { success: boolean; message: string; promotion?: Promotion };
}

// Mock initial persistence
const initialFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');

export const useStore = create<AppState>((set, get) => ({
  promotions: MOCK_PROMOTIONS,
  campaigns: MOCK_CAMPAIGNS || [],
  businesses: MOCK_BUSINESSES,
  favorites: initialFavorites,
  notifications: MOCK_NOTIFICATIONS,
  reviews: MOCK_REVIEWS || [],

  setPromotions: (promotions) => set({ promotions }),
  
  addPromotion: (promotion) => set((state) => ({ 
    promotions: [promotion, ...state.promotions] 
  })),

  bulkCreatePromotions: (newPromotions) => set((state) => ({
    promotions: [...newPromotions, ...state.promotions]
  })),

  addBusiness: (business) => set((state) => ({
    businesses: [...state.businesses, business]
  })),

  verifyBusiness: (businessId) => set((state) => ({
    businesses: state.businesses.map(b => 
      b.id === businessId ? { ...b, verified: true } : b
    )
  })),

  deleteBusiness: (businessId) => set((state) => ({
    businesses: state.businesses.filter(b => b.id !== businessId)
  })),

  toggleFavorite: (promotionId) => set((state) => {
    const isFav = state.favorites.includes(promotionId);
    const newFavorites = isFav 
      ? state.favorites.filter(id => id !== promotionId)
      : [...state.favorites, promotionId];
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    return { favorites: newFavorites };
  }),

  isFavorite: (promotionId) => get().favorites.includes(promotionId),

  markNotificationAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
  })),

  clearNotifications: (userId) => set((state) => ({
    notifications: state.notifications.filter(n => n.user_id !== userId)
  })),

  updateStock: (promotionId, newQuantity) => set((state) => ({
    promotions: state.promotions.map(p => {
      if (p.id !== promotionId) return p;
      
      const updatedP = { ...p, stock_count: Math.max(0, newQuantity) };
      
      if (updatedP.quantity === 'limited') {
        if (updatedP.stock_count === 0) {
          updatedP.status = PromotionStatus.SOLD_OUT;
        } else if (updatedP.stock_count > 0 && updatedP.status === PromotionStatus.SOLD_OUT) {
          updatedP.status = PromotionStatus.ACTIVE;
        }
      }
      return updatedP;
    })
  })),

  updatePromotionStatus: (promotionId, status) => set((state) => ({
    promotions: state.promotions.map(p => 
      p.id === promotionId ? { ...p, status } : p
    )
  })),

  // --- Campaign Actions ---

  addCampaign: (campaign) => set((state) => ({
    campaigns: [campaign, ...state.campaigns]
  })),

  updateCampaign: (updatedCampaign) => set((state) => ({
    campaigns: state.campaigns.map(c => 
      c.id === updatedCampaign.id ? updatedCampaign : c
    )
  })),

  updateCampaignStatus: (campaignId, status) => set((state) => ({
    campaigns: state.campaigns.map(c => 
      c.id === campaignId ? { ...c, status } : c
    )
  })),

  duplicateCampaign: (campaignId) => set((state) => {
    const original = state.campaigns.find(c => c.id === campaignId);
    if (!original) return { campaigns: state.campaigns };

    const newCampaignId = `camp-${Date.now()}`;
    const newCampaign: Campaign = {
      ...original,
      id: newCampaignId,
      title: `${original.title} (Cópia)`,
      status: CampaignStatus.DRAFT,
      created_at: new Date().toISOString()
    };

    return {
      campaigns: [newCampaign, ...state.campaigns]
    };
  }),

  // Critical: This action links products to a campaign. 
  // It handles both adding new ones and removing ones that were unselected.
  setCampaignProducts: (campaignId, promotionIds) => set((state) => ({
    promotions: state.promotions.map(p => {
      // If the product is in the new list, link it to this campaign
      if (promotionIds.includes(p.id)) {
        return { ...p, campaign_id: campaignId };
      }
      // If the product WAS in this campaign but IS NOT in the new list, unlink it
      if (p.campaign_id === campaignId && !promotionIds.includes(p.id)) {
        return { ...p, campaign_id: undefined };
      }
      // Otherwise, leave it alone (it might belong to another campaign or none)
      return p;
    })
  })),

  registerScan: (qrCode) => {
    const state = get();
    const promoIndex = state.promotions.findIndex(p => p.qr_code === qrCode);
    
    if (promoIndex === -1) {
      return { success: false, message: 'Código inválido ou oferta não encontrada.' };
    }

    const promo = state.promotions[promoIndex];
    const now = new Date();
    const validUntil = new Date(promo.valid_until);

    if (now > validUntil) {
      return { success: false, message: `Oferta expirada em ${validUntil.toLocaleDateString()}` };
    }

    if (promo.quantity === 'limited') {
      if (promo.stock_count === undefined || promo.stock_count <= 0) {
        return { success: false, message: 'Estoque esgotado para esta oferta.' };
      }
    }

    const updatedPromotions = [...state.promotions];
    const updatedPromo = { ...promo };
    
    updatedPromo.qr_scans = (updatedPromo.qr_scans || 0) + 1;
    
    if (updatedPromo.quantity === 'limited' && updatedPromo.stock_count !== undefined) {
      updatedPromo.stock_count = Math.max(0, updatedPromo.stock_count - 1);
      if (updatedPromo.stock_count === 0) {
        updatedPromo.status = PromotionStatus.SOLD_OUT;
      }
    }

    updatedPromotions[promoIndex] = updatedPromo;

    set({ promotions: updatedPromotions });

    let successMessage = 'Oferta validada com sucesso!';
    if (updatedPromo.status === PromotionStatus.SOLD_OUT) {
      successMessage = 'Validado! Atenção: Estoque acabou.';
    }

    return { 
      success: true, 
      message: successMessage,
      promotion: updatedPromo
    };
  }
}));
