import Link from "next/link";
import { Aurora } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { MatrixPreview } from "./matrix-preview";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden">
      <Aurora className="h-full" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-5 pt-28 pb-20 text-center sm:px-8 sm:pt-32 sm:pb-28">
        <h1 className="font-heading tracking-heading text-ink max-w-3xl text-[clamp(2.25rem,7vw,4.5rem)] leading-[1.05] font-semibold text-balance">
          One screen to see your life
        </h1>
        <p className="text-card text-ink-muted mt-5 max-w-xl text-pretty">
          Planzz lays out work, study and everything else as one matrix, so you can see what is
          moving and what is stuck.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          {/* Guest sign-in is wired in Phase 1; /login?guest=1 will start an anonymous session. */}
          {/* /login lands in Phase 1; re-enable prefetch then. */}
          <Button asChild size="lg">
            <Link href="/login?guest=1" prefetch={false}>
              Try without an account
            </Link>
          </Button>
          {/* /login lands in Phase 1; re-enable prefetch then. */}
          <Button asChild variant="secondary" size="lg">
            <Link href="/login" prefetch={false}>
              Sign in
            </Link>
          </Button>
        </div>
        <MatrixPreview className="mt-12 w-full max-w-3xl text-left sm:mt-16" />
      </div>
    </section>
  );
}
