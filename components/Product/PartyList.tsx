'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Plus, AlertCircle } from 'lucide-react';
import { getActiveRooms, createPartyRoom, initializeDemoRooms, type PartyRoom } from '@/lib/partyUtils';
import PartyRoomModal from './PartyRoomModal';

interface PartyListProps {
  productId: string;
  productName: string;
  dealType?: string;
  discount?: number;
}

export default function PartyList({ productId, productName, dealType, discount }: PartyListProps) {
  const [rooms, setRooms] = useState<PartyRoom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<PartyRoom | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Check if this is a B1G1 or bulk deal
  const isGroupDeal = dealType?.toLowerCase().includes('1 get 1') || 
                      dealType?.toLowerCase().includes('b1g1') ||
                      (discount && discount >= 50);

  useEffect(() => {
    if (!isGroupDeal) return;

    // Initialize demo rooms
    initializeDemoRooms(productId, productName);
    
    // Load rooms
    loadRooms();

    // Refresh every 5 seconds
    const interval = setInterval(loadRooms, 5000);

    return () => clearInterval(interval);
  }, [productId, productName, isGroupDeal]);

  const loadRooms = () => {
    const activeRooms = getActiveRooms(productId);
    setRooms(activeRooms);
  };

  const handleCreateRoom = () => {
    const newRoom = createPartyRoom(productId, productName, 'B1G1');
    setSelectedRoom(newRoom);
    setIsHost(true);
    setIsModalOpen(true);
  };

  const handleJoinRoom = (room: PartyRoom) => {
    setSelectedRoom(room);
    setIsHost(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    setIsHost(false);
    loadRooms();
  };

  if (!isGroupDeal) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Looking for a Buddy? 👥
                </h3>
                <p className="text-sm text-gray-600">
                  {rooms.length} Active {rooms.length === 1 ? 'Room' : 'Rooms'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full w-fit">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Meet at public areas only (Cashier/Info Desk)</span>
            </div>
          </div>
        </div>

        {/* Rooms List */}
        <div className="space-y-3 mb-4">
          <AnimatePresence>
            {rooms.map((room, index) => {
              const timeLeft = Math.floor((new Date(room.expiresAt).getTime() - Date.now()) / 1000 / 60);
              
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm border-2 border-green-200 hover:border-green-400 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={room.hostAvatar}
                          alt={room.hostName}
                          className="w-12 h-12 rounded-full border-2 border-green-300"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                      </div>

                      {/* Room Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{room.id}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            {room.dealType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Host: <span className="font-semibold">{room.hostName}</span>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{timeLeft} mins left</span>
                        </div>
                      </div>

                      {/* Join Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoinRoom(room)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        Join Now →
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {rooms.length === 0 && (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-green-200">
              <Users className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No active rooms yet</p>
              <p className="text-sm text-gray-500 mt-1">Be the first to create one!</p>
            </div>
          )}
        </div>

        {/* Create Room Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateRoom}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <Plus className="w-6 h-6" />
          Open New Party Room
        </motion.button>

        {/* Info Box */}
        <div className="mt-4 bg-green-100 rounded-xl p-3 text-sm text-green-800">
          <p className="font-semibold mb-1">💡 How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-green-700">
            <li>Create or join a room</li>
            <li>Wait for a partner (max 10 mins)</li>
            <li>Chat to coordinate meeting point</li>
            <li>Complete deal together & earn +20 points!</li>
          </ol>
        </div>
      </motion.div>

      {/* Party Room Modal */}
      <AnimatePresence>
        {isModalOpen && selectedRoom && (
          <PartyRoomModal
            room={selectedRoom}
            isHost={isHost}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </>
  );
}
