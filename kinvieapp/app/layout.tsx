import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand, Dancing_Script, Lora } from "next/font/google";
import "./globals.css";
import GlobalLoading from "@/components/layout/GlobalLoading";
import { supabaseServer } from "@/lib/supabase-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-quicksand',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-dancing-script',
  display: 'swap',
});

const lora = Lora({
  weight: ['500'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'vietnamese'], // Lora hỗ trợ vietnamese subset, giữ đúng như bản @import cũ
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "KinVie Cattery & Beam Petshop",
    template: "%s | KinVie",
  },
  description: "Trại mèo Maine Coon thuần chủng & cửa hàng dinh dưỡng thú cưng tại Hải Phòng.",
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: settings } = await supabaseServer
    .from('system_settings')
    .select('theme_mode')
    .eq('id', 1)
    .maybeSingle();

  const isDark = settings?.theme_mode === 'dark';

  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${quicksand.variable} ${dancingScript.variable} ${lora.variable} h-full antialiased ${isDark ? 'dark' : ''}`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalLoading />
        {children}
      </body>
    </html>
  );
}