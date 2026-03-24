"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { getStandFloorFinishLabel } from "@/lib/stand-floor";
import { useStandStore } from "@/lib/store";
import { StandScene3D } from "./StandScene3D";

interface StandPreview3DCanvasProps {
  isReadOnly?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
}

export function StandPreview3DCanvas({ isReadOnly, onZoomIn, onZoomOut, onZoomReset }: StandPreview3DCanvasProps) {
  const dimensions = useStandStore((state) => state.dimensions);
  const floorSettings = useStandStore((state) => state.floorSettings);
  const elements = useStandStore((state) => state.elements);
  const gridSize = useStandStore((state) => state.gridSize);
  const selectElement = useStandStore((state) => state.selectElement);
  const selectedElementIds = useStandStore((state) => state.selectedElementIds);
  const showGrid = useStandStore((state) => state.showGrid);
  const [sceneKey, setSceneKey] = useState(0);

  // Listener pour les événements de zoom lancés depuis StandEditor
  useEffect(() => {
    // Si la caméra a besoin d'être manipulée depuis l'extérieur, on pourrait l'ajouter ici
    // via useThree. Pour l'instant, c'est géré par l'OrbitControls.
  }, []);

  return (
    <div className="h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff,_#eef2ff_45%,_#e2e8f0_100%)]">
      <div className="relative h-full w-full">
        <Canvas
          camera={{ fov: 42, position: [8, 5, 8] }}
          className="h-full w-full"
          dpr={[1, 1.75]}
          gl={{ antialias: true }}
          key={sceneKey}
          onPointerMissed={() => selectElement(null)}
          shadows
        >
          <Suspense fallback={null}>
            <StandScene3D
              dimensions={dimensions}
              floorSettings={floorSettings}
              elements={elements}
              gridSize={gridSize}
              onSelectElement={(event, elementId) => {
                event.stopPropagation();
                selectElement(
                  elementId,
                  event.metaKey || event.ctrlKey || event.shiftKey
                    ? { toggle: true }
                    : undefined
                );
              }}
              selectedElementIds={selectedElementIds}
              showGrid={showGrid}
            />
          </Suspense>
        </Canvas>

        <div className="absolute left-4 top-4 z-20 rounded-xl border border-[#dbe4ff] bg-white/90 px-3 py-2 text-[11px] font-medium text-[#475569] shadow-sm backdrop-blur-sm">
          Glissez pour orbiter, utilisez la molette pour zoomer{isReadOnly ? "." : ", cliquez pour sélectionner."}
        </div>

        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-[#dbe4ff] bg-white/95 px-2 py-2 shadow-sm backdrop-blur-sm">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
            onClick={() => onZoomIn?.()}
            type="button"
            title="Zoom +"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="h-4 w-[1px] bg-[#e2e8f0]" />
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
            onClick={() => onZoomOut?.()}
            type="button"
            title="Zoom -"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <div className="h-4 w-[1px] bg-[#e2e8f0]" />
          <button
            className="flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-[#475569] transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
            onClick={() => {
              setSceneKey((currentKey) => currentKey + 1);
              onZoomReset?.();
            }}
            type="button"
            title="Réinitialiser la caméra"
          >
            <Maximize2 className="h-4 w-4" />
            Réinitialiser
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white/90 to-transparent px-6 pb-4 pt-10 text-center text-[11px] font-medium text-[#64748b]">
          Stand : {dimensions.width}m × {dimensions.depth}m — Surface : {dimensions.width * dimensions.depth}m² — Sol : {getStandFloorFinishLabel(floorSettings.finish)}{floorSettings.elevation > 0 ? ` (+${Math.round(floorSettings.elevation * 100)} cm)` : ""} — Éléments : {elements.length}
        </div>
      </div>
    </div>
  );
}
