'use client';
import { useProductStore } from '@/store/useProductStore';
const CATEGORIES = ['All', 'Food', 'Fashion', 'Travel', 'Gadget', 'Beauty'];
const CATEGORY_LABEL: Record<string, string> = {
  All: 'ทั้งหมด',
  Food: 'อาหาร',
  Fashion: 'แฟชั่น',
  Travel: 'ท่องเที่ยว',
  Gadget: 'อุปกรณ์',
  Beauty: 'ความงาม',
};
export default function CategoryBar() {
  const selectedCategory = useProductStore(s => s.selectedCategory);
  const setSelectedCategory = useProductStore(s => s.setSelectedCategory);
  return (
    <div className="sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={selectedCategory === cat ? 'px-4 py-2 rounded-full font-medium text-sm bg-orange-500 text-white' : 'px-4 py-2 rounded-full font-medium text-sm bg-gray-100 text-gray-800'}>
              {CATEGORY_LABEL[cat] || cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
