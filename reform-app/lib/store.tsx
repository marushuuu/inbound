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
import type { Project, WorkItem } from "./types";

const STORAGE_KEY = "reform-app.projects.v1";
const WORKS_KEY = "reform-app.works.v1";

/** 旧バージョンで保存されたデータに新フィールドを補完する */
function normalizeProject(p: Project): Project {
  return {
    ...p,
    taskIds: p.taskIds ?? DEFAULT_TASK_IDS,
    schedule: p.schedule ?? null,
  };
}

interface Store {
  projects: Project[];
  works: WorkItem[];
  ready: boolean;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addProject: (project: Project) => void;
  updateWork: (id: string, durationMinutes: number) => void;
  reset: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [works, setWorks] = useState<WorkItem[]>(WORK_ITEMS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // localStorage は SSR では読めないため、マウント後の1回だけ同期する
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setProjects((JSON.parse(raw) as Project[]).map(normalizeProject));
      const rawWorks = window.localStorage.getItem(WORKS_KEY);
      if (rawWorks) setWorks(JSON.parse(rawWorks) as WorkItem[]);
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

  const updateWork = useCallback((id: string, durationMinutes: number) => {
    setWorks((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, durationMinutes } : w));
      try {
        window.localStorage.setItem(WORKS_KEY, JSON.stringify(next));
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
      value={{ projects, works, ready, updateProject, addProject, updateWork, reset }}
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
