"use client";

import Link from "next/link";
import { useState } from "react";
import { IconCalendar, IconPlus } from "@/components/icons";
import { Card, StatusBadge, STATUS_LABEL } from "@/components/ui";
import { useStore } from "@/lib/store";
import { DEFAULT_TASK_IDS } from "@/lib/workmaster";
import type { Project, ProjectStatus } from "@/lib/types";

const FILTERS: (ProjectStatus | "all")[] = [
  "all",
  "new",
  "hearing",
  "presented",
  "contracted",
];

export default function ProjectListPage() {
  const { projects, addProject, reset } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [creating, setCreating] = useState(false);
  const [customer, setCustomer] = useState("");
  const [workTitle, setWorkTitle] = useState("");

  const visible =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const create = () => {
    if (!customer.trim()) return;
    const project: Project = {
      id: `p-${Date.now()}`,
      customer: customer.trim(),
      workTitle: workTitle.trim() || "工事内容 未設定",
      meta: "新規登録",
      status: "new",
      nextAction: "ヒアリング実施",
      hearing: {
        triggers: [],
        budget: null,
        timingFrom: null,
        timingTo: null,
        history: [],
        riskMemo: "",
      },
      selectedPattern: "take",
      equipmentChoice: {},
      taskIds: DEFAULT_TASK_IDS,
      estimateLines: null,
      siteAddress: "",
      paymentTerms: "完工後 一括",
      schedule: null,
      contract: {
        checks: [false, false, false],
        signature: null,
        contractorProfile: null,
        contractedAt: null,
      },
    };
    addProject(project);
    setCustomer("");
    setWorkTitle("");
    setCreating(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">案件</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-lg px-3 text-xs text-ink-600 hover:bg-stone-200"
          >
            デモデータに戻す
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-500 px-4 text-sm font-bold text-white hover:bg-brand-600"
          >
            <IconPlus width={16} height={16} />
            案件作成
          </button>
        </div>
      </div>

      {creating && (
        <Card className="mb-4">
          <div className="flex flex-col gap-3">
            <div className="text-sm font-bold">新規案件</div>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="顧客名(例: 山田様邸)"
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-sm focus:border-brand-500 focus:outline-none"
            />
            <input
              value={workTitle}
              onChange={(e) => setWorkTitle(e.target.value)}
              placeholder="工事内容(例: 浴室・洗面改装工事)"
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-sm focus:border-brand-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={create}
                className="min-h-11 flex-1 rounded-lg bg-brand-500 text-sm font-bold text-white hover:bg-brand-600"
              >
                作成
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="min-h-11 flex-1 rounded-lg border border-stone-300 text-sm text-ink-700"
              >
                キャンセル
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`min-h-9 rounded-full px-3.5 text-[13px] ${
              filter === f
                ? "bg-brand-500 font-bold text-white"
                : "border border-stone-300 bg-white text-ink-700"
            }`}
          >
            {f === "all" ? "すべて" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {visible.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <Card className="flex flex-col gap-2 transition-colors hover:border-brand-400">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold">{p.customer}</span>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex items-center justify-between text-[13px] text-ink-600">
                <span>
                  {p.workTitle}｜{p.meta}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-brand-600">
                <IconCalendar width={15} height={15} />
                {p.nextAction}
              </div>
            </Card>
          </Link>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-ink-600">該当する案件はありません。</p>
        )}
      </div>
    </div>
  );
}
