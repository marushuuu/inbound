"use client";

import { useState } from "react";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { useStore } from "@/lib/store";
import { APP_VERSION, VERSION_NOTES } from "@/lib/version";

/** 画像ファイルを縮小して data URL 化する(localStorage の容量を圧迫しないため) */
function fileToDataUrl(file: File, maxPx = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("読み込みに失敗しました"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("画像を解析できませんでした"));
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function SettingsPage() {
  const { company, updateCompany, ready } = useStore();
  const [error, setError] = useState<string | null>(null);

  if (!ready) return <p className="text-sm text-ink-600">読み込み中…</p>;

  const onSealSelected = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      updateCompany({ sealImage: await fileToDataUrl(file) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "画像の読み込みに失敗しました");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="会社情報(請負者)"
        subtitle="一度登録すると、すべての見積書・契約書に自動で表示されます"
      />

      <Card className="flex flex-col gap-3">
        <SectionTitle>基本情報</SectionTitle>
        {(
          [
            ["会社名", "name", "例: 株式会社〇〇リフォーム"],
            ["住所", "address", "例: 東京都〇〇区〇〇 1-2-3"],
            ["代表者名", "representative", "例: 山田 太郎"],
          ] as const
        ).map(([label, key, placeholder]) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-[13px] text-ink-600">{label}</span>
            <input
              value={company[key]}
              onChange={(e) => updateCompany({ [key]: e.target.value })}
              placeholder={placeholder}
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </label>
        ))}
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle>印鑑画像(社印)</SectionTitle>
        {company.sealImage ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.sealImage}
              alt="登録済みの印鑑"
              className="size-24 rounded-lg border border-stone-200 bg-white object-contain"
            />
            <button
              type="button"
              onClick={() => updateCompany({ sealImage: null })}
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-[13px] text-ink-700"
            >
              削除
            </button>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-ink-600">
            背景が白または透過のPNG/JPGを推奨します。長辺400pxに自動縮小して保存します。
          </p>
        )}
        <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-stone-300 text-sm font-medium text-ink-700 hover:border-brand-400">
          {company.sealImage ? "印鑑画像を選び直す" : "印鑑画像をアップロード"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onSealSelected(e.target.files?.[0])}
          />
        </label>
        {error && <p className="text-xs font-bold text-note-700">{error}</p>}
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle>受注時粗利の目標</SectionTitle>
        <p className="text-xs leading-relaxed text-ink-600">
          見積画面で、この値を下回ると警告が出ます。業界の目安は契約時34〜35%ですが、
          会社ごとの実態に合わせて設定してください。
        </p>
        <label className="flex items-center gap-2">
          <span className="text-[13px] text-ink-600">目標粗利率</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.5}
            value={company.targetMarginRate}
            onChange={(e) =>
              updateCompany({
                targetMarginRate: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
              })
            }
            className="min-h-11 w-24 rounded-lg border border-stone-300 px-3 text-right text-sm font-bold focus:border-brand-500 focus:outline-none"
          />
          <span className="text-[13px] text-ink-600">%</span>
        </label>
      </Card>

      {/* このアプリの版数(手元のビルドが最新か確認するため) */}
      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <SectionTitle>アプリのバージョン</SectionTitle>
          <span className="rounded-md bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
            {APP_VERSION}
          </span>
        </div>
        <p className="text-xs text-ink-600">この版で入った変更:</p>
        <ul className="list-disc pl-5 text-xs leading-relaxed text-ink-700">
          {VERSION_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Card>

      {/* 契約書での見え方プレビュー */}
      <Card className="flex flex-col gap-2">
        <SectionTitle>契約書での表示イメージ</SectionTitle>
        <div className="relative rounded-lg border border-stone-200 p-3 text-[13px] leading-relaxed">
          <div className="text-xs font-bold text-ink-600">乙(請負者)</div>
          <div className="mt-1">{company.name || "〔会社名〕"}</div>
          <div className="text-ink-600">{company.address || "〔住所〕"}</div>
          <div className="mt-1">
            代表者 {company.representative || "〔代表者名〕"}
          </div>
          {company.sealImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={company.sealImage}
              alt="印"
              className="absolute right-4 bottom-4 size-14 object-contain"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
