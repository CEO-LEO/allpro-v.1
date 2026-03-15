'use client';

import { useState } from 'react';
import HunterFab from './HunterFab';
import UploadModal from './UploadModal';

export default function CommunityWrapper() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <HunterFab onClick={() => setIsModalOpen(true)} />
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
