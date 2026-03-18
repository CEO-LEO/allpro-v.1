import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Product } from '@/store/useAppStore';

// ============================================
// useProducts — ดึงสินค้า/โปรโมชั่นจาก Supabase
// ============================================
// ใช้ใน Category pages, Search, Home feed ฯลฯ
//
// Usage:
//   const { products, isLoading, error, refetch } = useProducts();
//   const { products } = useProducts({ category: 'Food', limit: 20 });

interface UseProductsOptions {
  category?: string;
  search?: string;
  limit?: number;
  shopId?: string;
}

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { category, search, limit = 50, shopId } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (shopId) {
        query = query.eq('shopId', shopId);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setProducts([]);
        return;
      }

      // Map Supabase row → Product interface
      const mapped: Product[] = (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        price: row.promoPrice ?? row.originalPrice,
        originalPrice: row.originalPrice,
        promoPrice: row.promoPrice,
        discount: row.discount,
        image: row.image,
        category: row.category,
        shopName: row.shopName,
        shopId: row.shopId,
        rating: row.rating,
        likes: row.likes,
        reviews: row.reviews,
        description: row.description || row.conditions || '',
        verified: true,
        distance: row.distance,
        createdAt: row.created_at,
      }));

      setProducts(mapped);
    } catch {
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, search, limit, shopId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

// ============================================
// useProductById — ดึงสินค้าชิ้นเดียว
// ============================================
export function useProductById(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const fetch = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!error && data) {
        setProduct({
          id: data.id,
          title: data.title,
          price: data.promoPrice ?? data.originalPrice,
          originalPrice: data.originalPrice,
          promoPrice: data.promoPrice,
          discount: data.discount,
          image: data.image,
          category: data.category,
          shopName: data.shopName,
          shopId: data.shopId,
          rating: data.rating,
          likes: data.likes,
          reviews: data.reviews,
          description: data.description || data.conditions || '',
          verified: true,
          distance: data.distance,
          createdAt: data.created_at,
        });
      }
      setIsLoading(false);
    };
    fetch();
  }, [productId]);

  return { product, isLoading };
}
