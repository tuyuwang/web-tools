"use client";

import React from "react";
import dynamic from "next/dynamic";

const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[70vh] text-gray-500">正在加载画板...</div>
  ),
});

export default function WhiteboardPage(): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">白板（Excalidraw）</h1>
      <div className="border rounded-lg overflow-hidden h-[80vh]">
        <Excalidraw />
      </div>
    </div>
  );
}