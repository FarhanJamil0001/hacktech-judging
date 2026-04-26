import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-htech-orange-border/40 bg-htech-bg/85 backdrop-blur no-print">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-htech-text-strong">
            <span className="bg-htech-gradient bg-clip-text text-transparent">
              HackTech
            </span>{" "}
            Expo
          </span>
        </Link>
        <div className="flex items-center gap-4 font-display text-sm">
          <Link
            href="/"
            className="text-htech-text hover:text-htech-orange transition"
          >
            Projects
          </Link>
          <Link
            href="/tables/1"
            className="text-htech-text hover:text-htech-orange transition"
          >
            Tables
          </Link>
        </div>
      </div>
    </nav>
  );
}
