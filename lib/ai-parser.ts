import { Promotion } from './types'; // Assuming there is a types file, otherwise I will define it.

export interface ParsedPromotion {
  shopName: string;
  promotionDetails: string;
  expirationDate: string | null;
  location: {
    lat?: number;
    lng?: number;
    address?: string;
    zone?: string;
  };
  confidence: number;
  originalSource: string; // 'facebook_post' | 'image_text'
}

export interface TaggingResult {
  tags: string[];
  categories: string[];
}

// Mock database of existing promotions for de-duplication check
const EXISTING_PROMOTIONS: ParsedPromotion[] = [
  {
    shopName: 'Auntie Anne\'s',
    promotionDetails: 'Buy 2 Get 1 Free on all pretzels',
    expirationDate: '2023-12-31',
    location: { address: 'Central World, Floor 3' },
    confidence: 0.95,
    originalSource: 'system',
  },
  {
    shopName: 'MK Restaurants',
    promotionDetails: 'Family set 599 THB',
    expirationDate: '2024-01-15',
    location: { address: 'Siam Paragon' },
    confidence: 0.98,
    originalSource: 'system',
  }
];

/**
 * Simulates AI parsing of raw text input (e.g. from Facebook post or OCR)
 */
export async function parseRawInput(text: string): Promise<ParsedPromotion> {
  // In a real system, this would call an LLM (GPT-4, Claude, etc.)
  // For this demo, we'll use simple heuristics to extract data
  
  const shopNameMatch = text.match(/(?:at|@|ร้าน)\s*([^\n\r]+)/i) || 
                        text.match(/^([^\n\r]+)/); // First line as fallback
                        
  const dateMatch = text.match(/(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s*\d{2,4})/i) ||
                    text.match(/(\d{2}\/\d{2}\/\d{4})/);

  const locationMatch = text.match(/(?:at|near|location|พิกัด|ที่)\s*([^\n\r]+)/i);

  // Extract details - usually the longest remaining text or specific keywords
  const details = text.replace(shopNameMatch?.[0] || '', '')
                      .replace(dateMatch?.[0] || '', '')
                      .replace(locationMatch?.[0] || '', '')
                      .trim();

  return {
    shopName: shopNameMatch ? shopNameMatch[1].trim() : 'Unknown Shop',
    promotionDetails: details || text, // Fallback to full text
    expirationDate: dateMatch ? dateMatch[0] : null,
    location: {
      address: locationMatch ? locationMatch[1].trim() : undefined,
    },
    confidence: 0.85, // Mock confidence score
    originalSource: 'text_input'
  };
}

/**
 * Checks for duplicates using fuzzy matching (simulated)
 */
export function checkDuplicates(newPromo: ParsedPromotion): { isDuplicate: boolean; similarMatch?: ParsedPromotion; similarityScore: number } {
  let highestScore = 0;
  let bestMatch: ParsedPromotion | undefined;

  for (const existing of EXISTING_PROMOTIONS) {
    // Simple Jaccard similarity or substring check for demo
    const nameSimilarity = calculateSimilarity(newPromo.shopName, existing.shopName);
    const detailSimilarity = calculateSimilarity(newPromo.promotionDetails, existing.promotionDetails);
    
    // Average score
    const totalScore = (nameSimilarity + detailSimilarity) / 2;
    
    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestMatch = existing;
    }
  }

  // Threshold for duplicate
  const DUPLICATE_THRESHOLD = 0.6;

  return {
    isDuplicate: highestScore > DUPLICATE_THRESHOLD,
    similarMatch: bestMatch,
    similarityScore: highestScore
  };
}

function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Basic word overlap
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Generates tags based on content analysis
 */
export function generateSmartTags(promo: ParsedPromotion): TaggingResult {
  const text = `${promo.shopName} ${promo.promotionDetails} ${promo.location.address || ''}`.toLowerCase();
  const tags: string[] = [];
  const categories: string[] = [];

  // Categorization Rules
  if (text.match(/food|buffet|restaurant|cafe|coffee|drink|อาหาร|บุฟเฟ่ต์|กาแฟ/)) {
    categories.push('Food & Beverage');
    tags.push('#ของกิน', '#อร่อยบอกต่อ');
  }
  if (text.match(/sale|discount|off|ลดราคา|โปรโมชั่น|แถม/)) {
    categories.push('Shopping');
    tags.push('#ลดแรง', '#Promotion');
  }
  if (text.match(/clothing|shirt|dress|fashion|เสื้อผ้า|แฟชั่น/)) {
    categories.push('Fashion');
    tags.push('#Fashion', '#OOTD');
  }

  // SME/Local detection
  if (!text.match(/starbucks|kfc|mcdonald|uniqlo|h&m/)) {
    tags.push('#SME', '#ร้านเล็กๆแต่น่ารัก');
  }

  // Location based tags
  if (promo.location.address) {
    tags.push(`#${promo.location.address.split(' ')[0]}`); // Simple first word location tag
    tags.push('#ใกล้ฉัน'); // "Near Me" - usually dynamic based on user location, but static here
  }

  return {
    tags: [...new Set(tags)], // Unique tags
    categories: [...new Set(categories)]
  };
}
