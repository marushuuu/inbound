"use client";

import Link from "next/link";
import { IconChevronLeft, IconDoc } from "./icons";

/** 帳票ページ上部の操作バー(印刷時は非表示) */
export default function PrintToolbar({ backHref }: { backHref: string }) {
  return (
    <div className="mb-4 flex items-center justify-between print:hidden">
      <Link
        href={backHref}
        className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm text-ink-700 hover:bg-stone-200"
      >
        <IconChevronLeft width={18} height={18} />
        戻る
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-ink-600 sm:block">
          印刷ダイアログで「PDFとして保存」を選ぶとPDFになります
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-500 px-4 text-sm font-bold text-white hover:bg-brand-600"
        >
          <IconDoc width={16} height={16} />
          PDFとして保存 / 印刷
        </button>
      </div>
    </div>
  );
}
