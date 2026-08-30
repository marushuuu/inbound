"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { SEED_PROJECTS } from "./data";
import { DEFAULT_TASK_IDS, WORK_ITEMS } from "./workmaster";
import {
  EMPTY_COMPANY_PROFILE,
  type CompanyProfile,
  type Hearing,
  type HistoryRecord,
  type Project,
  type WorkItem,
} from "./types";

const STORAGE_KEY = "reform-app.projects.v1";
const WORKS_KEY = "reform-app.works.v2";
const COMPANY_KEY = "reform-app.company.v1";
/** 旧バージョン(手書き署名のみ)のキー。会社情報へ引き継ぐ */
const LEGACY_SIGNATURE_KEY = "reform-app.companySignature.v1";

/** 旧形式(yearMonth: "YYYY-MM")の履歴レコードを year/month 独立形式へ移行する */
function normalizeHistoryRecord(r: unknown, i: number): HistoryRecord {
  const raw = (r ?? {}) as Record<string, unknown>;
  if (typeof raw.year === "number" || raw.year === null) {
    return raw as unknown as HistoryRecord;
  }
  const ym = typeof raw.yearMonth === "string" ? raw.yearMonth : "";
  const m = ym.match(/^(\d{4})-(\d{2})$/);
  return {
    id: typeof raw.id === "string" ? raw.id : `h-migrated-${i}`,
    year: m ? Number(m[1]) : null,
    month: m ? Number(m[2]) : null,
    description: typeof raw.description === "string" ? raw.description : "",
    source: raw.source === "andpad" ? "andpad" : "manual",
  };
}

/** 旧バージョンで保存されたヒアリングデータを現行の形式に補完する */
function normalizeHearing(h: unknown): Hearing {
  const raw = (h ?? {}) as Record<string, unknown>;
  if (Array.isArray(raw.history) && "timingFrom" in raw) {
    return {
      ...(raw as unknown as Hearing),
      history: raw.history.map(normalizeHistoryRecord),
    };
  }
  // さらに旧い形式(budget/timing/historyが文字列)からの移行
  const legacyHistory = typeof raw.history === "string" ? raw.history : "";
  return {
    triggers: Array.isArray(raw.triggers) ? (raw.triggers as string[]) : [],
    budget: typeof raw.budget === "number" ? raw.budget : null,
    timingFrom: null,
    timingTo: null,
    history:
      legacyHistory && legacyHistory !== "なし"
        ? [
            {
              id: `h-legacy-${Date.now()}`,
              year: null,
              month: null,
              description: legacyHistory,
              source: "manual" as const,
            },
          ]
        : [],
    riskMemo: typeof raw.riskMemo === "string" ? raw.riskMemo : "",
  };
}

/** 旧バージョンで保存されたデータに新フィールドを補完する */
function normalizeProject(p: Project): Project {
  return {
    ...p,
    hearing: normalizeHearing(p.hearing),
    taskIds: p.taskIds ?? DEFAULT_TASK_IDS,
    estimateLines: p.estimateLines ?? null,
    siteAddress: p.siteAddress ?? "",
    paymentTerms: p.paymentTerms ?? "完工後 一括",
    schedule: p.schedule ?? null,
    contract: {
      ...p.contract,
      contractorSignature: p.contract?.contractorSignature ?? null,
      contractorProfile: p.contract?.contractorProfile ?? null,
    },
  };
}

/** 工事マスタは単価・単位が増えたため、保存済みの所要時間だけを引き継ぐ */
function mergeWorks(saved: unknown): WorkItem[] {
  if (!Array.isArray(saved)) return WORK_ITEMS;
  const savedById = new Map<string, Record<string, unknown>>(
    saved
      .filter((w): w is Record<string, unknown> => Boolean(w) && typeof w === "object")
      .map((w) => [String(w.id), w]),
  );
  return WORK_ITEMS.map((base) => {
    const s = savedById.get(base.id);
    if (!s) return base;
    return {
      ...base,
      durationMinutes:
        typeof s.durationMinutes === "number" ? s.durationMinutes : base.durationMinutes,
      unitPrice: typeof s.unitPrice === "number" ? s.unitPrice : base.unitPrice,
    };
  });
}

interface Store {
  projects: Project[];
  works: WorkItem[];
  company: CompanyProfile;
  ready: boolean;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addProject: (project: Project) => void;
  updateWork: (id: string, patch: Partial<WorkItem>) => void;
  updateCompany: (patch: Partial<CompanyProfile>) => void;
  reset: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [works, setWorks] = useState<WorkItem[]>(WORK_ITEMS);
  const [company, setCompany] = useState<CompanyProfile>(EMPTY_COMPANY_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // localStorage は SSR では読めないため、マウント後の1回だけ同期する
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setProjects((JSON.parse(raw) as Project[]).map(normalizeProject));

      const rawWorks = window.localStorage.getItem(WORKS_KEY);
      if (rawWorks) setWorks(mergeWorks(JSON.parse(rawWorks)));

      const rawCompany = window.localStorage.getItem(COMPANY_KEY);
      if (rawCompany) {
        setCompany({ ...EMPTY_COMPANY_PROFILE, ...JSON.parse(rawCompany) });
      } else {
        // 旧バージョンで登録済みの手書き署名があれば引き継ぐ
        const legacy = window.localStorage.getItem(LEGACY_SIGNATURE_KEY);
        if (legacy) setCompany({ ...EMPTY_COMPANY_PROFILE, signature: legacy });
      }
    } catch {
      // 保存データが読めない場合はシードデータのまま続行
    }
    setReady(true);
  }, []);

  const persistProjects = useCallback((next: Project[]) => {
    setProjects(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ストレージ不可の環境ではメモリ上の状態のみで動作
    }
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // noop
      }
      return next;
    });
  }, []);

  const addProject = useCallback(
    (project: Project) => {
      persistProjects([project, ...projects]);
    },
    [persistProjects, projects],
  );

  const updateWork = useCallback((id: string, patch: Partial<WorkItem>) => {
    setWorks((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, ...patch } : w));
      try {
        window.localStorage.setItem(WORKS_KEY, JSON.stringify(next));
      } catch {
        // noop
      }
      return next;
    });
  }, []);

  const updateCompany = useCallback((patch: Partial<CompanyProfile>) => {
    setCompany((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(COMPANY_KEY, JSON.stringify(next));
      } catch {
        // noop
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(WORKS_KEY);
    } catch {
      // noop
    }
    setProjects(SEED_PROJECTS);
    setWorks(WORK_ITEMS);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        projects,
        works,
        company,
        ready,
        updateProject,
        addProject,
        updateWork,
        updateCompany,
        reset,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}

export function useProject(id: string): Project | undefined {
  return useStore().projects.find((p) => p.id === id);
}
