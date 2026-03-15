import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getPromotionById } from '@/lib/getPromotions';
import { supabase } from '@/lib/supabase';

type ParamsInput = { id: string } | Promise<{ id: string }>;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://allpromo.co';

function toTHB(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'พิเศษ';
  return `฿${value.toLocaleString('th-TH')}`;
}

function toAbsoluteUrl(url?: string) {
  if (!url) return `${SITE_URL}/og-default.jpg`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return new URL(url, SITE_URL).toString();
}

type ProductMetaSource = {
  title: string;
  description?: string;
  price?: number;
  promoPrice?: number;
  image?: string;
  imageUrl?: string;
};

async function getProductForMetadata(id: string): Promise<ProductMetaSource | null> {
  const { data } = await supabase
    .from('products')
    .select('title, description, price, "promoPrice", image')
    .eq('id', id)
    .maybeSingle();

  if (data?.title) {
    return {
      title: data.title,
      description: data.description,
      price: typeof data.price === 'number' ? data.price : undefined,
      promoPrice: typeof data.promoPrice === 'number' ? data.promoPrice : undefined,
      image: data.image,
    };
  }

  const promo = getPromotionById(id);
  if (!promo) return null;

  return {
    title: promo.title,
    description: promo.description,
    price: promo.price,
    image: promo.image,
  };
}

export async function generateMetadata(
  { params }: { params: ParamsInput }
): Promise<Metadata> {
  const resolved = await params;
  const id = resolved.id;

  const promo = await getProductForMetadata(id);

  if (!promo) {
    const fallbackTitle = '🔥 ดีลสุดคุ้ม ลดเหลือราคาพิเศษ!';
    const fallbackImage = `${SITE_URL}/og-default.jpg`;
    return {
      metadataBase: new URL(SITE_URL),
      title: fallbackTitle,
      description: 'ค้นหาโปรโมชั่นเด็ดใกล้คุณบน All Pro',
      openGraph: {
        title: fallbackTitle,
        description: 'ค้นหาโปรโมชั่นเด็ดใกล้คุณบน All Pro',
        url: `${SITE_URL}/product/${id}`,
        siteName: 'All Pro',
        type: 'website',
        locale: 'th_TH',
        images: [{ url: fallbackImage, width: 1200, height: 630, alt: 'All Pro' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: fallbackTitle,
        description: 'ค้นหาโปรโมชั่นเด็ดใกล้คุณบน All Pro',
        images: [fallbackImage],
      },
      alternates: {
        canonical: `${SITE_URL}/product/${id}`,
      },
    };
  }

  const price = promo.promoPrice ?? promo.price;
  const image = toAbsoluteUrl(promo.imageUrl || promo.image);
  const dynamicTitle = `🔥 ${promo.title} ลดเหลือ ${toTHB(price)}!`;
  const description = promo.description || `${promo.title} โปรแรง รีบกดดูเลย`;

  return {
    metadataBase: new URL(SITE_URL),
    title: dynamicTitle,
    description,
    openGraph: {
      title: dynamicTitle,
      description,
      url: `${SITE_URL}/product/${id}`,
      siteName: 'All Pro',
      type: 'website',
      locale: 'th_TH',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: promo.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dynamicTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: `${SITE_URL}/product/${id}`,
    },
  };
}

export default function ProductDetailLayout({ children }: { children: ReactNode }) {
  return children;
}