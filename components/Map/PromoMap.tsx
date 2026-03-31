'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Store } from '@/data/stores';
import { Navigation, MapPin, TrendingDown } from 'lucide-react';
import { FilterCategory } from './FilterBar';
import 'leaflet/dist/leaflet.css';

interface PromoMapProps {
  stores: Store[];
  activeFilters: FilterCategory[];
  onStoreClick?: (store: Store) => void;
}

const defaultCenter: [number, number] = [13.7462, 100.5347]; // Bangkok

const brandColors: Record<string, string> = {
  '7-Eleven': '#00843D',
  "Lotus's": '#E40428',
  'Big C': '#0066CC',
  'Makro': '#FFB81C',
  'Café Amazon': '#6B4226',
  'After You': '#E8739A',
  'Uniqlo': '#ED1C24',
};

function makeMarkerSvg(color: string, label: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <path d="M18 0C8 0 0 8 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8 28 0 18 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="18" y="23" text-anchor="middle" fill="white" font-size="13" font-weight="bold" font-family="Arial,sans-serif">${label}</text>
    </svg>`
  )}`;
}

function storeIcon(brand: string) {
  const color = brandColors[brand] || '#EF4444';
  const label = brand === '7-Eleven' ? '7' : brand.charAt(0);
  return L.icon({
    iconUrl: makeMarkerSvg(color, label),
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

const userIcon = L.icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/></svg>`
  )}`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Sub-component to invalidate map size after mount (fixes blank tiles)
function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    // Leaflet needs a size invalidation when rendered in dynamic containers
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Sub-component to recenter map
function RecenterButton({ position }: { position: [number, number] | null }) {
  const map = useMap();

  const handleRecenter = useCallback(() => {
    if (position) {
      map.setView(position, 14, { animate: true });
    }
  }, [map, position]);

  return (
    <button
      onClick={handleRecenter}
      className="absolute bottom-6 right-4 z-[1000] bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
      title="Recenter"
    >
      <Navigation className="w-5 h-5 text-gray-700" />
    </button>
  );
}

export default function PromoMap({ stores, activeFilters, onStoreClick }: PromoMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserLocation([p.coords.latitude, p.coords.longitude]),
        () => setUserLocation(defaultCenter)
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  // Fix Leaflet default icon issue in Next.js
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
    setMapReady(true);
  }, []);

  const filteredStores = activeFilters.includes('all')
    ? stores
    : stores.filter((s) =>
        activeFilters.some((f) => f === s.brand || f === s.category)
      );

  const center = userLocation || defaultCenter;

  if (!mapReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-900 font-bold">กำลังโหลดแผนที่…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fix: invalidate size after mount */}
        <InvalidateSize />

        {/* User location */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <span className="font-semibold text-sm">📍 ตำแหน่งของคุณ</span>
            </Popup>
          </Marker>
        )}

        {/* Store markers */}
        {filteredStores.map((store) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={storeIcon(store.brand)}
            eventHandlers={{
              click: () => onStoreClick?.(store),
            }}
          >
            <Popup maxWidth={280} minWidth={220}>
              <div className="p-1">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: brandColors[store.brand] || '#EF4444' }}
                  >
                    {store.brand === '7-Eleven' ? '7' : store.brand.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{store.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{store.address}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-3 mb-2 p-2 bg-gray-50 rounded-lg text-xs">
                  <div>
                    <span className="text-gray-500">ระยะทาง</span>
                    <p className="font-bold text-gray-900">{store.distance} km</p>
                  </div>
                  <div>
                    <span className="text-gray-500">โปรฯ</span>
                    <p className="font-bold text-orange-600">{store.activePromos}</p>
                  </div>
                </div>

                {/* Best Deal */}
                {store.bestDeal && (
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg mb-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <TrendingDown className="w-3 h-3 text-orange-600" />
                      <span className="text-[10px] font-bold text-orange-600">BEST DEAL</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{store.bestDeal.title}</p>
                    <p className="text-[10px] text-gray-600">ลด {store.bestDeal.discount}%</p>
                  </div>
                )}

                {/* Directions */}
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`,
                      '_blank',
                      'noopener'
                    )
                  }
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  นำทาง
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <RecenterButton position={userLocation} />
      </MapContainer>

      {/* Empty state overlay */}
      {filteredStores.length === 0 && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg pointer-events-auto">
            <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-700 font-semibold">ไม่พบร้านค้าในหมวดนี้</p>
            <p className="text-gray-500 text-sm mt-1">ลองเปลี่ยนตัวกรอง</p>
          </div>
        </div>
      )}
    </div>
  );
}
