
import React, { useState, useRef } from 'react';
import { User, Mail, MapPin, Bell, LogOut, Settings, Save, Camera, ChevronRight, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../services/mockData';

const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for form values
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [radius, setRadius] = useState(user?.notification_radius || 2000);
  const [pushEnabled, setPushEnabled] = useState(user?.push_enabled ?? true);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);

  // Guard clause if user is not loaded yet
  if (!user) return null;

  const handleSave = () => {
    // Update global state via AuthContext
    updateProfile({
      name,
      email,
      notification_radius: radius,
      push_enabled: pushEnabled,
      avatar_url: avatarUrl,
      interests
    });
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local URL for preview purposes
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const toggleInterest = (slug: string) => {
    if (interests.includes(slug)) {
      setInterests(interests.filter(i => i !== slug));
    } else {
      setInterests([...interests, slug]);
    }
  };

  const triggerFileInput = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLogout = () => {
    logout(); // Limpa o estado de autenticação
    navigate('/login'); // Redireciona explicitamente para login
  };

  return (
    <div className="max-w-lg mx-auto pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4 group">
          <img 
            src={avatarUrl || "https://via.placeholder.com/100"} 
            alt={name} 
            className="w-full h-full rounded-full object-cover border-4 border-gray-50 shadow-sm bg-gray-100"
          />
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleImageChange}
            disabled={!isEditing}
          />
          
          {/* Camera Button */}
          <button 
            onClick={triggerFileInput}
            disabled={!isEditing}
            className={`absolute bottom-0 right-0 p-2 rounded-full shadow-md transition-colors ${
              isEditing 
                ? 'bg-primary-600 text-white hover:bg-primary-700 cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-default opacity-0'
            }`}
          >
            <Camera size={16} />
          </button>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900">{name}</h2>
        <div className="flex justify-center items-center gap-2 mt-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
            user.role === UserRole.BUSINESS 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {user.role === UserRole.BUSINESS ? 'Comerciante' : 'Consumidor'}
          </span>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Settings size={18} /> Configurações
          </h3>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
              isEditing 
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isEditing ? <><Save size={14} /> Salvar</> : 'Editar'}
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-2"></div>

          {/* Notifications & Preferences Section */}
          <div className="space-y-6">
            {/* Push Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${pushEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Bell size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Notificações Push</h4>
                  <p className="text-xs text-gray-500">Receber alertas de ofertas</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={pushEnabled}
                  onChange={(e) => isEditing && setPushEnabled(e.target.checked)}
                  disabled={!isEditing}
                  className="sr-only peer" 
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${pushEnabled ? 'peer-checked:bg-primary-600' : ''}`}></div>
              </label>
            </div>
            
            {/* Link to History */}
            <button 
              onClick={() => navigate('/notifications')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group border border-transparent hover:border-gray-200"
            >
              <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-lg shadow-sm text-primary-600">
                   <Bell size={18} />
                 </div>
                 <div className="text-left">
                   <span className="block text-sm font-bold text-gray-900 group-hover:text-primary-700 transition-colors">Histórico de Notificações</span>
                   <span className="text-xs text-gray-500">Ver alertas passados</span>
                 </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-primary-500" />
            </button>

            {/* Consumer Specific Preferences */}
            {user.role === UserRole.USER && (
              <>
                {/* Radius Slider */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin size={16} className="text-primary-500" /> Raio de Busca
                    </label>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100">
                      {(radius / 1000).toFixed(1)} km
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="10000" 
                    step="500"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    disabled={!isEditing}
                    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 ${!isEditing && 'cursor-default opacity-60'}`}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                    <span>0.5km</span>
                    <span>10km</span>
                  </div>
                </div>

                {/* Interests / Categories */}
                <div className="pt-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                    <Tag size={16} className="text-primary-500" /> Categorias de Interesse
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => {
                      const isSelected = interests.includes(cat.slug);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => isEditing && toggleInterest(cat.slug)}
                          disabled={!isEditing}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary-50 border-primary-200 text-primary-700'
                              : 'bg-white border-gray-200 text-gray-500'
                          } ${isEditing ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-70 cursor-default'}`}
                        >
                          <span>{cat.icon}</span>
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                  {isEditing && (
                    <p className="text-[10px] text-gray-400 mt-2">
                      Selecione as categorias para receber alertas personalizados.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full mt-6 flex items-center justify-center gap-2 text-red-600 bg-red-50 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors active:scale-[0.99]"
      >
        <LogOut size={20} />
        Sair da Conta
      </button>
      
      <div className="text-center mt-8 text-xs text-gray-400 font-medium">
        Oferta Local PWA • v1.2.0
      </div>
    </div>
  );
};

export default Profile;
