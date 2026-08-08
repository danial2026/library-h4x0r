import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function Header({ className }: Props) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 py-5",
        "flex items-center justify-between",
        className
      )}
    >
      <div className="flex items-baseline gap-3">
        <h1 className="text-title uppercase tracking-[0.15em]">Library</h1>
        <span className="text-status text-text-secondary uppercase tracking-[0.12em]">
          Edition 01 · 2026
        </span>
      </div>
      <p className="text-status text-text-secondary uppercase tracking-[0.12em] max-w-[260px] text-right">
        A curated collection of technical volumes
      </p>
    </header>
  );
}
