import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function Footer({ className }: Props) {
  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 px-6 py-4",
        "flex items-center justify-between",
        "text-body-secondary text-text-secondary uppercase tracking-[0.12em]",
        className
      )}
    >
      <span>All volumes are original reference materials</span>
      <span>Wheel · Keys · Browse</span>
    </footer>
  );
}
