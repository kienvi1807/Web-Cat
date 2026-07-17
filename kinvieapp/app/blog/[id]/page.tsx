import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import BlogDetailClient from "./BlogDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data: blog } = await supabaseServer
    .from("blogs")
    .select("title, cover_image, content")
    .eq("id", id)
    .maybeSingle();

  if (!blog) {
    return { title: "Không tìm thấy bài viết | KinVie Blog" };
  }

  // Lấy đoạn text đầu tiên trong content (jsonb dạng mảng block) làm mô tả
  const firstTextBlock = Array.isArray(blog.content)
    ? blog.content.find((b: any) => b.type === "text" && b.value)
    : null;
  const shortDesc = firstTextBlock
    ? firstTextBlock.value.slice(0, 150)
    : "Đọc bài viết mới nhất từ KinVie Cattery & Beam Petshop.";

  const image = blog.cover_image || "/images/logo.jpg";

  return {
    title: `${blog.title} | KinVie Blog`,
    description: shortDesc,
    openGraph: {
      title: blog.title,
      description: shortDesc,
      images: [image],
      type: "article",
    },
  };
}

export default function Page() {
  return <BlogDetailClient />;
}