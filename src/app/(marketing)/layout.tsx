import { Grain } from "@/components/brand";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Grain />
    </>
  );
}
