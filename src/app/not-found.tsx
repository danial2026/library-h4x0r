import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-status text-text-secondary uppercase tracking-[0.15em] mb-4">
          404 · Volume not found
        </p>
        <h1 className="text-[5rem] font-light tracking-[-0.06em] leading-[0.85] mb-6">
          Missing
        </h1>
        <p className="text-body-secondary text-text-secondary mb-8 max-w-sm mx-auto">
          This volume doesn{"'"}t exist in the collection. It may have been moved or
          never shelved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background rounded-button text-button uppercase hover:opacity-90 transition-opacity"
        >
          Return to shelf
        </Link>
      </div>
    </div>
  );
}
