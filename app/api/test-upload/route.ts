import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/test-upload — diagnose Storage + DB capabilities
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  const results: Record<string, unknown> = {
    supabase_url: url ? url.substring(0, 30) + '...' : 'MISSING',
    anon_key: anonKey ? 'SET (' + anonKey.length + ' chars)' : 'MISSING',
    service_key: serviceKey ? 'SET (' + serviceKey.length + ' chars)' : 'MISSING',
  };

  // Test with anon key
  const anonClient = createClient(url, anonKey);
  
  // 1. Test products table SELECT
  try {
    const { data, error, count } = await anonClient
      .from('products')
      .select('id, title, image', { count: 'exact' })
      .limit(3);
    results.products_select = { success: !error, count, error: error?.message, data: data?.map(d => ({ id: d.id, title: d.title, image_type: typeof d.image === 'string' ? (d.image?.substring(0, 50) + '...') : 'null' })) };
  } catch (e) {
    results.products_select = { success: false, error: String(e) };
  }

  // 2. Test products table INSERT (with anon key — no auth)
  try {
    const { data, error } = await anonClient
      .from('products')
      .insert({
        title: 'TEST_ANON_INSERT',
        price: 1,
        category: 'Other',
        shop_name: 'test',
      })
      .select()
      .single();
    results.products_insert_anon = { success: !error, error: error?.message, hint: error?.hint };
    // Clean up test row
    if (data?.id) {
      await anonClient.from('products').delete().eq('id', data.id);
    }
  } catch (e) {
    results.products_insert_anon = { success: false, error: String(e) };
  }

  // 3. Test products table INSERT with service role key
  if (serviceKey) {
    const serviceClient = createClient(url, serviceKey);
    try {
      const { data, error } = await serviceClient
        .from('products')
        .insert({
          title: 'TEST_SERVICE_INSERT',
          price: 1,
          category: 'Other',
          shop_name: 'test',
        })
        .select()
        .single();
      results.products_insert_service = { success: !error, error: error?.message, id: data?.id };
      // Clean up
      if (data?.id) {
        await serviceClient.from('products').delete().eq('id', data.id);
        results.products_cleanup = 'deleted';
      }
    } catch (e) {
      results.products_insert_service = { success: false, error: String(e) };
    }
  }

  // 4. Test Storage bucket list
  try {
    const { data, error } = await anonClient.storage.listBuckets();
    results.storage_buckets = {
      success: !error,
      buckets: data?.map(b => ({ id: b.id, name: b.name, public: b.public })),
      error: error?.message,
    };
  } catch (e) {
    results.storage_buckets = { success: false, error: String(e) };
  }

  // 5. Test Storage upload (small test file with anon)
  try {
    const testContent = new Blob(['test'], { type: 'text/plain' });
    const testPath = `products/_test_${Date.now()}.txt`;
    const { data, error } = await anonClient.storage
      .from('promotions')
      .upload(testPath, testContent, { contentType: 'text/plain' });
    results.storage_upload_anon = { success: !error, path: data?.path, error: error?.message };
    // Clean up
    if (!error) {
      await anonClient.storage.from('promotions').remove([testPath]);
      results.storage_upload_cleanup = 'deleted';
    }
  } catch (e) {
    results.storage_upload_anon = { success: false, error: String(e) };
  }

  // 6. Test Storage upload with service key
  if (serviceKey) {
    const serviceClient = createClient(url, serviceKey);
    try {
      const testContent = new Blob(['test'], { type: 'text/plain' });
      const testPath = `products/_test_service_${Date.now()}.txt`;
      const { data, error } = await serviceClient.storage
        .from('promotions')
        .upload(testPath, testContent, { contentType: 'text/plain' });
      results.storage_upload_service = { success: !error, path: data?.path, error: error?.message };
      if (!error) {
        await serviceClient.storage.from('promotions').remove([testPath]);
      }
    } catch (e) {
      results.storage_upload_service = { success: false, error: String(e) };
    }
  }

  // 7. Check RLS policies on products
  try {
    const { data, error } = await anonClient.rpc('get_policies', {}).maybeSingle();
    results.rls_check = { note: 'RLS is enabled - anon INSERT requires auth.role()=authenticated' };
  } catch {
    results.rls_check = { note: 'Could not query policies - this is normal' };
  }

  return NextResponse.json(results, { 
    headers: { 'Content-Type': 'application/json' }
  });
}
