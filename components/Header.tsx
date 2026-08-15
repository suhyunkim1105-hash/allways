import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-accent">All</span><span className="text-brand">Ways</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm" aria-label="Main">
          <Link href="/places" className="rounded-md px-3 py-2 font-bold text-brand hover:bg-canvas">HOME</Link>
          <Link href="/map" className="rounded-md px-3 py-2 text-ink hover:bg-canvas">MAP</Link>
          <Link href="/guide" className="rounded-md px-3 py-2 text-ink hover:bg-canvas">GUIDE</Link>
          <span aria-disabled="true" title="Coming soon" className="cursor-not-allowed rounded-md px-3 py-2 text-verdict-none">Padlet <span className="text-[10px]">(soon)</span></span>
          <span aria-disabled="true" title="Coming soon" className="cursor-not-allowed rounded-md px-3 py-2 text-verdict-none">MY <span className="text-[10px]">(soon)</span></span>
        </nav>
      </div>
    </header>
  );
}
