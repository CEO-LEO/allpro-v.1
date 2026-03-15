export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#FF5722] to-[#FF7043] flex items-center justify-center shadow-lg shadow-orange-200 animate-pulse">
            <span className="text-2xl font-black text-white">A</span>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] rounded-full animate-[loading_1.2s_ease-in-out_infinite]" />
        </div>

        <p className="mt-4 text-sm text-slate-400 font-medium">กำลังโหลด...</p>
      </div>
    </div>
  );
}
