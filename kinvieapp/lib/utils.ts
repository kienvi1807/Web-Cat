// lib/utils.ts

export const ALL_BREEDS = ['Maine Coon', 'Anh lông ngắn (ALN)', 'Anh lông dài (ALD)', 'Ba Tư', 'Sphynx', 'Mèo Ta', 'Giống lai khác', 'Chưa rõ'];

export const SIMPLE_COLORS = [
  { id: 'Vàng cam', name: 'Vàng cam (Ginger)' },
  { id: 'Trắng', name: 'Trắng tuyền (White)' },
  { id: 'Đen', name: 'Đen tuyền (Black)' },
  { id: 'Mướp / Vằn', name: 'Mướp / Vằn (Tabby)' },
  { id: 'Nhị thể', name: 'Nhị thể (Bicolor)' },
  { id: 'Tam thể', name: 'Tam thể (Calico)' },
  { id: 'Đồi mồi', name: 'Đồi mồi (Tortie)' },
  { id: 'Màu pha khác', name: 'Màu pha khác' }
];

export const formatEmsCode = (code: string) => {
  if (!code) return 'Chưa rõ';
  if (code.includes(' ') || code.length > 5) return code;
  const baseColors: Record<string, string> = { 'a': 'Blue', 'b': 'Chocolate', 'c': 'Lilac', 'd': 'Red', 'e': 'Cream', 'f': 'Black Tortie', 'g': 'Blue Tortie', 'h': 'Chocolate Tortie', 'j': 'Lilac Tortie', 'n': 'Black' };
  const patterns: Record<string, string> = { '01': 'Van', '02': 'Harlequin', '03': 'Bicolor', '09': 'White Spotting', '11': 'Shaded', '12': 'Shell', '21': 'Tabby', '22': 'Classic Tabby', '23': 'Mackerel Tabby', '24': 'Spotted Tabby' };
  let result = [];
  let base = code[0].toLowerCase();
  if (baseColors[base]) result.push(baseColors[base]); else return code;
  if (code.toLowerCase().includes('s')) result.push('Silver');
  const patternMatch = code.match(/\d{2}/);
  if (patternMatch && patterns[patternMatch[0]]) result.push(patterns[patternMatch[0]]);
  return result.join(' ');
};

export const formatDateDisplay = (dateString: string) => {
  if (!dateString) return ''; 
  const [year, month, day] = dateString.split('-'); 
  return `${day}/${month}/${year}`;
};

export const getAvatarColor = (name: string) => {
  const colors = [
    'bg-gradient-to-br from-purple-500 to-indigo-500', 
    'bg-gradient-to-br from-fuchsia-500 to-pink-500', 
    'bg-gradient-to-br from-blue-500 to-cyan-500', 
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-rose-500 to-orange-500'
  ];
  const charCode = (name || 'A').charCodeAt(0);
  return colors[charCode % colors.length];
};

// 🎯 NHẬN DIỆN NỀN TẢNG ĐỐI TÁC (SHOPEE / TIKTOK) TỪ AFFILIATE_URL
export type AffiliatePlatform = 'shopee' | 'tiktok' | 'other';

export const getAffiliatePlatform = (url?: string | null): AffiliatePlatform => {
  if (!url) return 'other';
  const lower = url.toLowerCase();
  if (lower.includes('shopee')) return 'shopee';
  if (lower.includes('tiktok')) return 'tiktok';
  return 'other';
};

export const AFFILIATE_PLATFORM_META: Record<AffiliatePlatform, { label: string; badgeClass: string; icon: string }> = {
  shopee: { label: 'Shopee', badgeClass: 'bg-[#EE4D2D]', icon: '🛍️' },
  tiktok: { label: 'TikTok', badgeClass: 'bg-black', icon: '🎵' },
  other: { label: 'Đối Tác', badgeClass: 'bg-gradient-to-r from-orange-500 to-rose-500', icon: '🔗' },
};