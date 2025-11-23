
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, QrCode, MousePointerClick, ArrowUpRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';

const MerchantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { promotions } = useStore();
  const { user } = useAuth();

  // Filter promotions for the current business (Assuming 'b1' for mock user)
  // In real app, filter by user.business_id
  const myPromos = useMemo(() => {
    return promotions.filter(p => p.business_id === 'b1' || p.business_id === user?.id);
  }, [promotions, user]);

  // Calculate Stats Dynamically
  const stats = useMemo(() => {
    return myPromos.reduce((acc, curr) => ({
      views: acc.views + curr.views_count,
      scans: acc.scans + curr.qr_scans,
      interactions: acc.interactions + (curr.saves_count + (curr.whatsapp_clicks || 0))
    }), { views: 0, scans: 0, interactions: 0 });
  }, [myPromos]);

  // Mock chart data for now, but could be derived from timestamps in a real scenario
  const chartData = [
    { name: 'Seg', views: Math.floor(stats.views * 0.1), sales: Math.floor(stats.scans * 0.1) },
    { name: 'Ter', views: Math.floor(stats.views * 0.15), sales: Math.floor(stats.scans * 0.15) },
    { name: 'Qua', views: Math.floor(stats.views * 0.2), sales: Math.floor(stats.scans * 0.2) },
    { name: 'Qui', views: Math.floor(stats.views * 0.1), sales: Math.floor(stats.scans * 0.1) },
    { name: 'Sex', views: Math.floor(stats.views * 0.25), sales: Math.floor(stats.scans * 0.25) },
    { name: 'Sáb', views: Math.floor(stats.views * 0.15), sales: Math.floor(stats.scans * 0.15) },
    { name: 'Dom', views: Math.floor(stats.views * 0.05), sales: Math.floor(stats.scans * 0.05) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Bem-vindo, {user?.name.split(' ')[0]}</p>
        </div>
        <button 
          onClick={() => navigate('/new-promo')}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={16} />
          Nova Oferta
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Eye size={20} />
            </div>
            <span className="text-green-500 text-xs font-bold flex items-center">
              Total <ArrowUpRight size={12} />
            </span>
          </div>
          <p className="text-gray-500 text-xs">Visualizações</p>
          <p className="text-2xl font-bold text-gray-900">{stats.views.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <MousePointerClick size={20} />
            </div>
            <span className="text-green-500 text-xs font-bold flex items-center">
              Total <ArrowUpRight size={12} />
            </span>
          </div>
          <p className="text-gray-500 text-xs">Saves & Clicks</p>
          <p className="text-2xl font-bold text-gray-900">{stats.interactions.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <QrCode size={20} />
            </div>
            <span className="text-green-500 text-xs font-bold flex items-center">
              Total <ArrowUpRight size={12} />
            </span>
          </div>
          <p className="text-gray-500 text-xs">Vendas Validadas</p>
          <p className="text-2xl font-bold text-gray-900">{stats.scans.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
        <h3 className="font-bold text-gray-900 mb-4">Estimativa Semanal</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
              cursor={{fill: '#f9fafb'}}
            />
            <Bar dataKey="views" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Views" />
            <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Vendas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Active Promos List */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Suas Ofertas ({myPromos.length})</h3>
        <div className="space-y-3">
          {myPromos.length > 0 ? (
            myPromos.map(promo => (
              <div key={promo.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <img src={promo.photo_url} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{promo.product_name}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="text-primary-600 font-medium flex items-center gap-1">
                      <QrCode size={14} /> {promo.qr_scans} vendas
                    </span>
                    <span>•</span>
                    <span>{promo.views_count} views</span>
                    {promo.quantity === 'limited' && (
                      <>
                        <span>•</span>
                        <span className={`${(promo.stock_count || 0) < 5 ? 'text-red-500 font-bold' : ''}`}>
                          Estoque: {promo.stock_count}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-gray-900">R$ {promo.price_now.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    new Date(promo.valid_until) < new Date() 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {new Date(promo.valid_until) < new Date() ? 'Expirada' : 'Ativa'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>Você ainda não criou nenhuma oferta.</p>
              <button 
                onClick={() => navigate('/new-promo')}
                className="mt-2 text-primary-600 font-bold hover:underline"
              >
                Criar a primeira
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
