import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/products/:id/price-history
 *
 * Returns weekly price history for the last 6 weeks.
 *
 * When a real Supabase `price_history` table exists, this endpoint will
 * query it with:
 *   SELECT date_trunc('week', recorded_at) AS week,
 *          AVG(price)::int               AS price
 *   FROM   price_history
 *   WHERE  product_id = $1
 *     AND  recorded_at >= NOW() - INTERVAL '6 weeks'
 *   GROUP BY week ORDER BY week;
 *
 * Until then it generates deterministic demo data seeded by the product id
 * so each product always shows the same chart.
 */

export interface PriceHistoryPoint {
  /** ISO date string */
  date: string;
  /** Thai display label, e.g. "3 มี.ค." */
  dateDisplay: string;
  /** Price at this point */
  price: number;
  /** Optional event label */
  event?: string;
}

export interface PriceHistoryResponse {
  productId: string;
  history: PriceHistoryPoint[];
  stats: {
    currentPrice: number;
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    lowestDate: string;
  };
}

// Thai month abbreviations (0-indexed)
const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

// Buddhist year offset
const BE_OFFSET = 543;

function toThaiDate(d: Date): string {
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`;
}

/**
 * Simple deterministic hash from string → 0..1
 */
function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = `${seed}-${index}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 10000) / 10000;
}

function generateDemoHistory(
  productId: string,
  currentPrice: number,
): { history: PriceHistoryPoint[]; stats: PriceHistoryResponse['stats'] } {
  const now = new Date();
  const points: PriceHistoryPoint[] = [];

  // Base price is typically higher than currentPrice (since it's on promo)
  const basePrice = Math.round(currentPrice * (1.1 + seededRandom(productId, 99) * 0.4));

  // Generate 7 data points: 6 weeks ago → this week
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const rand = seededRandom(productId, i);

    let price: number;
    let event: string | undefined;

    if (i === 0) {
      // Current week = promo price
      price = currentPrice;
    } else {
      // Fluctuation: ±25% around basePrice
      const fluctuation = (rand - 0.5) * 0.5 * basePrice;
      price = Math.round(basePrice + fluctuation);

      // Occasionally mark a week as a sale event
      if (rand > 0.7) {
        const saleDiscount = 0.15 + rand * 0.2; // 15-35% off
        price = Math.round(basePrice * (1 - saleDiscount));
        event = 'Flash Sale';
      }
    }

    // Ensure price stays positive and reasonable
    price = Math.max(Math.round(currentPrice * 0.6), price);

    points.push({
      date: d.toISOString(),
      dateDisplay: toThaiDate(d),
      price,
      event,
    });
  }

  const prices = points.map((p) => p.price);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const averagePrice = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
  const lowestPoint = points.find((p) => p.price === lowestPrice)!;

  return {
    history: points,
    stats: {
      currentPrice,
      averagePrice,
      lowestPrice,
      highestPrice,
      lowestDate: lowestPoint.dateDisplay,
    },
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  // --- Future: query Supabase price_history table ---
  // const { data, error } = await supabase
  //   .from('price_history')
  //   .select('recorded_at, price')
  //   .eq('product_id', id)
  //   .gte('recorded_at', sixMonthsAgo)
  //   .order('recorded_at', { ascending: true });

  // For now, we need the current promo price.
  // The caller provides it as a query param so the API is self-contained.
  const url = new URL(_request.url);
  const priceParam = url.searchParams.get('currentPrice');
  const currentPrice = priceParam ? parseInt(priceParam, 10) : 399;

  const { history, stats } = generateDemoHistory(id, currentPrice);

  const response: PriceHistoryResponse = {
    productId: id,
    history,
    stats,
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

/**
 * POST /api/products/:id/price-history
 *
 * Logs a price change event. When a real database is connected this will
 * INSERT INTO price_history (product_id, old_price, new_price, ...).
 * For now it acknowledges the request so the client flow works end-to-end.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.newPrice !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // --- Future: insert into Supabase ---
  // await supabase.from('price_history').insert({
  //   product_id: id,
  //   old_price: body.oldPrice,
  //   new_price: body.newPrice,
  //   old_original: body.oldOriginal,
  //   new_original: body.newOriginal,
  //   recorded_at: new Date().toISOString(),
  // });

  return NextResponse.json({
    success: true,
    productId: id,
    logged: {
      oldPrice: body.oldPrice,
      newPrice: body.newPrice,
      oldOriginal: body.oldOriginal,
      newOriginal: body.newOriginal,
      timestamp: new Date().toISOString(),
    },
  });
}
