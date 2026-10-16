import Link from "next/link";
import { Logo } from "@/components/brand";
import { focusRing } from "@/components/ui/focus-ring";
import { cn } from "@/lib/utils";

const linkClass = cn(
  "link-underline text-body text-ink-muted hover:text-ink rounded-sm transition-[color,background-color,border-color] duration-(--duration-fast)",
  focusRing,
);

export function Footer() {
  return (
    <footer className="border-line relative z-10 w-full border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
        <div className="flex max-w-xs flex-col gap-4">
          <Link href="/" aria-label="Planzz, home" className={cn("rounded-control w-fit", focusRing)}>
            <Logo />
          </Link>
          <p className="text-body text-ink-muted">One screen to see your life.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-3">
          <h2 className="text-card text-ink font-medium">Product</h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/#features" className={linkClass}>
                Features
              </Link>
            </li>
            <li>
              <Link href="/login" className={linkClass}>
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-line border-t">
        <p className="text-meta text-ink-subtle mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
          © {new Date().getFullYear()} Planzz
        </p>
      </div>
    </footer>
  );
}
