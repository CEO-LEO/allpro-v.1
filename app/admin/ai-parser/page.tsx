'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import { parseRawInput, checkDuplicates, generateSmartTags, ParsedPromotion, TaggingResult } from '@/lib/ai-parser';
import { Loader2, Plus, RefreshCw, AlertTriangle, CheckCircle, Tag, MapPin, Search, Save, X } from 'lucide-react';

export default function AIParserPage() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedPromotion | null>(null);
  const [duplicateStatus, setDuplicateStatus] = useState<{ isDuplicate: boolean; similarityScore: number; } | null>(null);
  const [tags, setTags] = useState<TaggingResult | null>(null);

  const handleParse = async () => {
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 1. Parsing Input
    const result = await parseRawInput(inputText);
    setParsedData(result);

    // 2. Checking Duplicates
    const dupCheck = checkDuplicates(result);
    setDuplicateStatus({ isDuplicate: dupCheck.isDuplicate, similarityScore: dupCheck.similarityScore });

    // 3. Generating Tags
    const generatedTags = generateSmartTags(result);
    setTags(generatedTags);

    setIsProcessing(false);
  };

  const handleManualEdit = (field: keyof ParsedPromotion, value: any) => {
    if (parsedData) {
      setParsedData({ ...parsedData, [field]: value });
    }
  };

  const handleLocationEdit = (key: string, value: any) => {
    if (parsedData) {
        setParsedData({
            ...parsedData,
            location: {
                ...parsedData.location,
                [key]: value
            }
        });
    }
  }

  // Mock for image upload - just extracts text from image name/metadata in a real scenario
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputText(`Simulated OCR from ${file.name}: \n[Detected Shop: "Mom's Kitchen"]\n[Detected Promo: "Lunch Special 50% Off"]\n[Address: "Soi 5, Sukhumvit"]`);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Data Parser & Importer</h1>
          <p className="text-gray-500 mt-1">Import unstructured data from social media posts or images.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Search className="w-5 h-5 text-indigo-600" />
              Raw Input Source
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option 1: Paste Text (Facebook/Social Post)
                </label>
                <textarea
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  placeholder="Paste the full text of a promotional post here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or Upload Image</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option 2: Upload Storefront Sign / Menu
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Plus className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload image (Simulated)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleParse}
                disabled={!inputText || isProcessing}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex justify-center items-center gap-2 transition-all shadow-md
                  ${!inputText || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'}
                `}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Analyze & Extract Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="space-y-6">
          {parsedData ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Parsed Results
                </h2>
                <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Confidence: {(parsedData.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Duplicate Check Alert */}
              {duplicateStatus?.isDuplicate ? (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">Potential Duplicate Detected</h3>
                    <p className="text-sm text-red-600 mt-1">
                      Similar promotion found (Similarity: {(duplicateStatus.similarityScore * 100).toFixed(0)}%).
                      Review carefully.
                    </p>
                  </div>
                </div>
              ) : (
                 <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-100 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-green-800">Unique Entry</h3>
                    <p className="text-sm text-green-600 mt-1">
                      No matching promotions found. Safe to import.
                    </p>
                  </div>
                </div>
              )}

              {/* Editable Fields */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Shop Name</label>
                    <input 
                      type="text" 
                      value={parsedData.shopName}
                      onChange={(e) => handleManualEdit('shopName', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md font-semibold text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expiration Date</label>
                    <input 
                      type="text" 
                      value={parsedData.expirationDate || ''}
                      onChange={(e) => handleManualEdit('expirationDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Promotion Details</label>
                  <textarea 
                    value={parsedData.promotionDetails}
                    onChange={(e) => handleManualEdit('promotionDetails', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 h-24 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location / Address
                  </label>
                  <input 
                    type="text" 
                    value={parsedData.location.address || ''}
                    onChange={(e) => handleLocationEdit('address', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Tags Section */}
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Auto-Generated Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags?.tags.map((tag, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200">
                        {tag}
                      </span>
                    ))}
                    <button className="text-xs text-gray-500 border border-dashed border-gray-400 px-3 py-1 rounded-full hover:bg-gray-100 hover:text-gray-700 transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Tag
                    </button>
                  </div>
                </div>
              </div>

               <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => { setParsedData(null); setInputText(''); }}
                  className="flex-1 flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Discard
                </button>
                <button className="flex-1 flex justify-center items-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium shadow-md transition-colors active:scale-[0.98]">
                  <Save className="w-4 h-4" />
                  Confirm & Import
                </button>
              </div>
              
              <div className="mt-4 text-center">
                 <details className="text-xs text-gray-400 text-left">
                  <summary className="cursor-pointer hover:text-gray-600 mb-2">Debug: View Raw JSON</summary>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-[10px]">
                    {JSON.stringify(parsedData, null, 2)}
                  </pre>
                </details>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-600">No Data Analyzed Yet</p>
              <p className="text-sm max-w-xs text-center mt-2">Enter text or upload an image on the left to see the AI parser in action.</p>
            </div>
          )}
        </div>
      </div>
      {(parsedData && duplicateStatus) && (
        <div className="hidden">Mock Duplicate Check Data</div>
      )}
    </div>
   </AdminLayout>
  );
}
