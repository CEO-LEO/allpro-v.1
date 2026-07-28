'use client';

import { useState, useEffect, useRef } from 'react';
import { Store, MapPin, Plus, Trash2, Loader2, Star } from 'lucide-react';
import { useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import toast from 'react-hot-toast';

const GOOGLE_MAPS_LIBS: ('places')[] = ['places'];

interface Branch {
  id: string;
  branch_name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  is_main: boolean;
}

function BranchAddressAutocomplete({
  value,
  onChange,
  onSelectCoords,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelectCoords: (coords: { lat: number; lng: number }) => void;
}) {
  const {
    ready,
    suggestions: { status, data },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'th' } },
    debounce: 300,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setAutocompleteValue(e.target.value);
    setShowDropdown(true);
  };

  const handleSelect = async (description: string, placeId: string) => {
    setAutocompleteValue(description, false);
    clearSuggestions();
    setShowDropdown(false);
    onChange(description);
    try {
      const results = await getGeocode({ placeId });
      const { lat, lng } = getLatLng(results[0]);
      onSelectCoords({ lat, lng });
    } catch {
      // Address text saved even if geocode fails
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="ค้นหาที่อยู่สาขาใหม่..."
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
      />
      {showDropdown && status === 'OK' && data.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {data.map(({ place_id, structured_formatting }) => (
            <li key={place_id}>
              <button
                type="button"
                onClick={() => handleSelect(
                  structured_formatting.main_text + (structured_formatting.secondary_text ? ', ' + structured_formatting.secondary_text : ''),
                  place_id
                )}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{structured_formatting.main_text}</p>
                  {structured_formatting.secondary_text && (
                    <p className="text-xs text-gray-400 truncate">{structured_formatting.secondary_text}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MerchantBranchesPage() {
  const { user } = useAuthStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Without a configured API key this never loads — isMapsLoaded stays
  // false and the address field falls back to a plain input instead of
  // being stuck permanently disabled (usePlacesAutocomplete's `ready`
  // never becomes true with no Maps script loaded).
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded: _isMapsLoaded } = useLoadScript({
    googleMapsApiKey,
    libraries: GOOGLE_MAPS_LIBS,
  });
  const isMapsLoaded = googleMapsApiKey ? _isMapsLoaded : false;

  const loadBranches = async () => {
    if (!isSupabaseConfigured || !user?.id) {
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('merchant_branches')
      .select('*')
      .eq('user_id', user.id)
      .order('is_main', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Branches] load error:', error);
    } else {
      setBranches(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddBranch = async () => {
    if (!user?.id) return;
    if (!newName.trim()) {
      toast.error('กรุณากรอกชื่อสาขา');
      return;
    }
    // Only force picking a real autocomplete suggestion when the address
    // system is actually available — otherwise a merchant with no Google
    // Maps key configured yet could never add a branch at all.
    if (isMapsLoaded && !newCoords) {
      toast.error('กรุณาเลือกที่อยู่จากรายการแนะนำ เพื่อให้ปักหมุดบนแผนที่ได้ถูกต้อง');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('merchant_branches').insert({
      user_id: user.id,
      branch_name: newName.trim(),
      address: newAddress || null,
      lat: newCoords?.lat ?? null,
      lng: newCoords?.lng ?? null,
      is_main: false,
    });
    setIsSaving(false);

    if (error) {
      console.error('[Branches] add error:', error);
      toast.error('เพิ่มสาขาไม่สำเร็จ กรุณาลองใหม่');
      return;
    }

    toast.success(newCoords ? 'เพิ่มสาขาสำเร็จ!' : 'เพิ่มสาขาสำเร็จ! (ยังไม่ขึ้นบนแผนที่จนกว่าจะตั้งค่า Google Maps)');
    setNewName('');
    setNewAddress('');
    setNewCoords(null);
    setShowAddForm(false);
    loadBranches();
  };

  const handleDeleteBranch = async (branch: Branch) => {
    if (branch.is_main) {
      toast.error('ลบสาขาหลักไม่ได้ — แก้ไขที่ตั้งได้ที่หน้า "แก้ไขข้อมูลร้านค้า" แทน');
      return;
    }
    const { error } = await supabase.from('merchant_branches').delete().eq('id', branch.id);
    if (error) {
      console.error('[Branches] delete error:', error);
      toast.error('ลบสาขาไม่สำเร็จ');
      return;
    }
    toast.success('ลบสาขาแล้ว');
    setBranches(prev => prev.filter(b => b.id !== branch.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">จัดการสาขา</h1>
          <p className="text-sm text-gray-500">สาขาทั้งหมดของคุณจะแสดงบนหน้าแผนที่และเช็คสต็อกสำหรับลูกค้า</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {branches.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                  <Store className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">ยังไม่มีสาขา</p>
                  <p className="text-sm text-gray-500">ตั้งค่าที่อยู่ร้านที่หน้า &quot;แก้ไขข้อมูลร้านค้า&quot; ก่อน จะสร้างสาขาหลักให้อัตโนมัติ</p>
                </div>
              ) : (
                branches.map((branch) => (
                  <div key={branch.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${branch.is_main ? 'bg-amber-100' : 'bg-blue-100'}`}>
                      {branch.is_main ? <Star className="w-5 h-5 text-amber-600" /> : <Store className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{branch.branch_name}</p>
                        {branch.is_main && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">สาขาหลัก</span>
                        )}
                        {(branch.lat == null || branch.lng == null) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">ไม่มีพิกัด</span>
                        )}
                      </div>
                      {branch.address && <p className="text-sm text-gray-500 truncate">{branch.address}</p>}
                    </div>
                    {!branch.is_main && (
                      <button
                        onClick={() => handleDeleteBranch(branch)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบสาขา"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {showAddForm ? (
              <div className="bg-white rounded-xl border-2 border-blue-200 p-5 space-y-4">
                <h3 className="font-bold text-gray-900">เพิ่มสาขาใหม่</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อสาขา</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="เช่น สาขาสยามพารากอน"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                  {isMapsLoaded ? (
                    <BranchAddressAutocomplete
                      value={newAddress}
                      onChange={setNewAddress}
                      onSelectCoords={setNewCoords}
                    />
                  ) : (
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="ที่อยู่สาขาใหม่..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                    />
                  )}
                  {newCoords ? (
                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> ปักหมุดแล้ว
                    </p>
                  ) : !isMapsLoaded ? (
                    <p className="text-xs text-amber-600 mt-1.5">
                      ระบบแนะนำที่อยู่อัตโนมัติยังไม่เชื่อมต่อ — บันทึกเป็นข้อความได้ตามปกติ แต่จะยังไม่ขึ้นหมุดบนแผนที่จนกว่าจะตั้งค่า Google Maps API key
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowAddForm(false); setNewName(''); setNewAddress(''); setNewCoords(null); }}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleAddBranch}
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    เพิ่มสาขา
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                เพิ่มสาขาใหม่
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
