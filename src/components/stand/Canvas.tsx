"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { useStandStore } from "@/lib/store";
import { CanvasElement } from "@/components/stand/CanvasElement";

const METERS_TO_PX = 100;
const RULER_SIZE = 28;

export function Canvas() {
  const {
    dimensions,
    elements,
    selectedElementId,
    selectElement,
    showGrid,
    gridSize,
  } = useStandStore();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const canvasW = dimensions.width * METERS_TO_PX;
  const canvasH = dimensions.depth * METERS_TO_PX;

  useEffect(() => {
    const fit = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const availW = rect.width - RULER_SIZE - 48;
      const availH = rect.height - RULER_SIZE - 64;
      setScale(Math.min(availW / canvasW, availH / canvasH, 1.4));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [canvasW, canvasH]);

  const gridSizePx = (gridSize / 100) * METERS_TO_PX;

  const snapToGrid = useCallback(
    (val: number) => {
      const g = gridSize / 100;
      return Math.round(val / g) * g;
    },
    [gridSize]
  );

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) selectElement(null);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData("application/json");
      if (!data) return;
      const item = JSON.parse(data);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / scale / METERS_TO_PX - item.width / 2;
      const y = (e.clientY - rect.top) / scale / METERS_TO_PX - item.height / 2;
      const sx = snapToGrid(Math.max(0, Math.min(x, dimensions.width - item.width)));
      const sy = snapToGrid(Math.max(0, Math.min(y, dimensions.depth - item.height)));
      useStandStore.getState().addElement(item, sx, sy);
    },
    [scale, snapToGrid, dimensions]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleElementDragEnd = useCallback(
    (id: string, newX: number, newY: number) => {
      useStandStore.getState().pushHistory();
      useStandStore.getState().moveElement(id, newX, newY);
    },
    []
  );

  const scaledW = canvasW * scale;
  const scaledH = canvasH * scale;
  const mPx = METERS_TO_PX * scale;

  return (
    <div ref={wrapperRef} className="flex-1 overflow-auto flex flex-col items-center justify-center bg-[#f4f5f7] relative">
      <div className="flex flex-col items-start">
        {/* Top ruler */}
        <div className="flex" style={{ height: RULER_SIZE }}>
          <div style={{ width: RULER_SIZE }} />
          <svg width={scaledW} height={RULER_SIZE} className="select-none">
            <rect width={scaledW} height={RULER_SIZE} fill="#f9fafb" />
            {Array.from({ length: dimensions.width + 1 }, (_, i) => (
              <g key={i}>
                <line x1={i * mPx} y1={RULER_SIZE - 8} x2={i * mPx} y2={RULER_SIZE} stroke="#94a3b8" strokeWidth={1} />
                <text x={i * mPx + 4} y={RULER_SIZE - 12} fill="#64748b" fontSize={10} fontFamily="Inter, system-ui, sans-serif">
                  {i}m
                </text>
              </g>
            ))}
            <line x1={0} y1={RULER_SIZE - 0.5} x2={scaledW} y2={RULER_SIZE - 0.5} stroke="#cbd5e1" strokeWidth={1} />
          </svg>
        </div>

        <div className="flex">
          {/* Left ruler */}
          <svg width={RULER_SIZE} height={scaledH} className="select-none">
            <rect width={RULER_SIZE} height={scaledH} fill="#f9fafb" />
            {Array.from({ length: dimensions.depth + 1 }, (_, i) => (
              <g key={i}>
                <line x1={RULER_SIZE - 8} y1={i * mPx} x2={RULER_SIZE} y2={i * mPx} stroke="#94a3b8" strokeWidth={1} />
                <text x={RULER_SIZE - 12} y={i * mPx + 14} fill="#64748b" fontSize={10} textAnchor="end" fontFamily="Inter, system-ui, sans-serif">
                  {i}m
                </text>
              </g>
            ))}
            <line x1={RULER_SIZE - 0.5} y1={0} x2={RULER_SIZE - 0.5} y2={scaledH} stroke="#cbd5e1" strokeWidth={1} />
          </svg>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="relative bg-white shadow-sm"
            style={{
              width: scaledW,
              height: scaledH,
              cursor: "default",
              border: "1px solid #cbd5e1",
            }}
            onClick={handleCanvasClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {showGrid && (
              <svg className="absolute inset-0 pointer-events-none" width={scaledW} height={scaledH}>
                <defs>
                  <pattern id="smallGrid" width={gridSizePx * scale} height={gridSizePx * scale} patternUnits="userSpaceOnUse">
                    <path d={`M ${gridSizePx * scale} 0 L 0 0 0 ${gridSizePx * scale}`} fill="none" stroke="#e8eaee" strokeWidth="0.5" />
                  </pattern>
                  <pattern id="bigGrid" width={mPx} height={mPx} patternUnits="userSpaceOnUse">
                    <rect width={mPx} height={mPx} fill="url(#smallGrid)" />
                    <path d={`M ${mPx} 0 L 0 0 0 ${mPx}`} fill="none" stroke="#d0d5dd" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#bigGrid)" />
              </svg>
            )}

            {elements.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                scale={scale}
                metersToPx={METERS_TO_PX}
                isSelected={el.id === selectedElementId}
                onSelect={() => selectElement(el.id)}
                onDragEnd={handleElementDragEnd}
                snapToGrid={snapToGrid}
                standWidth={dimensions.width}
                standDepth={dimensions.depth}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-[#94a3b8] select-none font-medium tracking-wide">
        Stand : {dimensions.width}m × {dimensions.depth}m — Surface : {dimensions.width * dimensions.depth}m²
      </div>
    </div>
  );
}
