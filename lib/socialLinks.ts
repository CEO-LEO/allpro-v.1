/**
 * Social Media Link Auto-Formatter
 * แปลง ID/username เป็น URL เต็มรูปแบบ
 */

/** ตรวจสอบว่าเป็น URL แล้วหรือยัง */
function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/** แปลง LINE ID → URL */
export function formatLineUrl(value: string): string {
  if (!value.trim()) return '';
  const v = value.trim();
  if (isUrl(v)) return v;
  // ถ้าเป็น @xxx (Official Account) หรือ ID ธรรมดา
  const id = v.startsWith('@') ? v.slice(1) : v;
  return `https://line.me/ti/p/~${id}`;
}

/** แปลง Facebook username/page → URL */
export function formatFacebookUrl(value: string): string {
  if (!value.trim()) return '';
  const v = value.trim();
  if (isUrl(v)) return v;
  return `https://www.facebook.com/${v}`;
}

/** แปลง Instagram username → URL */
export function formatInstagramUrl(value: string): string {
  if (!value.trim()) return '';
  const v = value.trim();
  if (isUrl(v)) return v;
  // ลบ @ ถ้ามี
  const username = v.startsWith('@') ? v.slice(1) : v;
  return `https://www.instagram.com/${username}`;
}

/** แปลง website → URL (ใส่ https:// ถ้าไม่มี) */
export function formatWebsiteUrl(value: string): string {
  if (!value.trim()) return '';
  const v = value.trim();
  if (isUrl(v)) return v;
  return `https://${v}`;
}

/** ดึง display name จาก URL */
export function getDisplayName(url: string, fallback: string): string {
  if (!url) return fallback;
  try {
    if (isUrl(url)) {
      const u = new URL(url);
      const path = u.pathname.replace(/^\//, '').replace(/\/$/, '');
      // LINE
      if (u.hostname.includes('line.me')) {
        return path.split('/').pop() || fallback;
      }
      return path || u.hostname.replace('www.', '');
    }
  } catch {
    // ไม่ใช่ URL → ส่งค่าเดิมกลับ
  }
  return url;
}

/** Social link config สำหรับแสดงผล */
export interface SocialLinkConfig {
  key: string;
  label: string;
  value: string;
  url: string;
  color: string;
  hoverColor: string;
  bgColor: string;
  icon: 'line' | 'facebook' | 'instagram' | 'website';
}

export function getSocialLinks(social: {
  line?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}): SocialLinkConfig[] {
  const links: SocialLinkConfig[] = [];

  if (social.line?.trim()) {
    links.push({
      key: 'line',
      label: 'LINE',
      value: social.line,
      url: formatLineUrl(social.line),
      color: 'text-green-600',
      hoverColor: 'hover:bg-green-50',
      bgColor: 'bg-green-500',
      icon: 'line',
    });
  }
  if (social.facebook?.trim()) {
    links.push({
      key: 'facebook',
      label: 'Facebook',
      value: social.facebook,
      url: formatFacebookUrl(social.facebook),
      color: 'text-blue-600',
      hoverColor: 'hover:bg-blue-50',
      bgColor: 'bg-blue-600',
      icon: 'facebook',
    });
  }
  if (social.instagram?.trim()) {
    links.push({
      key: 'instagram',
      label: 'Instagram',
      value: social.instagram,
      url: formatInstagramUrl(social.instagram),
      color: 'text-pink-600',
      hoverColor: 'hover:bg-pink-50',
      bgColor: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600',
      icon: 'instagram',
    });
  }
  if (social.website?.trim()) {
    links.push({
      key: 'website',
      label: 'เว็บไซต์',
      value: social.website,
      url: formatWebsiteUrl(social.website),
      color: 'text-orange-600',
      hoverColor: 'hover:bg-orange-50',
      bgColor: 'bg-orange-500',
      icon: 'website',
    });
  }

  return links;
}
