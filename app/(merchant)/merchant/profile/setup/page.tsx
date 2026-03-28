'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Deprecated: Profile setup is now integrated into My Shop page
export default function MerchantProfileSetupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/merchant/shop?setup=true');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">กำลังย้ายไปหน้า My Shop...</p>
    </div>
  );
}
