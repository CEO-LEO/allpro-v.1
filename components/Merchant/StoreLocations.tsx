'use client';

import { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp, Plus, Trash2, Clock } from 'lucide-react';

export interface LocationData {
  name: string;
  address: string;
  phone: string;
  lat: string;
  lng: string;
  operatingHours: string;
  isActive: boolean;
  isExpanded: boolean;
}

const createEmptyLocation = (): LocationData => ({
  name: '',
  address: '',
  phone: '',
  lat: '',
  lng: '',
  operatingHours: '09:00 - 21:00',
  isActive: true,
  isExpanded: true,
});

interface StoreLocationsProps {
  locations: LocationData[];
  onChange: (locations: LocationData[]) => void;
}

export default function StoreLocations({ locations, onChange }: StoreLocationsProps) {
  const updateLocation = (index: number, partial: Partial<LocationData>) => {
    const updated = locations.map((loc, i) =>
      i === index ? { ...loc, ...partial } : loc
    );
    onChange(updated);
  };

  const addLocation = () => {
    onChange([...locations, createEmptyLocation()]);
  };

  const removeLocation = (index: number) => {
    onChange(locations.filter((_, i) => i !== index));
  };

  const toggleExpand = (index: number) => {
    updateLocation(index, { isExpanded: !locations[index].isExpanded });
  };

  const toggleActive = (index: number) => {
    updateLocation(index, { isActive: !locations[index].isActive });
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-blue-600" />
          Store Locations
        </h3>
        <button
          type="button"
          onClick={addLocation}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มสาขา
        </button>
      </div>

      {locations.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">ยังไม่มีสาขา กดปุ่มด้านบนเพื่อเพิ่ม</p>
        </div>
      )}

      {/* Location Cards */}
      {locations.map((loc, index) => (
        <div
          key={index}
          className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${
            loc.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50/20'
          }`}
        >
          {/* Card Header — clickable to expand/collapse */}
          <button
            type="button"
            onClick={() => toggleExpand(index)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                loc.isActive ? 'bg-blue-100' : 'bg-red-100'
              }`}>
                <MapPin className={`w-5 h-5 ${loc.isActive ? 'text-blue-600' : 'text-red-500'}`} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  Location {index + 1}
                  {loc.name && <span className="text-gray-500 font-normal"> — {loc.name}</span>}
                </p>
                <p className="text-xs text-gray-400">
                  {loc.isActive ? 'Active' : 'Inactive'}
                  {loc.address && ` · ${loc.address.slice(0, 40)}${loc.address.length > 40 ? '...' : ''}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Active/Inactive badge */}
              <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                loc.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}>
                {loc.isActive ? 'Active' : 'Inactive'}
              </span>
              {/* Chevron */}
              {loc.isExpanded
                ? <ChevronUp className="w-5 h-5 text-gray-400" />
                : <ChevronDown className="w-5 h-5 text-gray-400" />
              }
            </div>
          </button>

          {/* Collapsible body */}
          {loc.isExpanded && (
            <div className="px-5 pb-5 border-t border-gray-100 space-y-4 pt-4">
              {/* Toggle: Active/Inactive */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Status</p>
                  <p className="text-xs text-gray-500">{loc.isActive ? 'สาขาเปิดให้บริการ' : 'สาขาปิดให้บริการ'}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={loc.isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActive(index);
                  }}
                  className="relative flex-shrink-0 h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
                  style={{ backgroundColor: loc.isActive ? '#2563eb' : '#d1d5db' }}
                >
                  <span
                    className={`pointer-events-none inline-block rounded-full bg-white shadow-lg absolute top-[3px] transition-transform duration-200 ${
                      loc.isActive ? 'translate-x-[22px]' : 'translate-x-[3px]'
                    }`}
                    style={{ width: 22, height: 22 }}
                  />
                </button>
              </div>

              {/* Form fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">ชื่อสาขา</label>
                  <input
                    type="text"
                    placeholder="เช่น สาขา Central World"
                    value={loc.name}
                    onChange={(e) => updateLocation(index, { name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    placeholder="02-xxx-xxxx"
                    value={loc.phone}
                    onChange={(e) => updateLocation(index, { phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">ที่อยู่</label>
                <input
                  type="text"
                  placeholder="เลขที่ ถนน แขวง เขต จังหวัด"
                  value={loc.address}
                  onChange={(e) => updateLocation(index, { address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Latitude</label>
                  <input
                    type="text"
                    placeholder="13.7563"
                    value={loc.lat}
                    onChange={(e) => updateLocation(index, { lat: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Longitude</label>
                  <input
                    type="text"
                    placeholder="100.5018"
                    value={loc.lng}
                    onChange={(e) => updateLocation(index, { lng: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> เวลาทำการ
                  </label>
                  <input
                    type="text"
                    placeholder="09:00 - 21:00"
                    value={loc.operatingHours}
                    onChange={(e) => updateLocation(index, { operatingHours: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Delete button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบสาขานี้
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
