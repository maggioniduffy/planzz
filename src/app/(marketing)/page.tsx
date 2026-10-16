import type { Metadata } from "next";
import { Footer } from "@/components/marketing/footer";
import { Hero, HeroBackdrop, SiteHeader } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/sections";

const title = "Planzz";
const description =
  "One screen to see your life. A matrix of axes and statuses, with workspaces, routines, reminders, a calendar and an AI assistant you control.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website", siteName: "Planzz" },
};

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative">
        <HeroBackdrop />
        <SiteHeader />
        <main className="overflow-x-clip">
          <Hero />
          <Features />
        </main>
      </div>
      <Footer />
    </div>
  );
}
