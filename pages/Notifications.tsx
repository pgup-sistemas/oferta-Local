
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, Tag, Trash2, BarChart2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationAsRead, clearNotifications } = useStore();
  const { user } = useAuth();

  const myNotifications = notifications
    .filter(n => n.user_id === user?.id)
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    if (notification.promotion_id) {
      navigate(`/promo/${notification.promotion_id}`);
    }
  };

  const handleClearAll = () => {
    if (user && window.confirm('Tem certeza que deseja limpar todo o histórico?')) {
      clearNotifications(user.id);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="text-primary-500 fill-current" /> Notificações
            </h1>
            <p className="text-gray-500 text-sm">
              {myNotifications.length} alertas recebidos
            </p>
          </div>
        </div>
        
        {myNotifications.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Limpar histórico"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {myNotifications.length > 0 ? (
        <div className="space-y-4">
          {myNotifications.map(notification => (
            <div 
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`relative bg-white p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md cursor-pointer group ${
                !notification.read ? 'border-primary-200 bg-primary-50/30' : 'border-gray-100'
              }`}
            >
              {!notification.read && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse" />
              )}
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 transition-colors ${
                  notification.promotion_id 
                    ? 'bg-orange-100 text-orange-600 group-hover:bg-orange-200' 
                    : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                }`}>
                  {notification.promotion_id ? <Tag size={20} /> : <Bell size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm truncate pr-6 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <span 
                      className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1"
                      title={new Date(notification.sent_at).toLocaleString()}
                    >
                      <Clock size={10} />
                      {formatTimeAgo(notification.sent_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {notification.body}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
                    {/* Relevance Score Display */}
                    {notification.relevance_score !== undefined && (
                      <div className="flex items-center gap-1.5" title="Pontuação de relevância baseada nas suas preferências">
                        <BarChart2 size={12} className={notification.relevance_score > 80 ? 'text-green-500' : 'text-gray-400'} />
                        <div className="text-[10px] font-medium text-gray-500">
                          Score: <span className={notification.relevance_score > 80 ? 'text-green-600 font-bold' : ''}>{notification.relevance_score}</span>
                        </div>
                      </div>
                    )}
                    
                    {notification.promotion_id && (
                      <span className="text-xs font-bold text-primary-600 group-hover:translate-x-1 transition-transform ml-auto">
                        Ver Oferta →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Bell size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tudo limpo por aqui</h2>
          <p className="text-gray-500 max-w-xs">
            Você ainda não recebeu nenhuma notificação. Fique atento às ofertas na sua região!
          </p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 text-primary-600 font-bold hover:underline"
          >
            Explorar Ofertas
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
