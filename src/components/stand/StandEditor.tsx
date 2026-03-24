"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStandStore } from "@/lib/store";
import { savePlanToApi } from "@/lib/plan-client";
import { StandPlan, StandViewMode } from "@/lib/types";
import {
  buildPlanPath,
  toAbsoluteProjectUrl,
  upsertStoredProjectLink,
} from "@/lib/project-links";
import { Toolbar } from "./Toolbar";
import { FurnitureSidebar } from "./FurnitureSidebar";
import { Canvas } from "./Canvas";
import { StandPreview3DCanvas } from "./three/StandPreview3DCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { ShareModal } from "./ShareModal";

interface StandEditorProps {
  initialPlan?: StandPlan;
  readOnly?: boolean;
}

export function StandEditor({
  initialPlan,
  readOnly = false,
}: StandEditorProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<StandViewMode>(readOnly ? "3d" : "2d");
  const didHydrateRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const planId = useStandStore((s) => s.planId);
  const planName = useStandStore((s) => s.planName);
  const dimensions = useStandStore((s) => s.dimensions);
  const floorSettings = useStandStore((s) => s.floorSettings);
  const elements = useStandStore((s) => s.elements);
  const history = useStandStore((s) => s.history);
  const historyIndex = useStandStore((s) => s.historyIndex);
  const isReadOnly = useStandStore((s) => s.isReadOnly);
  const replacePlan = useStandStore((s) => s.replacePlan);
  const setReadOnly = useStandStore((s) => s.setReadOnly);

  useEffect(() => {
    setReadOnly(readOnly);

    if (initialPlan) {
      replacePlan(initialPlan);
    }

    didHydrateRef.current = true;
  }, [initialPlan, readOnly, replacePlan, setReadOnly]);

  useEffect(() => {
    if (!didHydrateRef.current || isReadOnly || !planId) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      void savePlanToApi(useStandStore.getState().serializePlan()).catch((error) => {
        console.error("Failed to autosave plan", error);
      });
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [dimensions, elements, floorSettings, history, historyIndex, isReadOnly, planId, planName]);

  useEffect(() => {
    if (!planId || !planName) {
      return;
    }

    upsertStoredProjectLink({
      planId,
      planName,
      url: toAbsoluteProjectUrl(buildPlanPath(planId, "editor")),
      updatedAt: new Date().toISOString(),
    });
  }, [planId, planName]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {isReadOnly && (
        <div className="h-9 shrink-0 border-b border-amber-200 bg-amber-50 px-4 flex items-center text-[12px] font-medium text-amber-900">
          Mode lecture seule — ce plan partagé peut être consulté mais pas modifié.
        </div>
      )}
      <Toolbar
        onShareOpen={() => setShareOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className="flex flex-1 overflow-hidden">
        {!isReadOnly && <FurnitureSidebar />}
        <main className="flex-1 bg-[#f8f9fb] relative flex flex-col h-full overflow-hidden">
          {viewMode === "2d" ? (
            <Canvas />
          ) : (
            <StandPreview3DCanvas 
              isReadOnly={isReadOnly} 
              onZoomIn={() => {
                const event = new CustomEvent("zoom-3d-in");
                window.dispatchEvent(event);
              }}
              onZoomOut={() => {
                const event = new CustomEvent("zoom-3d-out");
                window.dispatchEvent(event);
              }}
              onZoomReset={() => {
                const event = new CustomEvent("zoom-3d-reset");
                window.dispatchEvent(event);
              }}
            />
          )}
        </main>
        {!isReadOnly && <PropertiesPanel />}
      </div>
      <ShareModal open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
