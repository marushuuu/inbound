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
import type { Project } from "./types";

const STORAGE_KEY = "reform-app.projects.v1";

interface Store {
  projects: Project[];
  ready: boolean;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addProject: (project: Project) => void;
  reset: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // localStorage は SSR では読めないため、マウント後の1回だけ同期する
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setProjects(JSON.parse(raw) as Project[]);
    } catch {
      // 保存データが読めない場合はシードデータのまま続行
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: Project[]) => {
    setProjects(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ストレージ不可の環境ではメモリ上の状態のみで動作
    }
  }, []);

  const updateProject = useCallback(
    (id: string, patch: Partial<Project>) => {
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // noop
        }
        return next;
      });
    },
    [],
  );

  const addProject = useCallback(
    (project: Project) => {
      persist([project, ...projects]);
    },
    [persist, projects],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
    setProjects(SEED_PROJECTS);
  }, []);

  return (
    <StoreContext.Provider
      value={{ projects, ready, updateProject, addProject, reset }}
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
