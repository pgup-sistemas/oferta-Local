
import { Category, Business, Promotion, PromotionStatus, UserRole, User, PlanType, Notification, Campaign, CampaignStatus, Review } from '../types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Hortifruti', slug: 'hortifruti', icon: '🥬', color: '#4CAF50' },
  { id: '2', name: 'Açougue', slug: 'acougue', icon: '🥩', color: '#F44336' },
  { id: '3', name: 'Padaria', slug: 'padaria', icon: '🥖', color: '#FF9800' },
  { id: '4', name: 'Bebidas', slug: 'bebidas', icon: '🍺', color: '#FF5722' },
  { id: '5', name: 'Farmácia', slug: 'farmacia', icon: '💊', color: '#9C27B0' },
  { id: '6', name: 'Limpeza', slug: 'limpeza', icon: '🧹', color: '#00BCD4' },
];

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'b1',
    name: 'Mercado São João',
    category: 'hortifruti',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    logo_url: 'https://picsum.photos/seed/b1/100/100',
    rating: 4.8,
    total_reviews: 234,
    whatsapp: '5511999999999',
    verified: true,
    plan_type: PlanType.BASIC,
    lat: -23.550520, // Centro SP
    lng: -46.633308
  },
  {
    id: 'b2',
    name: 'Açougue Silva',
    category: 'acougue',
    address: 'Av. Principal, 500',
    city: 'São Paulo',
    state: 'SP',
    logo_url: 'https://picsum.photos/seed/b2/100/100',
    rating: 4.6,
    total_reviews: 89,
    whatsapp: '5511988888888',
    verified: true,
    plan_type: PlanType.FREE,
    lat: -23.561414, // Paulista
    lng: -46.656496
  },
  {
    id: 'b3',
    name: 'Padaria Delícia',
    category: 'padaria',
    address: 'Rua do Pão, 44',
    city: 'São Paulo',
    state: 'SP',
    logo_url: 'https://picsum.photos/seed/b3/100/100',
    rating: 4.9,
    total_reviews: 412,
    whatsapp: '5511977777777',
    verified: true,
    plan_type: PlanType.PRO,
    lat: -23.598746, // Vila Mariana
    lng: -46.636635
  },
  {
    id: 'b4',
    name: 'Farmácia Saúde',
    category: 'farmacia',
    address: 'Av. Jabaquara, 1200',
    city: 'São Paulo',
    state: 'SP',
    logo_url: 'https://picsum.photos/seed/b4/100/100',
    rating: 4.2,
    total_reviews: 45,
    whatsapp: '5511966666666',
    verified: false,
    plan_type: PlanType.FREE,
    lat: -23.618746,
    lng: -46.646635
  }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    business_id: 'b1',
    title: 'Ofertas da Semana',
    status: CampaignStatus.ACTIVE,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'c2',
    business_id: 'b1',
    title: 'Churrasco de Domingo',
    status: CampaignStatus.DRAFT,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'p1',
    business_id: 'b1',
    campaign_id: 'c1',
    product_name: 'Tomate Holandês',
    description: 'Tomate fresco, ideal para saladas e molhos. Promoção válida enquanto durar o estoque.',
    category: 'hortifruti',
    price_before: 5.99,
    price_now: 2.99,
    discount_percent: 50,
    quantity: 'limited',
    stock_count: 50,
    valid_until: new Date(Date.now() + 86400000).toISOString(), // +1 day
    photo_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    qr_code: 'PROMO-A1B2C3',
    status: PromotionStatus.ACTIVE,
    views_count: 234,
    saves_count: 45,
    qr_scans: 12
  },
  {
    id: 'p2',
    business_id: 'b2',
    product_name: 'Frango Inteiro',
    description: 'Frango resfriado de alta qualidade.',
    category: 'acougue',
    price_before: 12.99,
    price_now: 8.99,
    discount_percent: 31,
    quantity: 'limited',
    stock_count: 15,
    valid_until: new Date(Date.now() + 172800000).toISOString(), // +2 days
    photo_url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80',
    qr_code: 'PROMO-X1Y2Z3',
    status: PromotionStatus.ACTIVE,
    views_count: 189,
    saves_count: 30,
    qr_scans: 34
  },
  {
    id: 'p3',
    business_id: 'b3',
    product_name: 'Pão Francês (kg)',
    description: 'Saindo agora do forno!',
    category: 'padaria',
    price_before: 18.90,
    price_now: 12.90,
    discount_percent: 32,
    quantity: 'limited',
    stock_count: 100,
    valid_until: new Date(Date.now() + 43200000).toISOString(), // +12 hours
    photo_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=400&q=80',
    qr_code: 'PROMO-BREAD1',
    status: PromotionStatus.ACTIVE,
    views_count: 156,
    saves_count: 28,
    qr_scans: 56
  },
  {
    id: 'p4',
    business_id: 'b1',
    product_name: 'Alface Americana',
    description: 'Fresca e crocante, direto do produtor.',
    category: 'hortifruti',
    price_before: 3.50,
    price_now: 1.99,
    discount_percent: 43,
    quantity: 'unlimited',
    valid_until: new Date(Date.now() + 86400000).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80',
    qr_code: 'PROMO-LETTUCE',
    status: PromotionStatus.ACTIVE,
    views_count: 89,
    saves_count: 12,
    qr_scans: 5
  },
  {
    id: 'p5',
    business_id: 'b2',
    product_name: 'Picanha Nacional (kg)',
    description: 'Corte especial para churrasco.',
    category: 'acougue',
    price_before: 69.90,
    price_now: 49.90,
    discount_percent: 29,
    quantity: 'limited',
    stock_count: 20,
    valid_until: new Date(Date.now() + 172800000).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1602407294553-6ac9170b3ed0?auto=format&fit=crop&w=400&q=80',
    qr_code: 'PROMO-MEAT2',
    status: PromotionStatus.ACTIVE,
    views_count: 450,
    saves_count: 120,
    qr_scans: 45
  },
  {
    id: 'p6',
    business_id: 'b1',
    product_name: 'Cerveja Pilsen 350ml',
    description: 'Pack com 12 unidades.',
    category: 'bebidas',
    price_before: 42.00,
    price_now: 29.90,
    discount_percent: 29,
    quantity: 'limited',
    stock_count: 30,
    valid_until: new Date(Date.now() + 86400000 * 3).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1608270586620-248524639118?auto=format&fit=crop&w=400&q=80',
    qr_code: 'PROMO-BEER',
    status: PromotionStatus.ACTIVE,
    views_count: 320,
    saves_count: 80,
    qr_scans: 60
  },
  {
    id: 'p7',
    business_id: 'b3',
    product_name: 'Bolo de Chocolate',
    description: 'Recheio de brigadeiro.',
    category: 'padaria',
    price_before: 25.00,
    price_now: 18.00,
    discount_percent: 28,
    quantity: 'limited',
    stock_count: 5,
    valid_until: new Date(Date.now() + 43200000).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
    qr_code: 'PROMO-CAKE',
    status: PromotionStatus.ACTIVE,
    views_count: 90,
    saves_count: 15,
    qr_scans: 10
  },
  {
    id: 'p8',
    business_id: 'b1',
    product_name: 'Detergente Líquido',
    description: '500ml - Várias fragrâncias.',
    category: 'limpeza',
    price_before: 2.50,
    price_now: 1.79,
    discount_percent: 28,
    quantity: 'unlimited',
    valid_until: new Date(Date.now() + 86400000 * 5).toISOString(),
    photo_url: 'https://images.unsplash.com/photo-1585842378081-5c525e56f38e?auto=format&fit=crop&w=400&q=80',
    qr_code: 'PROMO-CLEAN',
    status: PromotionStatus.ACTIVE,
    views_count: 45,
    saves_count: 2,
    qr_scans: 8
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    business_id: 'b1',
    user_id: 'u3',
    user_name: 'Carlos Pereira',
    user_avatar: 'https://ui-avatars.com/api/?name=Carlos+Pereira&background=random',
    rating: 5,
    comment: 'Atendimento excelente e produtos muito frescos!',
    verified_purchase: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'r2',
    business_id: 'b1',
    user_id: 'u4',
    user_name: 'Ana Souza',
    user_avatar: 'https://ui-avatars.com/api/?name=Ana+Souza&background=random',
    rating: 4,
    comment: 'Gostei bastante, mas a fila estava grande.',
    verified_purchase: true,
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'r3',
    business_id: 'b2',
    user_id: 'u5',
    user_name: 'Roberto Lima',
    rating: 2,
    comment: 'A carne não estava tão boa quanto na semana passada.',
    verified_purchase: true,
    created_at: new Date(Date.now() - 250000000).toISOString()
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    user_id: 'u1',
    business_id: 'b1',
    promotion_id: 'p1',
    title: '🔥 Mercado São João',
    body: 'Tomate Holandês - R$ 2,99 (50% OFF)',
    sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: false,
    relevance_score: 95
  },
  {
    id: 'n2',
    user_id: 'u1',
    business_id: 'b3',
    promotion_id: 'p3',
    title: '🥖 Pão Quentinho!',
    body: 'Pão Francês saindo do forno agora na Padaria Delícia.',
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    read: true,
    relevance_score: 88
  },
  {
    id: 'n3',
    user_id: 'u1',
    business_id: 'b2',
    title: 'Bem-vindo!',
    body: 'Configure suas preferências para receber as melhores ofertas.',
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    read: true,
    relevance_score: 100
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Maria Silva',
  email: 'maria@example.com',
  role: UserRole.USER,
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  saved_promotions: ['p1']
};

export const MOCK_MERCHANT_USER: User = {
  id: 'u2',
  name: 'João do Mercado',
  email: 'joao@mercadosaojoao.com',
  role: UserRole.BUSINESS,
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
  saved_promotions: []
};

export const MOCK_ADMIN_USER: User = {
  id: 'admin1',
  name: 'Super Admin',
  email: 'admin@ofertalocal.com',
  role: UserRole.ADMIN,
  avatar_url: 'https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff',
  saved_promotions: []
};
