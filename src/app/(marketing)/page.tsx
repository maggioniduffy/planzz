import { Features, Hero, SiteFooter, SiteHeader } from "@/components/marketing";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-10">
          <SiteHeader />
        </div>
        <Hero />
      </div>
      <main className="flex-1">
        <Features />
      </main>
      <SiteFooter />
    </div>
  );
}
