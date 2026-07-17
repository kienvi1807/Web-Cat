// lib/utils.ts
import { supabase } from './supabase';

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

// 🎯 SUY GIỐNG TỪ CHA MẸ — dùng chung cho add-pet/edit-pet + cascade, gộp lại từ logic vốn lặp ở 2 nơi
export const getRepresentativeBreed = (breed?: string | null): string => {
  if (!breed) return 'Chưa rõ';
  if (breed.startsWith('Lai: ')) {
    const parts = breed.replace('Lai: ', '').split(' x ').map(s => s.trim());
    const specific = parts.find(p => p !== 'Mèo Ta' && p !== 'Chưa rõ');
    return specific || parts[0] || 'Chưa rõ';
  }
  return breed;
};

export const deriveBreedFromParents = (fatherBreed?: string | null, motherBreed?: string | null) => {
  const f = getRepresentativeBreed(fatherBreed);
  const m = getRepresentativeBreed(motherBreed);
  if (f === m) return { breed: f, mix1: null as string | null, mix2: null as string | null };
  return { breed: 'Giống lai khác', mix1: f, mix2: m };
};

export const parseParentRef = (id: string): { id: number | null; source: 'cat' | 'pet' } => {
  if (!id) return { id: null, source: 'pet' };
  const [prefix, num] = id.split('_');
  const parsed = parseInt(num, 10);
  return { id: isNaN(parsed) ? null : parsed, source: prefix === 'cat' ? 'cat' : 'pet' };
};

// 🎯 CASCADE (hướng B): khi breed cha/mẹ đổi, quét lại toàn bộ pets con + cháu (đệ quy) để tính lại breed.
// Chỉ áp dụng cho bảng `pets` — `cats` KHÔNG auto-derive breed từ cha mẹ (breeder tự chọn tay).
export const cascadeUpdateChildrenBreed = async (
  parentId: number,
  parentSource: 'cat' | 'pet',
  visited: Set<string> = new Set()
): Promise<void> => {
  const visitKey = `${parentSource}_${parentId}`;
  if (visited.has(visitKey)) return; // chặn vòng lặp vô hạn nếu lỡ data bị lỗi tạo chu trình cha-con
  visited.add(visitKey);

  const { data: children } = await supabase
    .from('pets')
    .select('petid, breed, father_id, mother_id, father_source, mother_source')
    .or(`and(father_id.eq.${parentId},father_source.eq.${parentSource}),and(mother_id.eq.${parentId},mother_source.eq.${parentSource})`);

  if (!children || children.length === 0) return;

  for (const child of children) {
    let fatherBreed: string | null = null;
    let motherBreed: string | null = null;

    if (child.father_id) {
      const table = child.father_source === 'cat' ? 'cats' : 'pets';
      const idCol = child.father_source === 'cat' ? 'id' : 'petid';
      const { data } = await supabase.from(table).select('breed').eq(idCol, child.father_id).maybeSingle();
      fatherBreed = data?.breed || null;
    }
    if (child.mother_id) {
      const table = child.mother_source === 'cat' ? 'cats' : 'pets';
      const idCol = child.mother_source === 'cat' ? 'id' : 'petid';
      const { data } = await supabase.from(table).select('breed').eq(idCol, child.mother_id).maybeSingle();
      motherBreed = data?.breed || null;
    }

    const result = deriveBreedFromParents(fatherBreed, motherBreed);
    const newBreed = result.breed === 'Giống lai khác' ? `Lai: ${result.mix1} x ${result.mix2}` : result.breed;

    if (newBreed !== child.breed) {
      await supabase.from('pets').update({ breed: newBreed }).eq('petid', child.petid);
    }

    // Đệ quy xuống đàn cháu — con này có thể đang là cha/mẹ của pet khác
    await cascadeUpdateChildrenBreed(child.petid, 'pet', visited);
  }
};

// 🎯 ICON HẠNG THÀNH VIÊN — DÙNG CHUNG TOÀN HỆ THỐNG, KHÔNG HARD-CODE RẢI RÁC Ở TỪNG PAGE
export const RANK_ICON_MAP: Record<string, string> = {
  'Đồng': '/images/ranks/dong.png',
  'Bạc': '/images/ranks/bac.png',
  'Vàng': '/images/ranks/vang.png',
  'Bạch Kim': '/images/ranks/bachkim.png',
  'Lục Bảo': '/images/ranks/lucbao.png',
  'Kim Cương': '/images/ranks/kimcuong.png',
};

export const getRankIcon = (rankName?: string | null) => RANK_ICON_MAP[rankName || ''] || '/images/ranks/dong.png';