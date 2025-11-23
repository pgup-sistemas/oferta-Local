import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Business, Promotion } from '../types';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix default icons for Leaflet in React
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

fixLeafletIcons();

// Component to update map center when location changes
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface LocationMapProps {
  userLocation: { lat: number; lng: number } | null;
  businesses: Business[];
  promotions?: Promotion[];
}

const LocationMap: React.FC<LocationMapProps> = ({ userLocation, businesses, promotions }) => {
  const navigate = useNavigate();
  
  // Default center (São Paulo) if user location is not available
  const defaultCenter: [number, number] = [-23.550520, -46.633308];
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter;

  // Create a custom icon for the user
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Create a custom icon for businesses
  const businessIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController center={center} />

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-gray-900">Você está aqui</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Business Markers */}
      {businesses.map(business => {
        if (!business.lat || !business.lng) return null;
        
        // Find active promotions for this business
        const activePromoCount = promotions 
          ? promotions.filter(p => p.business_id === business.id).length
          : 0;

        return (
          <Marker 
            key={business.id} 
            position={[business.lat, business.lng]}
            icon={businessIcon}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{business.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{business.address}</p>
                
                {activePromoCount > 0 ? (
                  <div className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md inline-block mb-2">
                    {activePromoCount} ofertas ativas
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 mb-2">Sem ofertas no momento</div>
                )}

                <button 
                  onClick={() => navigate('/')} // Ideally navigate to merchant profile
                  className="w-full bg-gray-900 text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 font-bold"
                >
                  Ver Detalhes <ArrowRight size={10} />
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LocationMap;