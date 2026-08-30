"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IconCatalog, IconClock, IconHome, IconSearch } from "./icons";

const NAV = [
  { href: "/", label: "案件", icon: IconHome },
  { href: "/search", label: "見積検索", icon: IconSearch },
  { href: "/catalog", label: "カタログ", icon: IconCatalog },
  { href: "/works", label: "工事マスタ", icon: IconClock },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname.startsWith("/projects");
  return pathname.startsWith(href);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      {/* デスクトップ: ダークサイドバー */}
      <aside className="hidden w-56 shrink-0 flex-col bg-ink-800 text-stone-300 print:hidden lg:flex">
        <div className="flex h-14 items-center gap-2 bg-brand-500 px-4 text-white">
          <span className="text-lg font-bold tracking-wide">リフォーム営業</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  active
                    ? "bg-ink-900 font-bold text-white"
                    : "hover:bg-ink-700 hover:text-white"
                }`}
              >
                <Icon width={18} height={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4 text-xs text-stone-500">
          MVP プレビュー
          <br />
          データは端末内に保存されます
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* モバイル: レッドトップバー */}
        <header className="flex h-12 items-center justify-between bg-brand-500 px-4 text-white print:hidden lg:hidden">
          <span className="text-base font-bold tracking-wide">リフォーム営業</span>
          <span className="rounded-full bg-note-500 px-2 py-0.5 text-xs font-bold text-ink-900">
            MVP
          </span>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4 print:max-w-none print:p-0 lg:max-w-5xl lg:px-8 lg:pb-8">
          {children}
        </main>

        {/* モバイル: ボトムナビ */}
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-stone-200 bg-white print:hidden lg:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${
                  active ? "font-bold text-brand-600" : "text-ink-600"
                }`}
              >
                <Icon width={22} height={22} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
