// Party Finder Utilities

export interface PartyRoom {
  id: string;
  productId: string;
  productName: string;
  dealType: 'B1G1' | 'BULK';
  hostId: string;
  hostName: string;
  hostAvatar: string;
  partnerId?: string;
  partnerName?: string;
  partnerAvatar?: string;
  status: 'waiting' | 'matched' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  maxMembers: number;
  currentMembers: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isBot?: boolean;
}

const PARTY_ROOMS_KEY = 'party_rooms';
const ACTIVE_ROOM_KEY = 'active_party_room';

// Generate unique room ID
export function generateRoomId(): string {
  return `ROOM-${Math.floor(100 + Math.random() * 900)}`;
}

// Get all active party rooms for a product
export function getActiveRooms(productId: string): PartyRoom[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(PARTY_ROOMS_KEY);
  if (!stored) return [];
  
  try {
    const allRooms = JSON.parse(stored) as PartyRoom[];
    const now = new Date();
    
    // Filter active rooms for this product that haven't expired
    return allRooms
      .filter(room => 
        room.productId === productId && 
        room.status === 'waiting' &&
        new Date(room.expiresAt) > now
      )
      .map(room => ({
        ...room,
        createdAt: new Date(room.createdAt),
        expiresAt: new Date(room.expiresAt)
      }));
  } catch {
    return [];
  }
}

// Create a new party room
export function createPartyRoom(
  productId: string,
  productName: string,
  dealType: 'B1G1' | 'BULK',
  hostName: string = 'คุณ'
): PartyRoom {
  if (typeof window === 'undefined') throw new Error('Cannot create room on server');
  
  const roomId = generateRoomId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
  
  const newRoom: PartyRoom = {
    id: roomId,
    productId,
    productName,
    dealType,
    hostId: 'current-user',
    hostName,
    hostAvatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    status: 'waiting',
    createdAt: now,
    expiresAt,
    maxMembers: 2,
    currentMembers: 1
  };
  
  // Save to storage
  const stored = localStorage.getItem(PARTY_ROOMS_KEY);
  const allRooms = stored ? JSON.parse(stored) : [];
  allRooms.push(newRoom);
  localStorage.setItem(PARTY_ROOMS_KEY, JSON.stringify(allRooms));
  
  // Set as active room
  localStorage.setItem(ACTIVE_ROOM_KEY, roomId);
  
  // Simulate partner joining after 5-15 seconds
  setTimeout(() => {
    matchPartner(roomId);
  }, Math.random() * 10000 + 5000);
  
  return newRoom;
}

// Join an existing room
export function joinPartyRoom(roomId: string): PartyRoom | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(PARTY_ROOMS_KEY);
  if (!stored) return null;
  
  try {
    const allRooms = JSON.parse(stored) as PartyRoom[];
    const roomIndex = allRooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) return null;
    
    const room = allRooms[roomIndex];
    
    // Check if room is still waiting
    if (room.status !== 'waiting') return null;
    
    // Add current user as partner
    room.partnerId = 'current-user-partner';
    room.partnerName = 'คุณ';
    room.partnerAvatar = `https://i.pravatar.cc/150?u=${Date.now() + 1}`;
    room.status = 'matched';
    room.currentMembers = 2;
    
    // Update storage
    allRooms[roomIndex] = room;
    localStorage.setItem(PARTY_ROOMS_KEY, JSON.stringify(allRooms));
    
    // Set as active room
    localStorage.setItem(ACTIVE_ROOM_KEY, roomId);
    
    return {
      ...room,
      createdAt: new Date(room.createdAt),
      expiresAt: new Date(room.expiresAt)
    };
  } catch {
    return null;
  }
}

