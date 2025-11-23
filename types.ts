
export enum UserRole {
  USER = 'user',
  BUSINESS = 'business',
  ADMIN = 'admin'
}

export enum PromotionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  SOLD_OUT = 'sold_out'
}

export enum PlanType {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended'
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface Business {
  id: string;
  name: string;
  category: string; // slug referecing Category
  description?: string;
  address: string;
  city: string;
  state: string;
  logo_url: string;
  cover_photo_url?: string;
  rating: number;
  total_reviews: number;
  whatsapp: string;
  phone?: string;
  verified: boolean;
  plan_type: PlanType;
  
  // Geolocation
  lat?: number;
  lng?: number;
  
  // Frontend only properties (calculated)
  distance?: number; 
}

export interface Campaign {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  created_at: string;
}

export interface Promotion {
  id: string;
  business_id: string;
  campaign_id?: string; // Link to Campaign
  product_name: string;
  description?: string;
  category: string; // slug
  price_before: number;
  price_now: number;
  discount_percent: number;
  quantity: 'unlimited' | 'limited';
  stock_count?: number;
  valid_until: string; // ISO Date
  photo_url: string;
  qr_code: string;
  status: PromotionStatus;
  
  // Analytics
  views_count: number;
  saves_count: number;
  qr_scans: number;
  whatsapp_clicks?: number;
  
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  business_id: string;
  promotion_id?: string;
  title: string;
  body: string;
  sent_at: string;
  read: boolean;
  relevance_score?: number; // Debug/Admin info
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  push_enabled?: boolean;
  
  // User preferences
  notification_radius?: number;
  interests?: string[];
  saved_promotions?: string[];
}

export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  user_name: string; // Joined data
  user_avatar?: string; // Joined data
  rating: number;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
  business_reply?: string;
}