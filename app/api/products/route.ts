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

    // Gallery: multiple additional images
    const galleryFiles: File[] = [];
    const galleryEntries = formData.getAll('gallery');
    for (const entry of galleryEntries) {
      if (entry instanceof File && entry.size > 0) {
        galleryFiles.push(entry);
      }
    }

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
          cacheControl: '60',
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

    // Step 1b: Upload gallery images
    const galleryPaths: string[] = [];
    for (const gFile of galleryFiles) {
      try {
        const ext = gFile.name.split('.').pop() || 'jpg';
        const gName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const gPath = `products/gallery/${gName}`;
        const buf = Buffer.from(await gFile.arrayBuffer());
        const { error: gErr } = await supabase.storage
          .from('promotions')
          .upload(gPath, buf, { contentType: gFile.type, upsert: false, cacheControl: '60' });
        if (!gErr) {
          galleryPaths.push(gPath);
        } else {
          console.warn('[API] Gallery image upload failed:', gErr.message);
        }
      } catch (gUploadErr) {
        console.warn('[API] Gallery upload error:', gUploadErr);
      }
    }

    // Step 2: Insert product into DB (snake_case columns — matching fix-products-table.sql)
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

    // Add gallery if any images were uploaded
    if (galleryPaths.length > 0) {
      insertData.gallery = galleryPaths;
    }

    // Only add shop_id if provided (UUID)
    if (shopId && shopId.length > 10) {
      insertData.shop_id = shopId;
    }

    // Duplicate check: same title + shop within last 5 minutes = likely double-submit
    if (title && (shopId || shopName)) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      let dupQuery = supabase.from('products').select('id, title, created_at')
        .eq('title', title)
        .gte('created_at', fiveMinAgo);
      if (shopId && shopId.length > 10) {
        dupQuery = dupQuery.eq('shop_id', shopId);
      } else {
        dupQuery = dupQuery.eq('shop_name', shopName);
      }
      const { data: existing } = await dupQuery;
      if (existing && existing.length > 0) {
        console.warn('[API] Duplicate blocked:', title, '- already exists (id:', existing[0].id, ')');
        return NextResponse.json({
          error: `สินค้า "${title}" ถูกลงประกาศไปแล้ว`,
          duplicate: true,
          existingId: existing[0].id,
        }, { status: 409 });
      }
    }

    // Single insert — NO fallback to prevent double-insert
    const { data, error: insertError } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (insertError || !data) {
      console.error('[API] DB insert error:', insertError?.message);
      return NextResponse.json({
        error: 'บันทึกข้อมูลไม่สำเร็จ: ' + (insertError?.message || 'unknown'),
        step: 'insert',
      }, { status: 500 });
    }

    console.log('[API] ✅ Product created:', data.id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    console.error('[API] Unexpected error:', err);
    return NextResponse.json({
      error: 'เกิดข้อผิดพลาด: ' + String(err),
    }, { status: 500 });
  }
}
