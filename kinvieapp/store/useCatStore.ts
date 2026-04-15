import { create } from 'zustand';

interface CatState {
  translateEMS: (code: string) => string;
}

// Lấy đúng tên từ Database của sếp
const baseColors: Record<string, string> = {
  'a': 'Blue', 'b': 'Chocolate', 'c': 'Lilac', 'd': 'Red',
  'e': 'Cream', 'f': 'Black Tortie', 'g': 'Blue Tortie',
  'h': 'Chocolate Tortie', 'j': 'Lilac Tortie', 'n': 'Black'
};

const patterns: Record<string, string> = {
  '01': 'Van', '02': 'Harlequin', '03': 'Bicolor', '09': 'White Spotting',
  '11': 'Shaded', '12': 'Shell / Chinchilla', '21': 'Tabby',
  '22': 'Classic Tabby', '23': 'Mackerel Tabby', '24': 'Spotted Tabby'
};

export const useCatStore = create<CatState>(() => ({
  translateEMS: (code) => {
    if (!code || code === 'EMPTY') return 'Chưa cập nhật màu';

    let result = '';
    const cleanCode = code.toLowerCase().trim();

    // Tách phần chữ và phần số (VD: "ns 24" -> letters: "ns", numbers: "24")
    const parts = cleanCode.split(' ');
    const letters = parts[0] || '';
    const numbers = parts[1] || '';

    // 1. Dịch màu gốc (Chữ cái đầu)
    const baseChar = letters[0];
    if (baseColors[baseChar]) result += baseColors[baseChar];

    // 2. Dịch modifier (Chữ cái thứ 2)
    if (letters.includes('s')) result += ' Silver';
    if (letters.includes('y')) result += ' Golden';

    // 3. Dịch hoa văn (Pattern)
    if (numbers && patterns[numbers]) {
      result += ' ' + patterns[numbers];
    }

    return result || code.toUpperCase(); // Trả về dạng ghép hoàn chỉnh
  }
}));