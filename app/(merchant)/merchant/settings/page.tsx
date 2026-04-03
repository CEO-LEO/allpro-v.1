'use client';

import dynamic from 'next/dynamic';
import DynamicNavbar from '@/components/Layout/DynamicNavbar';

const MerchantSettingsDashboard = dynamic(
  () => import('@/components/Merchant/MerchantSettingsDashboard'),
  { ssr: false }
);

export default function MerchantSettingsPage() {
  return (
    <div className="pb-20">
      <DynamicNavbar />
      <MerchantSettingsDashboard />
    </div>
  );
}
