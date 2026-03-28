import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo (replace with Supabase in production)
// Schema for production:
// CREATE TABLE saved_promotions (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
//   promotion_id TEXT NOT NULL,
//   saved_at TIMESTAMPTZ DEFAULT NOW(),
//   UNIQUE(user_id, promotion_id)
// );
// CREATE INDEX idx_saved_promotions_user ON saved_promotions(user_id);

const savedMap = new Map<string, Set<string>>();

// POST — Save a promotion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, promotionId } = body;

    if (!userId || !promotionId) {
      return NextResponse.json(
        { error: 'userId and promotionId are required' },
        { status: 400 }
      );
    }

    if (!savedMap.has(userId)) {
      savedMap.set(userId, new Set());
    }
    savedMap.get(userId)!.add(promotionId);

    return NextResponse.json({ 
      success: true, 
      message: 'Promotion saved',
      savedCount: savedMap.get(userId)!.size
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// DELETE — Unsave a promotion
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, promotionId } = body;

    if (!userId || !promotionId) {
      return NextResponse.json(
        { error: 'userId and promotionId are required' },
        { status: 400 }
      );
    }

    if (savedMap.has(userId)) {
      savedMap.get(userId)!.delete(promotionId);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Promotion unsaved',
      savedCount: savedMap.get(userId)?.size ?? 0
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// GET — Get saved promotions for a user
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId query parameter is required' },
      { status: 400 }
    );
  }

  const savedIds = savedMap.has(userId) 
    ? Array.from(savedMap.get(userId)!) 
    : [];

  return NextResponse.json({ 
    success: true, 
    savedPromotionIds: savedIds,
    count: savedIds.length
  });
}
