import type { ReactNode } from 'react';

export default function MerchantPublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between border-b border-blue-900/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-body-sm text-white">
              PH
            </div>
            <div>
              <p className="text-body-sm text-blue-300">Pro Hunter</p>
              <h1 className="text-h4 text-white">Merchant Partner</h1>
            </div>
          </div>
          <span className="rounded-full border border-blue-500/40 bg-blue-500/15 px-3 py-1 text-caption text-blue-200">
            Business Onboarding
          </span>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
