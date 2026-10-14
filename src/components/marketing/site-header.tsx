import Link from "next/link";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
      <Link href="/" aria-label="Planzz home" className="rounded-control">
        <Logo size={26} />
      </Link>
      <Button asChild variant="secondary" size="sm">
        {/* /login lands in Phase 1; re-enable prefetch then. */}
        <Link href="/login" prefetch={false}>
          Sign in
        </Link>
      </Button>
    </header>
  );
}
