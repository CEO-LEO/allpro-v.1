'use client';

import dynamic from 'next/dynamic';

const ProfileSettings = dynamic(
  () => import('@/components/Profile/ProfileSettings'),
  { ssr: false }
);

export default function MerchantProfilePage() {
  return <ProfileSettings />;
}
