import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const metadata = { title: "過去見積の検索" };

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-600">読み込み中…</p>}>
      <SearchClient />
    </Suspense>
  );
}
