'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
}

const DEFAULT_STATE: GeolocationState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  loading: false,
  error: null,
  permissionStatus: 'prompt',
};

// Haversine formula - คำนวณระยะทางระหว่าง 2 พิกัด (km)
export function calcDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // รัศมีโลก (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(DEFAULT_STATE);

  // เช็ค permission status
  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        permissionStatus: 'unsupported',
        error: 'เบราว์เซอร์ไม่รองรับ Geolocation',
      }));
      return;
    }

    // ใช้ Permissions API เช็คสถานะ (ถ้ารองรับ)
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setState(prev => ({
          ...prev,
          permissionStatus: result.state as 'prompt' | 'granted' | 'denied',
        }));

        result.onchange = () => {
          setState(prev => ({
            ...prev,
            permissionStatus: result.state as 'prompt' | 'granted' | 'denied',
          }));
        };
      }).catch(() => {
        // Permissions API ไม่รองรับบางเบราว์เซอร์ ไม่เป็นไร
      });
    }
  }, []);

  // ขอตำแหน่ง
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'เบราว์เซอร์ไม่รองรับ Geolocation',
        permissionStatus: 'unsupported',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
          permissionStatus: 'granted',
        });
      },
      (err) => {
        let errorMsg = 'ไม่สามารถดึงตำแหน่งได้';
        let permission: GeolocationState['permissionStatus'] = 'prompt';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'คุณไม่อนุญาตให้เข้าถึงตำแหน่ง';
            permission = 'denied';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'ไม่พบข้อมูลตำแหน่ง';
            break;
          case err.TIMEOUT:
            errorMsg = 'หมดเวลาการร้องขอตำแหน่ง';
            break;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMsg,
          permissionStatus: permission,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // cache 5 นาที
      }
    );
  }, []);

  return {
    ...state,
    requestLocation,
  };
}
