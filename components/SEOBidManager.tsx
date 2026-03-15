'use client';

import { useState } from 'react';
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  Zap,
  Target,
  Crown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Mock data for keyword prices based on popularity
const keywordData = [
  { keyword: 'กาแฟ', volume: 3500, basePrice: 299, competition: 'สูง', roi: 'ดีมาก' },
  { keyword: 'นมโปรตีน', volume: 1250, basePrice: 199, competition: 'ปานกลาง', roi: 'ดี' },
  { keyword: 'ข้าว', volume: 2100, basePrice: 249, competition: 'สูง', roi: 'ดี' },
  { keyword: 'เบเกอรี่', volume: 980, basePrice: 149, competition: 'ต่ำ', roi: 'ดีมาก' },
  { keyword: 'ซูชิ', volume: 780, basePrice: 129, competition: 'ต่ำ', roi: 'ดี' },
  { keyword: 'ผักสด', volume: 1450, basePrice: 179, competition: 'ปานกลาง', roi: 'ปานกลาง' },
  { keyword: 'เนื้อสัตว์', volume: 2890, basePrice: 279, competition: 'สูง', roi: 'ดี' },
  { keyword: 'ของใช้', volume: 1750, basePrice: 219, competition: 'ปานกลาง', roi: 'ดี' },
];

export default function SEOBidManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<typeof keywordData[0] | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<7 | 14 | 30>(7);
  const [bidConfirmed, setBidConfirmed] = useState(false);

  const filteredKeywords = keywordData.filter(k => 
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculatePrice = () => {
    if (!selectedKeyword) return 0;
    return selectedKeyword.basePrice * (selectedDuration / 7);
  };

  const handleConfirmBid = () => {
    if (selectedKeyword) {
      setBidConfirmed(true);
      // Simulate API call to update is_sponsored: true
      setTimeout(() => {
        alert(`🎉 ยินดีด้วย! โปรโมชั่นของคุณจะปรากฏในอันดับต้นๆ สำหรับคำค้นหา "${selectedKeyword.keyword}" เป็นเวลา ${selectedDuration} วัน`);
        setBidConfirmed(false);
        setSelectedKeyword(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#FF5722]" />
            SEO Bid Manager
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            เลือก Keyword ที่คุณต้องการให้โปรโมชั่นของคุณขึ้นอันดับต้น
          </p>
        </div>
        <Crown className="w-8 h-8 text-yellow-500" />
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">
              💡 ระบบ SEO Bidding ทำงานยังไง?
            </p>
            <p className="text-xs text-blue-700">
              เมื่อคุณจ่ายเงินซื้อ Keyword โปรโมชั่นของคุณจะปรากฏในอันดับ 1-3 เมื่อมีคนค้นหาคำนั้น 
              ราคาขึ้นอยู่กับความนิยมของ Keyword และระยะเวลาที่เลือก
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Keyword Selection */}
        <div className="card p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#FF5722]" />
            เลือก Keyword
          </h4>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา Keyword..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
            />
          </div>

          {/* Keywords List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredKeywords.map((keyword, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedKeyword(keyword)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedKeyword?.keyword === keyword.keyword
                    ? 'border-[#FF5722] bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-lg">
                    {keyword.keyword}
                  </span>
                  <span className="text-sm font-bold text-[#FF5722]">
                    ฿{keyword.basePrice}/สัปดาห์
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {keyword.volume.toLocaleString()} searches/วัน
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    keyword.competition === 'สูง' 
                      ? 'bg-red-100 text-red-700'
                      : keyword.competition === 'ปานกลาง'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    แข่งขัน: {keyword.competition}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    ROI: {keyword.roi}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Bid Configuration */}
        <div className="card p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            กำหนดราคา Bid
          </h4>

          {selectedKeyword ? (
            <div className="space-y-6">
              {/* Selected Keyword Info */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-700 mb-2">Keyword ที่เลือก:</p>
                <p className="text-2xl font-bold text-orange-900 mb-3">
                  {selectedKeyword.keyword}
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-orange-600">Search Volume</p>
                    <p className="font-bold text-orange-900">
                      {selectedKeyword.volume.toLocaleString()}/วัน
                    </p>
                  </div>
                  <div>
                    <p className="text-orange-600">Competition</p>
                    <p className="font-bold text-orange-900">{selectedKeyword.competition}</p>
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  เลือกระยะเวลา:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setSelectedDuration(days as 7 | 14 | 30)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedDuration === days
                          ? 'border-[#FF5722] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-2xl font-bold text-gray-900">{days}</p>
                      <p className="text-xs text-gray-600">วัน</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-green-700">ราคารวม:</span>
                  <span className="text-4xl font-bold text-green-900">
                    ฿{calculatePrice().toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-green-700">
                  <div className="flex justify-between">
                    <span>ราคาต่อสัปดาห์:</span>
                    <span className="font-semibold">฿{selectedKeyword.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ระยะเวลา:</span>
                    <span className="font-semibold">{selectedDuration} วัน</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span>ราคาต่อวัน:</span>
                    <span className="font-semibold">
                      ฿{Math.round(calculatePrice() / selectedDuration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expected Results */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-900 mb-3">
                  📊 ผลลัพธ์ที่คาดหวัง:
                </p>
                <div className="space-y-2 text-sm text-purple-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>ปรากฏในอันดับ 1-3</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>
                      เพิ่มการมองเห็น <strong>~{Math.round(selectedKeyword.volume * 0.3).toLocaleString()}</strong> views
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>ROI คาดการณ์: <strong>{selectedKeyword.roi}</strong></span>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmBid}
                disabled={bidConfirmed}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  bidConfirmed
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white hover:shadow-lg'
                }`}
              >
                {bidConfirmed ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    ยืนยัน Bid - จ่าย ฿{calculatePrice().toLocaleString()}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>เลือก Keyword ที่ต้องการจากด้านซ้าย</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900 font-medium mb-2">
          ⚡ ทำไมต้องซื้อ SEO Ranking?
        </p>
        <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
          <li>ลูกค้าเห็นโปรโมชั่นของคุณก่อน - เพิ่มโอกาสขายสูงสุด</li>
          <li>ราคาโปร่งใส - จ่ายตามความนิยมของ Keyword</li>
          <li>ROI ชัดเจน - ดูสถิติแบบเรียลไทม์</li>
          <li>ไม่มีค่าธรรมเนียมแอบแฝง - จ่ายแค่ราคาที่เห็น</li>
        </ul>
      </div>
    </div>
  );
}
