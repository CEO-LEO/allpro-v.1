'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, MapPin, CheckCircle2, MessageCircle } from 'lucide-react';
import { getRoomById, completePartyRoom, leavePartyRoom, joinPartyRoom, type PartyRoom } from '@/lib/partyUtils';
import { addPoints } from '@/lib/pointsUtils';
import PartyChat from './PartyChat';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface PartyRoomModalProps {
  room: PartyRoom;
  isHost: boolean;
  onClose: () => void;
}

export default function PartyRoomModal({ room: initialRoom, isHost, onClose }: PartyRoomModalProps) {
  const [room, setRoom] = useState<PartyRoom>(initialRoom);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // If joining, update room status
    if (!isHost && room.status === 'waiting') {
      const updatedRoom = joinPartyRoom(room.id);
      if (updatedRoom) {
        setRoom(updatedRoom);
        setShowChat(true);
      }
    }

    // Update timer
    const updateTimer = () => {
      const now = Date.now();
      const expiresAt = new Date(room.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        handleExpire();
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    // Listen for match event
    const handleMatch = () => {
      const updatedRoom = getRoomById(room.id);
      if (updatedRoom && updatedRoom.status === 'matched') {
        setRoom(updatedRoom);
        setShowChat(true);
        
        toast.success(
          <div className="flex flex-col gap-1">
            <p className="font-bold">🎉 Partner Found!</p>
            <p className="text-sm">Start chatting to coordinate</p>
          </div>,
          { duration: 4000 }
        );
      }
    };

    window.addEventListener('partyMatched', handleMatch);

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener('partyMatched', handleMatch);
    };
  }, [room.id, room.status, isHost]);

  const handleExpire = () => {
    toast.error('Room expired. Creating a new one...');
    leavePartyRoom(room.id);
    onClose();
  };

  const handleComplete = () => {
    // Award points
    addPoints(20, 'Co-op Shopping: ' + room.productName, '🤝');
    
    // Complete room
    completePartyRoom(room.id);
    
    // Confetti
    confetti({
      particleCount: 200,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
    });
    
    toast.success(
      <div className="flex flex-col gap-1">
        <p className="font-bold">✅ Deal Complete!</p>
        <p className="text-sm">+20 Points earned!</p>
      </div>,
      { duration: 4000 }
    );
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleLeave = () => {
    leavePartyRoom(room.id);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isMatched = room.status === 'matched';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleLeave}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white relative">
          <button
            onClick={handleLeave}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Party Room</h2>
              <p className="text-green-100">{room.id}</p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-sm text-green-100 mb-1">Deal:</p>
            <p className="font-bold text-lg">{room.dealType} - {room.productName}</p>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="bg-orange-100 px-6 py-3 border-b border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="font-bold text-orange-900">Time Remaining:</span>
            </div>
            <span className={`text-2xl font-mono font-black ${
              timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-orange-600'
            }`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 600) * 100}%` }}
              className={`h-full ${
                timeLeft < 60 ? 'bg-red-500' : 'bg-green-500'
              }`}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Members Area */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-center gap-8 mb-6">
              {/* Host/You */}
              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  <img
                    src={room.hostAvatar}
                    alt={room.hostName}
                    className="w-24 h-24 rounded-full border-4 border-green-400 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    {isHost ? 'YOU' : 'HOST'}
                  </div>
                </div>
                <p className="font-bold text-gray-900 text-lg">{room.hostName}</p>
                <p className="text-sm text-gray-600">Ready!</p>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-2xl">+</span>
                </div>
              </div>

              {/* Partner */}
              <div className="flex flex-col items-center">
                {isMatched && room.partnerAvatar ? (
                  <>
                    <div className="relative mb-3">
                      <motion.img
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        src={room.partnerAvatar}
                        alt={room.partnerName}
                        className="w-24 h-24 rounded-full border-4 border-emerald-400 shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {isHost ? 'PARTNER' : 'YOU'}
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">{room.partnerName}</p>
                    <p className="text-sm text-emerald-600 font-semibold">✓ Joined!</p>
                  </>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <Users className="w-12 h-12 text-gray-400" />
                        </motion.div>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-500">Waiting...</p>
                    <p className="text-sm text-gray-400">Looking for partner</p>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <AnimatePresence mode="wait">
                {!isMatched ? (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-center gap-2 text-yellow-800">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      >
                        <Clock className="w-5 h-5" />
                      </motion.div>
                      <span className="font-bold">Waiting for partner to join...</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">Average wait time: 30 seconds</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="matched"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-100 border-2 border-green-400 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold text-lg">Match Found! 🎉</span>
                    </div>
                    <p className="text-sm text-green-700">Start chatting to coordinate your meeting</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat Section */}
          <AnimatePresence>
            {isMatched && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Live Chat</h3>
                </div>
                <PartyChat room={room} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-3">
            {isMatched && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                Complete Deal & Earn +20 Points
              </motion.button>
            )}
            <button
              onClick={handleLeave}
              className={`${
                isMatched ? 'flex-shrink-0' : 'flex-1'
              } bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all`}
            >
              {isMatched ? 'Leave' : 'Cancel'}
            </button>
          </div>

          {/* Safety Notice */}
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-800">
            <p className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Safety Reminder:
            </p>
            <p className="text-orange-700 mt-1">
              Always meet at public areas (Cashier, Info Desk, or Store Entrance)
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
