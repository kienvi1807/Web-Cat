import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import CatDetailClient from "./CatDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: cat } = await supabaseServer
    .from("cats")
    .select("name, breed, color, images")
    .eq("id", id)
    .maybeSingle();

  if (!cat) {
    return { title: "Không tìm thấy mèo | KinVie" };
  }

  const image = cat.images?.[0] || "/images/logo.jpg";

  return {
    title: `${cat.name} - Mèo ${cat.breed} | KinVie Cattery`,
    description: `Bé ${cat.name}, giống ${cat.breed}, màu ${cat.color}. Xem chi tiết phả hệ và thông tin tại KinVie Cattery.`,
    openGraph: {
      title: `${cat.name} - KinVie Cattery`,
      description: `Bé ${cat.name}, giống ${cat.breed}, màu ${cat.color}.`,
      images: [image],
      type: "website",
    },
  };
}

export default function Page() {
  return <CatDetailClient />;
}