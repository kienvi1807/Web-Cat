import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import PetDetailClient from "./PetDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data: pet } = await supabaseServer
    .from("pets")
    .select("petname, breed, imageurl, description")
    .eq("petid", id)
    .maybeSingle();

  if (!pet) {
    return { title: "Không tìm thấy thú cưng | KinVie" };
  }

  const image = pet.imageurl || "/images/logo.jpg";
  const shortDesc = pet.description
    ? pet.description.slice(0, 150)
    : `Bé ${pet.petname} - giống ${pet.breed || "chưa rõ"}. Xem hồ sơ đầy đủ tại KinVie.`;

  return {
    title: `${pet.petname} | KinVie`,
    description: shortDesc,
    openGraph: {
      title: `${pet.petname} - ${pet.breed || "Boss nhà mình"}`,
      description: shortDesc,
      images: [image],
      type: "website",
    },
  };
}

export default function Page() {
  return <PetDetailClient />;
}