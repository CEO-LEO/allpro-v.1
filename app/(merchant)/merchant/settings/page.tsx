'use client';

import dynamic from 'next/dynamic';

const MerchantSettingsDashboard = dynamic(
  () => import('@/components/Merchant/MerchantSettingsDashboard'),
  { ssr: false }
);

export default function MerchantSettingsPage() {
  return <MerchantSettingsDashboard />;
}
