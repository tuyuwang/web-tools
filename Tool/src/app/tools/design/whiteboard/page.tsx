"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/components/theme-provider";
import { Download, Upload, Image as ImageIcon, FileJson, Grid as GridIcon, Trash2, Save } from "lucide-react";

// Lazy-load Excalidraw component only on client
const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[70vh] text-gray-500">正在加载画板...</div>
  ),
});
const ExcalidrawAny = Excalidraw as any;

const LOCAL_STORAGE_KEY = "tools.whiteboard.scene";

type SceneData = {
  elements: any[];
  appState: any;
  files: Record<string, any>;
};

export default function WhiteboardPage(): JSX.Element {
  const { resolvedTheme } = useTheme();
  const excalidrawRef = useRef<any>(null);

  const [gridEnabled, setGridEnabled] = useState<boolean>(false);
  const [initialData, setInitialData] = useState<SceneData | null>(null);

  // Load saved scene once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.elements && parsed.appState) {
          setInitialData(parsed);
          return;
        }
      }
    } catch {}
    // default empty scene
    setInitialData({ elements: [], appState: {}, files: {} });
  }, []);

  // Debounced save handler
  const saveToLocalStorage = useMemo(() => {
    let timer: number | null = null;
    return (elements: ReadonlyArray<any>, appState: any, files: Record<string, any>) => {
      const filtered = Array.from(elements || []).filter((el) => !(el as any)?.isDeleted);
      const payload: SceneData = { elements: filtered, appState, files };
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
        } catch {}
      }, 500);
    };
  }, []);

  const handleExport = useCallback(
    async (type: "png" | "svg") => {
      if (!excalidrawRef.current) return;
      const excalidrawLib = await import("@excalidraw/excalidraw");
      const elements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState();
      const files = excalidrawRef.current.getFiles();
      const mimeType = type === "png" ? "image/png" : "image/svg+xml";
      const blob = await excalidrawLib.exportToBlob({ elements, appState, files, mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whiteboard-${Date.now()}.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleExportJson = useCallback(async () => {
    if (!excalidrawRef.current) return;
    const excalidrawLib = await import("@excalidraw/excalidraw");
    const elements = excalidrawRef.current.getSceneElements();
    const appState = excalidrawRef.current.getAppState();
    const files = excalidrawRef.current.getFiles();
    const jsonString = excalidrawLib.serializeAsJSON(elements, appState, files, "local");
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whiteboard-${Date.now()}.excalidraw`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportJson = useCallback(async (file: File) => {
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const excalidrawLib = await import("@excalidraw/excalidraw");
      const restored = excalidrawLib.restore(data, null, null);
      excalidrawRef.current?.updateScene({
        elements: restored.elements || [],
        appState: restored.appState || {},
        files: restored.files || {},
      });
    } catch {
      // fallback: try raw scene shape
      try {
        const raw = JSON.parse(text) as SceneData;
        excalidrawRef.current?.updateScene({
          elements: raw.elements || [],
          appState: raw.appState || {},
          files: raw.files || {},
        });
      } catch {}
    }
  }, []);

  const handleClear = useCallback(() => {
    excalidrawRef.current?.resetScene();
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  }, []);

  const theme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">白板（Excalidraw）</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">支持本地自动保存、导入/导出（PNG/SVG/JSON）、网格开关和清空画布。</p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => handleExport("png")}
          title="导出 PNG"
        >
          <ImageIcon className="w-4 h-4" /> 导出 PNG
        </button>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => handleExport("svg")}
          title="导出 SVG"
        >
          <Download className="w-4 h-4" /> 导出 SVG
        </button>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={handleExportJson}
          title="导出 JSON (.excalidraw)"
        >
          <FileJson className="w-4 h-4" /> 导出 JSON
        </button>
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600">
          <Upload className="w-4 h-4" /> 导入 JSON
          <input
            type="file"
            accept=".excalidraw,application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportJson(file);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => setGridEnabled((v) => !v)}
          title="切换网格"
        >
          <GridIcon className="w-4 h-4" /> {gridEnabled ? "关闭网格" : "开启网格"}
        </button>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          onClick={handleClear}
          title="清空画布"
        >
          <Trash2 className="w-4 h-4" /> 清空
        </button>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 ml-auto"
          onClick={() => {
            if (!excalidrawRef.current) return;
            const elements = excalidrawRef.current.getSceneElements();
            const appState = excalidrawRef.current.getAppState();
            const files = excalidrawRef.current.getFiles();
            saveToLocalStorage(elements, appState, files);
          }}
          title="立即保存"
        >
          <Save className="w-4 h-4" /> 保存
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden h-[78vh]">
        {initialData && (
          <ExcalidrawAny
            ref={excalidrawRef}
            theme={theme as any}
            initialData={initialData as any}
            gridModeEnabled={gridEnabled}
            UIOptions={{ canvasActions: { loadScene: false } }}
            onChange={(elements: readonly any[], appState: any, files: Record<string, any>) => {
              saveToLocalStorage(elements, appState, files as any);
            }}
          />
        )}
      </div>
    </div>
  );
}