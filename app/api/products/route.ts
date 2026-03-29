import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (bypasses RLS)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

// POST /api/products — upload image + create product (server-side, bypasses RLS)
export async function POST(request: Request) {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
  }

  try {
    const formData = await request.formData();

    // Extract fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const originalPrice = parseFloat(formData.get('original_price') as string);
    const category = (formData.get('category') as string) || 'Other';
    const shopName = (formData.get('shop_name') as string) || 'ร้านค้า';
    const shopId = formData.get('shop_id') as string;
    const discount = parseInt(formData.get('discount') as string) || 0;
    const location = (formData.get('location') as string) || 'กรุงเทพฯ';
    const conditions = (formData.get('conditions') as string) || 'โปรโมชั่นพิเศษ';
    const imageFile = formData.get('image') as File | null;
    const imageUrl = formData.get('image_url') as string | null;

    if (!title || !price) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อสินค้าและราคา' }, { status: 400 });
    }

    // Step 1: Upload image if provided
    let finalImage = '';
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from('promotions')
        .upload(filePath, buffer, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('[API] Storage upload error:', uploadError);
        // Non-blocking — continue without image rather than failing
        finalImage = '';
      } else {
        finalImage = filePath;
        console.log('[API] ✅ Image uploaded:', filePath);
      }
    } else if (imageUrl) {
      finalImage = imageUrl;
    }

    // Step 2: Insert product into DB
    // Try multiple column naming conventions (simple-schema vs supabase-schema)
    const insertResult = await tryInsertProduct(supabase, {
      title, description, price, originalPrice, finalImage,
      category, shopName, shopId, discount, location, conditions,
    });

    if (insertResult.error) {
      console.error('[API] All insert attempts failed:', insertResult.error);
      return NextResponse.json({
        error: 'บันทึกข้อมูลไม่สำเร็จ: ' + insertResult.error,
        step: 'insert',
      }, { status: 500 });
    }

    console.log('[API] ✅ Product created:', insertResult.data?.id);

    return NextResponse.json({
      success: true,
      data: insertResult.data,
    });
  } catch (err: unknown) {
    console.error('[API] Unexpected error:', err);
    return NextResponse.json({
      error: 'เกิดข้อผิดพลาด: ' + String(err),
    }, { status: 500 });
  }
}

// Try inserting with different column naming strategies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function tryInsertProduct(
  supabase: any,
  fields: {
    title: string; description: string; price: number; originalPrice: number;
    finalImage: string; category: string; shopName: string; shopId: string;
    discount: number; location: string; conditions: string;
  }
): Promise<{ data: any; error: string | null }> {
  const { title, description, price, originalPrice, finalImage, category, shopName, shopId, discount, location, conditions } = fields;

  // Strategy 1: snake_case columns with extras (simple-schema + extra columns)
  {
    const insertData: Record<string, unknown> = {
      title,
      description: description || '',
      price,
      original_price: originalPrice || price,
      image: finalImage,
      category,
      shop_name: shopName,
      discount,
      location,
      conditions,
    };
    if (shopId && shopId.length > 10) insertData.shop_id = shopId;

    const { data, error } = await supabase.from('products').insert(insertData).select().single();
    if (!error) return { data, error: null };
    console.warn('[API] Strategy 1 failed:', error.message);
  }

  // Strategy 2: Minimal snake_case columns (simple-schema only)
  {
    const insertData: Record<string, unknown> = {
      title,
      description: description || '',
      price,
      original_price: originalPrice || price,
      image: finalImage,
      category,
      shop_name: shopName,
    };
    if (shopId && shopId.length > 10) insertData.shop_id = shopId;

    const { data, error } = await supabase.from('products').insert(insertData).select().single();
    if (!error) return { data, error: null };
    console.warn('[API] Strategy 2 failed:', error.message);
  }

  // Strategy 3: camelCase columns (supabase-schema.sql)
  {
    const insertData: Record<string, unknown> = {
      title,
      description: description || '',
      'promoPrice': price,
      'originalPrice': originalPrice || price,
      image: finalImage,
      category,
      'shopName': shopName,
      discount,
      location,
      conditions,
    };
    if (shopId && shopId.length > 10) insertData['shopId'] = shopId;

    const { data, error } = await supabase.from('products').insert(insertData).select().single();
    if (!error) return { data, error: null };
    console.warn('[API] Strategy 3 failed:', error.message);
    return { data: null, error: error.message };
  }
}
