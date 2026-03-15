'use client';

import { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Store } from '@/data/stores';
import { Navigation, MapPin, TrendingDown } from 'lucide-react';
import { FilterCategory } from './FilterBar';

interface PromoMapProps {
  stores: Store[];
  activeFilters: FilterCategory[];
  onStoreClick?: (store: Store) => void;
}

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 13.7462, lng: 100.5347 };

const brandColors: Record<Store['brand'], string> = {
  '7-Eleven': '#00843D',
  'Lotus': '#E40428',
  'Big C': '#0066CC',
  'Makro': '#FFB81C',
};

function makeMarkerSvg(color: string, label: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <path d="M18 0C8 0 0 8 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8 28 0 18 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="18" y="23" text-anchor="middle" fill="white" font-size="13" font-weight="bold" font-family="Arial,sans-serif">${label}</text>
  </svg>`;
}

const userDot = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/></svg>`
)}`;

export default function PromoMap({ stores, activeFilters, onStoreClick }: PromoMapProps) {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [infoStore, setInfoStore] = useState<Store | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setUserLocation(defaultCenter)
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  const onLoad = useCallback((m: google.maps.Map) => setMap(m), []);

  const filteredStores = activeFilters.includes('all')
    ? stores
    : stores.filter((s) =>
        activeFilters.some((f) => f === s.brand || f === s.category)
      );

  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-red-600 font-medium">Error loading Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-red-600 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-900 font-bold">Loading Map…</p>
        </div>
      </div>
    );
  }

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    ],
  };

  const storeIcon = (brand: Store['brand']) => ({
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      makeMarkerSvg(brandColors[brand], brand === '7-Eleven' ? '7' : brand.charAt(0))
    )}`,
    scaledSize: new google.maps.Size(36, 44),
    anchor: new google.maps.Point(18, 44),
  });

  const userIcon = {
    url: userDot,
    scaledSize: new google.maps.Size(24, 24),
    anchor: new google.maps.Point(12, 12),
  };

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || defaultCenter}
        zoom={14}
        options={mapOptions}
        onLoad={onLoad}
        onClick={() => setInfoStore(null)}
      >
        {/* User location */}
        {userLocation && (
          <MarkerF position={userLocation} icon={userIcon} title="You are here" />
        )}

        {/* Store markers */}
        {filteredStores.map((store) => (
          <MarkerF
            key={store.id}
            position={{ lat: store.lat, lng: store.lng }}
            icon={storeIcon(store.brand)}
            onClick={() => {
              setInfoStore(store);
              onStoreClick?.(store);
            }}
          />
        ))}

        {/* InfoWindow */}
        {infoStore && (
          <InfoWindowF
            position={{ lat: infoStore.lat, lng: infoStore.lng }}
            onCloseClick={() => setInfoStore(null)}
            options={{ pixelOffset: new google.maps.Size(0, -40) }}
          >
            <div className="p-2 min-w-[220px] max-w-[280px]">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: brandColors[infoStore.brand] }}
                >
                  {infoStore.brand === '7-Eleven' ? '7' : infoStore.brand.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{infoStore.name}</h3>
                  <p className="text-xs text-gray-500">{infoStore.address}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3 mb-2 p-2 bg-gray-50 rounded-lg text-xs">
                <div>
                  <span className="text-gray-500">Distance</span>
                  <p className="font-bold text-gray-900">{infoStore.distance} km</p>
                </div>
                <div>
                  <span className="text-gray-500">Deals</span>
                  <p className="font-bold text-red-600">{infoStore.activePromos}</p>
                </div>
              </div>

              {/* Best Deal */}
              {infoStore.bestDeal && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-2">
                  <div className="flex items-center gap-1 mb-0.5">
                    <TrendingDown className="w-3 h-3 text-red-600" />
                    <span className="text-[10px] font-bold text-red-600">BEST DEAL</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{infoStore.bestDeal.title}</p>
                  <p className="text-[10px] text-gray-600">Save {infoStore.bestDeal.discount}%</p>
                </div>
              )}

              {/* Directions */}
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${infoStore.lat},${infoStore.lng}`,
                    '_blank',
                    'noopener'
                  )
                }
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <Navigation className="w-3 h-3" />
                Get Directions
              </button>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Recenter button */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-6 right-4 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
        title="Recenter"
      >
        <Navigation className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}
