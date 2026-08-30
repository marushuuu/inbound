"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ProjectStatus } from "@/lib/types";
import { IconChevronLeft } from "./icons";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  new: "新規",
  hearing: "ヒアリング済",
  estimating: "見積作成中",
  presented: "見積提示中",
  contracted: "契約済",
  lost: "失注",
};

const STATUS_STYLE: Record<ProjectStatus, string> = {
  new: "bg-stone-200 text-ink-700",
  hearing: "bg-note-100 text-note-700",
  estimating: "bg-note-100 text-note-700",
  presented: "bg-brand-100 text-brand-700",
  contracted: "bg-brand-500 text-white",
  lost: "bg-stone-300 text-ink-600",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-full px-4 text-sm transition-colors ${
        selected
          ? "bg-brand-500 font-bold text-white"
          : "border border-stone-300 bg-white text-ink-700 hover:border-brand-400"
      }`}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-sm font-bold">{children}</h2>;
}

const STEPS: { label: string; href: string }[] = [
  { label: "ヒアリング", href: "hearing" },
  { label: "見積", href: "estimate" },
  { label: "施工日時", href: "schedule" },
  { label: "契約", href: "contract" },
];

export function StepNav({
  projectId,
  current,
}: {
  projectId: string;
  current: "hearing" | "estimate" | "schedule" | "contract";
}) {
  return (
    <div className="flex gap-1.5">
      {STEPS.map((step) => {
        const active = step.href === current;
        return (
          <Link
            key={step.href}
            href={`/projects/${projectId}/${step.href}`}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <span
              className={`h-1 w-full rounded-full ${
                active ? "bg-brand-500" : "bg-stone-300"
              }`}
            />
            <span
              className={`text-[11px] ${
                active ? "font-bold text-brand-600" : "text-ink-600"
              }`}
            >
              {step.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function PageHeader({
  backHref,
  title,
  subtitle,
  right,
}: {
  backHref?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label="戻る"
            className="flex size-11 items-center justify-center rounded-full hover:bg-stone-200"
          >
            <IconChevronLeft />
          </Link>
        )}
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          {subtitle && <p className="text-xs text-ink-600">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-ink-600"
    >
      {children}
    </button>
  );
}
