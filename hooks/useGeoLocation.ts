
import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  lat: number;
  lng: number;
}

export const useGeoLocation = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador.');
      setLoading(false);
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLoading(false);
      setError(null);
    };

    const errorHandler = (err: GeolocationPositionError) => {
      // 1: PERMISSION_DENIED, 2: POSITION_UNAVAILABLE, 3: TIMEOUT
      if (err.code === 1) {
        setError('Permissão negada. Verifique as configurações do navegador.');
      } else if (err.code === 2) {
        setError('Sinal GPS indisponível.');
      } else if (err.code === 3) {
        setError('Tempo limite esgotado. Tente novamente.');
      } else {
        setError('Erro desconhecido ao obter localização.');
      }
      setLoading(false);
    };

    // First try with high accuracy
    navigator.geolocation.getCurrentPosition(
      successHandler,
      (err) => {
        // If high accuracy fails (timeout or unavailable), try low accuracy
        if (err.code === 3 || err.code === 2) {
          console.log('High accuracy failed, trying low accuracy...');
          navigator.geolocation.getCurrentPosition(
            successHandler,
            errorHandler,
            {
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 30000 // Accept positions up to 30s old
            }
          );
        } else {
          errorHandler(err);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 15s timeout
        maximumAge: 10000 
      }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { location, error, loading, retry: getLocation };
};
