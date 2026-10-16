import Link from "next/link";
import { Aurora, Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { focusRing } from "@/components/ui/focus-ring";
import { cn } from "@/lib/utils";
import { MatrixIllustration } from "./matrix-illustration";

/** Slim top bar over the hero: logo left, "Sign in" right. */
export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <Link href="/" aria-label="Planzz, home" className={cn("rounded-control", focusRing)}>
        <Logo />
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <nav aria-label="Page sections" className="hidden sm:block">
          <a
            href="#features"
            className={cn(
              "rounded-control text-body text-ink-muted hover:text-ink px-2 py-1 transition-[color,background-color,border-color] duration-(--duration-fast)",
              focusRing,
            )}
          >
            Features
          </a>
        </nav>
        <Link
          href="/login"
          className={cn(
            "rounded-control text-body text-ink-muted hover:text-ink px-2 py-1 font-medium transition-[color,background-color,border-color] duration-(--duration-fast)",
            focusRing,
          )}
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}

/** The aurora fills the first viewport and rises from its bottom edge, behind the content. */
export function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-dvh overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
    >
      <Aurora variant="hero" className="h-[min(62vh,620px)]" />
    </div>
  );
}

/** Both actions go to /login until guest sign-in is wired in Phase 1. */
export function HeroActions({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center",
        className,
      )}
    >
      <Button asChild size="lg">
        <Link href="/login">Try without an account</Link>
      </Button>
      <Button asChild size="lg" variant="secondary">
        <Link href="/login">Sign in</Link>
      </Button>
    </div>
  );
}

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-[clamp(2rem,7vh,5rem)] pb-16 text-center sm:px-6 md:pb-24"
    >
      <h1
        id="hero-title"
        className="font-heading tracking-heading text-ink max-w-[16ch] text-[length:clamp(2.5rem,7vw,4.5rem)] leading-[1.04] font-semibold text-balance"
      >
        One screen to see your life
      </h1>
      <p className="text-body text-ink-muted mt-5 max-w-[52ch] text-pretty sm:text-[length:var(--text-section)] sm:leading-[var(--text-section--line-height)]">
        Planzz lays your work, study and everything else out as a matrix of axes and statuses, with
        a workspace behind each one, plus routines and reminders.
      </p>
      <HeroActions />
      <MatrixIllustration className="mt-12 md:mt-16" />
    </section>
  );
}
