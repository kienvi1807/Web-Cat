import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "KinVie Cattery & Beam Petshop | Trại Mèo Maine Coon & Pate Cho Mèo Hải Phòng",
  description: "KinVie Cattery - trại nhân giống mèo Maine Coon thuần chủng tại Hải Phòng. Beam Petshop chuyên pate, hạt, cát vệ sinh cho mèo. Uy tín, khỏe mạnh, chuẩn phả hệ.",
  openGraph: {
    title: "KinVie Cattery & Beam Petshop",
    description: "Trại mèo Maine Coon thuần chủng & cửa hàng dinh dưỡng thú cưng tại Hải Phòng.",
    url: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    siteName: "KinVie",
    images: ["/images/logo.jpg"],
    locale: "vi_VN",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}