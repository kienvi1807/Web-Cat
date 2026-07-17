import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import ProductDetailClient from "./ProductDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data: product } = await supabaseServer
    .from("products")
    .select("name, description, price, imageurl, images, brand")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    return { title: "Không tìm thấy sản phẩm | Beam Petshop" };
  }

  // Ưu tiên ảnh trong mảng images, fallback về imageurl, cuối cùng mới về logo
  const image = product.images?.[0] || product.imageurl || "/images/logo.jpg";

  const shortDesc = product.description
    ? product.description.slice(0, 150)
    : `${product.name} - chính hãng, giá tốt tại Beam Petshop.`;

  return {
    title: `${product.name} | Beam Petshop`,
    description: shortDesc,
    openGraph: {
      title: product.name,
      description: shortDesc,
      images: [image],
      type: "website",
    },
  };
}

export default function Page() {
  return <ProductDetailClient />;
}