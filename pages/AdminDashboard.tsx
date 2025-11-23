
import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Users, Store, Tag, DollarSign, Activity, 
  AlertTriangle, CheckCircle, XCircle, Star,
  TrendingUp, TrendingDown, MessageSquare
} from 'lucide-react';
import { PromotionStatus, PlanType } from '../types';

const AdminDashboard: React.FC = () => {
  const { businesses, promotions, reviews, verifyBusiness, deleteBusiness } = useStore();

  // --- METRICS CALCULATION ---
  const metrics = useMemo(() => {
    const activeBusinesses = businesses.filter(b => b.verified);
    const activePromotions = promotions.filter(p => p.status === PromotionStatus.ACTIVE);
    
    // MRR Calculation (Mock Pricing)
    const mrr = businesses.reduce((acc, b) => {
      if (b.plan_type === PlanType.BASIC) return acc + 49;
      if (b.plan_type === PlanType.PRO) return acc + 99;
      if (b.plan_type === PlanType.ENTERPRISE) return acc + 299;
      return acc;
    }, 0);

    const pendingReviews = reviews.filter(r => !r.business_reply).length; // Simulating "pending moderation/reply"

    return {
      totalBusinesses: businesses.length,
      activeBusinesses: activeBusinesses.length,
      totalUsers: 12456, // Mock total users
      totalPromotions: promotions.length,
      activePromotions: activePromotions.length,
      totalReviews: reviews.length,
      pendingReviews: pendingReviews,
      pendingReports: 3, // Mock
      mrr: mrr,
      churnRate: 2.3 // Mock %
    };
  }, [businesses, promotions, reviews]);

  // --- DERIVED LISTS ---
  const recentSignups = useMemo(() => {
    // Simulate sorting by creation date (assuming list is chronological or needs sorting if dates existed)
    return [...businesses].filter(b => !b.verified).slice(0, 5);
  }, [businesses]);

  const topBusinesses = useMemo(() => {
    return [...businesses]
      .sort((a, b) => b.total_reviews - a.total_reviews)
      .slice(0, 5);
  }, [businesses]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Visão geral da plataforma Oferta Local.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Sistema Operacional
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Businesses */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Comércios</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalBusinesses}</h3>
              <p className="text-green-600 text-xs flex items-center gap-1 mt-1 font-medium">
                <CheckCircle size={12} /> {metrics.activeBusinesses} ativos
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Store size={20} />
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Usuários</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalUsers.toLocaleString()}</h3>
              <p className="text-green-600 text-xs flex items-center gap-1 mt-1 font-medium">
                <TrendingUp size={12} /> +12% este mês
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Receita (MRR)</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">R$ {metrics.mrr.toLocaleString()}</h3>
              <p className="text-gray-400 text-xs mt-1 font-medium">
                Churn: {metrics.churnRate}%
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ofertas Ativas</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.activePromotions}</h3>
              <div className="flex gap-2 mt-1">
                <span className="text-gray-400 text-xs">{metrics.totalPromotions} total</span>
              </div>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Tag size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- PENDING VERIFICATIONS --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" /> Comerciantes Pendentes
            </h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
              {recentSignups.length} novos
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-semibold">Negócio</th>
                  <th className="px-6 py-3 font-semibold">Plano</th>
                  <th className="px-6 py-3 font-semibold">Contato</th>
                  <th className="px-6 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSignups.length > 0 ? (
                  recentSignups.map(business => (
                    <tr key={business.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={business.logo_url} alt="" className="w-10 h-10 rounded-lg bg-gray-200 object-cover" />
                          <div>
                            <p className="font-bold text-gray-900">{business.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{business.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          business.plan_type === PlanType.PRO ? 'bg-purple-100 text-purple-700' :
                          business.plan_type === PlanType.BASIC ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {business.plan_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {business.whatsapp}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => verifyBusiness(business.id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Aprovar"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => deleteBusiness(business.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Rejeitar/Excluir"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Nenhum comerciante aguardando aprovação.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- TOP BUSINESSES & ALERTS --- */}
        <div className="space-y-6">
          
          {/* Top Performers */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" /> Top Negócios
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {topBusinesses.map((biz, idx) => (
                <div key={biz.id} className="p-4 flex items-center gap-3">
                  <div className="font-bold text-gray-300 text-sm w-4">{idx + 1}</div>
                  <img src={biz.logo_url} alt="" className="w-8 h-8 rounded-full bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{biz.name}</p>
                    <p className="text-xs text-gray-500">{biz.total_reviews} reviews</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md">
                    {biz.rating} <Star size={10} fill="currentColor" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions / Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-blue-500" /> Ações Necessárias
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className="text-red-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{metrics.pendingReports} Denúncias</p>
                    <p className="text-xs text-gray-500">Conteúdo reportado por usuários</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-red-600 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50">
                  Resolver
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-orange-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{metrics.pendingReviews}</p>
                    <p className="text-xs text-gray-500">Reviews sem resposta há +48h</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-orange-600 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50">
                  Ver Lista
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
