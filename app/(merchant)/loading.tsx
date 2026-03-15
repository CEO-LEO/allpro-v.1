export default function MerchantLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="h-7 w-28 bg-slate-200 rounded-lg animate-pulse" />
          <div className="flex gap-3">
            <div className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm space-y-2">
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-7 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="h-48 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
              <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-2/3 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
