import Link from "next/link";
import { Logo } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="border-line border-t">
      <div className="text-meta text-ink-subtle mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row sm:px-8">
        <Logo size={20} variant="mono" />
        <p>One screen to see your life.</p>
        {/* /login lands in Phase 1; re-enable prefetch then. */}
        <Link
          href="/login"
          prefetch={false}
          className="text-ink-muted hover:text-ink rounded-control"
        >
          Sign in
        </Link>
      </div>
    </footer>
  );
}
