import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  // 🔒 Bảo vệ endpoint, chỉ Vercel Cron được gọi
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const in7Days = new Date(today); in7Days.setDate(today.getDate() + 7);
  const todayStr = today.toISOString().split('T')[0];
  const in7DaysStr = in7Days.toISOString().split('T')[0];

  // 1. NHẮC SẮP TỚI NGÀY DỰ SINH (còn ~7 ngày)
  const { data: dueSoon } = await supabaseServer
    .from('breeding_records')
    .select('id, mother_id, expected_due_date, cats:mother_id(name, breeder_id)')
    .eq('status', 'mang_thai')
    .eq('due_reminder_sent', false)
    .lte('expected_due_date', in7DaysStr)
    .gte('expected_due_date', todayStr);

  for (const rec of dueSoon || []) {
    const cat = rec.cats as any;
    await supabaseServer.from('notifications').insert({
      user_id: cat.breeder_id,
      title: 'Sắp tới ngày dự sinh 🐈',
      content: `Bé ${cat.name} dự kiến sinh vào ${rec.expected_due_date}. Chuẩn bị ổ đẻ nhé Sen!`,
      type: 'system',
      link: `/dashboard/cats/health`,
    });
    await supabaseServer.from('breeding_records').update({ due_reminder_sent: true }).eq('id', rec.id);
  }

  // 2. NHẮC ĐÃ ĐẾN NGÀY KHUYẾN NGHỊ PHỐI GIỐNG LẠI
  const { data: allDone } = await supabaseServer
    .from('breeding_records')
    .select('id, mother_id, actual_birth_date, expected_due_date, rest_reminder_sent, cats:mother_id(name, breeder_id)')
    .eq('status', 'da_sinh')
    .eq('rest_reminder_sent', false);

  for (const rec of allDone || []) {
    const baseDate = new Date(rec.actual_birth_date || rec.expected_due_date);
    baseDate.setDate(baseDate.getDate() + 240);
    if (baseDate <= today) {
      const cat = rec.cats as any;
      await supabaseServer.from('notifications').insert({
        user_id: cat.breeder_id,
        title: 'Đã đủ thời gian nghỉ ngơi 💕',
        content: `Bé ${cat.name} đã nghỉ đủ thời gian khuyến nghị, có thể cân nhắc phối giống lứa tiếp theo.`,
        type: 'system',
        link: `/dashboard/cats/health`,
      });
      await supabaseServer.from('breeding_records').update({ rest_reminder_sent: true }).eq('id', rec.id);
    }
  }

  return NextResponse.json({ success: true, checked: (dueSoon?.length || 0) + (allDone?.length || 0) });
}