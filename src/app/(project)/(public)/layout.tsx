import { Footer } from "@/app/components/landing-page-components/Footer";
import { Header } from "@/app/components/landing-page-components/Header";
import { Inter_Tight } from "next/font/google";

const interTight = Inter_Tight({ subsets: ["latin"] });

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={interTight.className}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
