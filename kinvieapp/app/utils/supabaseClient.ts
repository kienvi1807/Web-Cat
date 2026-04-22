import { createClient } from '@supabase/supabase-js'

// Lấy URL và Key từ file .env.local của sếp (hoặc sếp có thể dán trực tiếp chuỗi URL/Key vào đây cũng được)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'ĐIỀN_URL_SUPABASE_CỦA_SẾP_VÀO_ĐÂY';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ĐIỀN_ANON_KEY_CỦA_SẾP_VÀO_ĐÂY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);