// Simulate partner matching
function matchPartner(roomId: string): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(PARTY_ROOMS_KEY);
  if (!stored) return;
  
  try {
    const allRooms = JSON.parse(stored) as PartyRoom[];
    const roomIndex = allRooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) return;
    
    const room = allRooms[roomIndex];
    
    // Only match if still waiting
    if (room.status !== 'waiting') return;
    
    // Add simulated partner
    room.partnerId = 'partner-bot';
    room.partnerName = 'K.Somsri';
    room.partnerAvatar = `https://i.pravatar.cc/150?u=partner${Date.now()}`;
    room.status = 'matched';
    room.currentMembers = 2;
    
    // Update storage
    allRooms[roomIndex] = room;
    localStorage.setItem(PARTY_ROOMS_KEY, JSON.stringify(allRooms));
    
    // Trigger storage event for UI update
    window.dispatchEvent(new Event('partyMatched'));
  } catch {
    return;
  }
}

// Get active room ID
export function getActiveRoomId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_ROOM_KEY);
}

// Get room by ID
export function getRoomById(roomId: string): PartyRoom | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(PARTY_ROOMS_KEY);
  if (!stored) return null;
  
  try {
    const allRooms = JSON.parse(stored) as PartyRoom[];
    const room = allRooms.find(r => r.id === roomId);
    
    if (!room) return null;
    
    return {
      ...room,
      createdAt: new Date(room.createdAt),
      expiresAt: new Date(room.expiresAt)
    };
  } catch {
    return null;
  }
}

// Complete a party room
export function completePartyRoom(roomId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const stored = localStorage.getItem(PARTY_ROOMS_KEY);
  if (!stored) return false;
  
  try {
    const allRooms = JSON.parse(stored) as PartyRoom[];
    const roomIndex = allRooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) return false;
    
    allRooms[roomIndex].status = 'completed';
    localStorage.setItem(PARTY_ROOMS_KEY, JSON.stringify(allRooms));
    
    // Clear active room
    localStorage.removeItem(ACTIVE_ROOM_KEY);
    
    return true;
  } catch {
    return false;
  }
}

// Close/leave room
export function leavePartyRoom(roomId: string): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(PARTY_ROOMS_KEY);
  if (!stored) return;
  
  try {
    const allRooms = JSON.parse(stored) as PartyRoom[];
    const filteredRooms = allRooms.filter(r => r.id !== roomId);
    localStorage.setItem(PARTY_ROOMS_KEY, JSON.stringify(filteredRooms));
    
    // Clear active room
    const activeRoom = localStorage.getItem(ACTIVE_ROOM_KEY);
    if (activeRoom === roomId) {
      localStorage.removeItem(ACTIVE_ROOM_KEY);
    }
  } catch {
    return;
  }
}

// Initialize demo rooms
export function initializeDemoRooms(productId: string, productName: string): void {
  if (typeof window === 'undefined') return;
  
  // Check if already initialized
  const existing = getActiveRooms(productId);
  if (existing.length > 0) return;
  
  // Create 2-3 demo rooms
  const demoRooms: PartyRoom[] = [
    {
      id: 'ROOM-101',
      productId,
      productName,
      dealType: 'B1G1',
      hostId: 'demo-user-1',
      hostName: 'K.Somchai',
      hostAvatar: 'https://i.pravatar.cc/150?img=12',
      status: 'waiting',
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
      expiresAt: new Date(Date.now() + 8 * 60 * 1000),
      maxMembers: 2,
      currentMembers: 1
    },
    {
      id: 'ROOM-102',
      productId,
      productName,
      dealType: 'B1G1',
      hostId: 'demo-user-2',
      hostName: 'K.Nittaya',
      hostAvatar: 'https://i.pravatar.cc/150?img=45',
      status: 'waiting',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      maxMembers: 2,
      currentMembers: 1
    }
  ];
  
  const stored = localStorage.getItem(PARTY_ROOMS_KEY);
  const allRooms = stored ? JSON.parse(stored) : [];
  localStorage.setItem(PARTY_ROOMS_KEY, JSON.stringify([...allRooms, ...demoRooms]));
}
