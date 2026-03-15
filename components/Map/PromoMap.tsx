'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Store } from '@/data/stores';
import { Navigation, MapPin, TrendingDown, Store as StoreIcon } from 'lucide-react';
import { FilterCategory } from './FilterBar';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PromoMapProps {
  stores: Store[];
  activeFilter: FilterCategory;
  onStoreClick?: (store: Store) => void;
}

// Custom marker icons based on brand
const createCustomIcon = (brand: Store['brand']) => {
  const colors: Record<Store['brand'], string> = {
    '7-Eleven': '#00843D',
    'Lotus': '#E40428',
    'Big C': '#0066CC',
    'Makro': '#FFB81C'
  };

  const color = colors[brand];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 16px;
          text-align: center;
        ">
          ${brand === '7-Eleven' ? '7' : brand.charAt(0)}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// User location marker
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #3B82F6;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to recenter map
function RecenterButton({ center }: { center: [number, number] }) {
  const map = useMap();

  return (
    <button
      onClick={() => map.setView(center, 14)}
      className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
      title="Recenter map"
    >
      <Navigation className="w-5 h-5 text-gray-700" />
    </button>
  );
}

export default function PromoMap({ stores, activeFilter, onStoreClick }: PromoMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Default to Siam Paragon if location denied
          setUserLocation([13.7462, 100.5347]);
        }
      );
    } else {
      // Default to Siam Paragon
      setUserLocation([13.7462, 100.5347]);
    }
  }, []);

  // Filter stores based on activeFilter
  const filteredStores = activeFilter === 'all' 
    ? stores 
    : activeFilter === '7-Eleven' || activeFilter === 'Lotus'
    ? stores.filter(s => s.brand === activeFilter)
    : stores.filter(s => s.category === activeFilter);

  if (!userLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={userLocation}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        {/* High-quality tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* User location */}
        <Marker position={userLocation} icon={createUserIcon()}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-gray-900">Your Location</p>
            </div>
          </Popup>
        </Marker>

        {/* User location circle */}
        <Circle
          center={userLocation}
          radius={200}
          pathOptions={{
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            color: '#3B82F6',
            weight: 2,
            opacity: 0.4,
          }}
        />

        {/* Store markers */}
        {filteredStores.map((store) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={createCustomIcon(store.brand)}
            eventHandlers={{
              click: () => onStoreClick?.(store),
            }}
          >
            <Popup maxWidth={300}>
              <div className="p-2">
                {/* Store Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <StoreIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{store.name}</h3>
                    <p className="text-xs text-gray-600">{store.address}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Distance</p>
                    <p className="font-bold text-gray-900">{store.distance} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Active Deals</p>
                    <p className="font-bold text-red-600">{store.activePromos}</p>
                  </div>
                </div>

                {/* Best Deal */}
                {store.bestDeal && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold text-red-600">BEST DEAL</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{store.bestDeal.title}</p>
                    <p className="text-xs text-gray-600 mt-1">Save {store.bestDeal.discount}%</p>
                  </div>
                )}

                {/* Directions Button */}
                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`,
                      '_blank'
                    );
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Recenter button */}
        <RecenterButton center={userLocation} />
      </MapContainer>
    </div>
  );
}
