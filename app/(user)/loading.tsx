export default function UserLoading() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="h-7 w-20 bg-slate-200 rounded-lg animate-pulse" />
          <div className="flex gap-3">
            <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Hero skeleton */}
        <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />

        {/* Categories skeleton */}
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-16 space-y-2">
              <div className="h-14 w-14 mx-auto bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-3 w-12 mx-auto bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Cards skeleton */}
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex gap-3">
              <div className="h-20 w-20 bg-slate-200 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
                <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
