"use client";

import React, { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { useStandStore } from "@/lib/store";
import { CanvasElement } from "@/components/stand/CanvasElement";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const METERS_TO_PX = 100;
const RULER_SIZE = 28;

interface SelectionRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function Canvas() {
  const {
    dimensions,
    elements,
    selectedElementIds,
    selectElement,
    setSelectedElements,
    removeSelectedElements,
    isReadOnly,
    showGrid,
    gridSize,
  } = useStandStore();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const groupDragOriginsRef = useRef<Map<string, { x: number; y: number }> | null>(null);
  const didMarqueeRef = useRef(false);
  const [fitScale, setFitScale] = useState(1);
  const [scale, setScale] = useState(1);
  const [hasManualZoom, setHasManualZoom] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);

  const canvasW = dimensions.width * METERS_TO_PX;
  const canvasH = dimensions.depth * METERS_TO_PX;
  const orderedElements = useMemo(
    () => [...elements].sort((left, right) => Number(left.category === "texte") - Number(right.category === "texte")),
    [elements]
  );

  useEffect(() => {
    const fit = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const availW = rect.width - RULER_SIZE - 48;
      const availH = rect.height - RULER_SIZE - 64;
      const nextFitScale = Math.min(availW / canvasW, availH / canvasH, 1.4);
      setFitScale(nextFitScale);
      if (!hasManualZoom) {
        setScale(nextFitScale);
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [canvasW, canvasH, hasManualZoom]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isReadOnly || selectedElementIds.length === 0 || event.key !== "Delete") {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (
        target?.isContentEditable ||
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT"
      ) {
        return;
      }

      event.preventDefault();
      removeSelectedElements();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReadOnly, removeSelectedElements, selectedElementIds]);

  const gridSizePx = (gridSize / 100) * METERS_TO_PX;

  const snapToGrid = useCallback(
    (val: number) => {
      const g = gridSize / 100;
      return Math.round(val / g) * g;
    },
    [gridSize]
  );

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (didMarqueeRef.current) {
      didMarqueeRef.current = false;
      return;
    }
    if (e.target === canvasRef.current) selectElement(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReadOnly || e.target !== canvasRef.current) {
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setSelectionRect({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });

    const computeIntersectedIds = (left: number, top: number, right: number, bottom: number) =>
      elements
        .filter((el) => {
          const elL = el.x * METERS_TO_PX * scale;
          const elT = el.y * METERS_TO_PX * scale;
          const elR = elL + el.width * METERS_TO_PX * scale;
          const elB = elT + el.height * METERS_TO_PX * scale;
          return elR >= left && elL <= right && elB >= top && elT <= bottom;
        })
        .map((el) => el.id);

    const handleMouseMove = (event: MouseEvent) => {
      const nextRect = canvasRef.current?.getBoundingClientRect();
      if (!nextRect) {
        return;
      }

      const curX = event.clientX - nextRect.left;
      const curY = event.clientY - nextRect.top;

      setSelectionRect((currentSelectionRect) =>
        currentSelectionRect
          ? { ...currentSelectionRect, currentX: curX, currentY: curY }
          : currentSelectionRect
      );

      const l = Math.min(startX, curX);
      const t = Math.min(startY, curY);
      const r = Math.max(startX, curX);
      const b = Math.max(startY, curY);
      const hasDragged = Math.abs(curX - startX) > 4 || Math.abs(curY - startY) > 4;

      if (hasDragged) {
        setSelectedElements(computeIntersectedIds(l, t, r, b));
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const nextRect = canvasRef.current?.getBoundingClientRect();
      if (!nextRect) {
        setSelectionRect(null);
        return;
      }

      const endX = event.clientX - nextRect.left;
      const endY = event.clientY - nextRect.top;
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);
      const right = Math.max(startX, endX);
      const bottom = Math.max(startY, endY);

      const hasDragged = Math.abs(endX - startX) > 4 || Math.abs(endY - startY) > 4;

      if (!hasDragged) {
        setSelectionRect(null);
        selectElement(null);
        return;
      }

      setSelectedElements(computeIntersectedIds(left, top, right, bottom));
      setSelectionRect(null);
      didMarqueeRef.current = true;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (isReadOnly) return;
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
    [scale, snapToGrid, dimensions, isReadOnly]
  );

  const handleDragOver = (e: React.DragEvent) => {
    if (isReadOnly) return;
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

  const handleElementDragStart = useCallback((id: string) => {
    const state = useStandStore.getState();
    if (!state.selectedElementIds.includes(id) || state.selectedElementIds.length < 2) {
      return;
    }

    state.pushHistory();

    const origins = new Map<string, { x: number; y: number }>();
    for (const el of state.elements) {
      if (state.selectedElementIds.includes(el.id)) {
        origins.set(el.id, { x: el.x, y: el.y });
      }
    }
    groupDragOriginsRef.current = origins;
  }, []);

  const handleElementDragMove = useCallback((_id: string, totalDxM: number, totalDyM: number) => {
    const origins = groupDragOriginsRef.current;
    if (!origins) return;

    const state = useStandStore.getState();
    const selectedSet = new Set(state.selectedElementIds);

    let minOrigX = Infinity;
    let minOrigY = Infinity;
    let maxOrigRight = -Infinity;
    let maxOrigBottom = -Infinity;

    for (const el of state.elements) {
      if (!selectedSet.has(el.id)) continue;
      const orig = origins.get(el.id);
      if (!orig) continue;
      minOrigX = Math.min(minOrigX, orig.x);
      minOrigY = Math.min(minOrigY, orig.y);
      maxOrigRight = Math.max(maxOrigRight, orig.x + el.width);
      maxOrigBottom = Math.max(maxOrigBottom, orig.y + el.height);
    }

    const constrainedDx = Math.max(-minOrigX, Math.min(totalDxM, state.dimensions.width - maxOrigRight));
    const constrainedDy = Math.max(-minOrigY, Math.min(totalDyM, state.dimensions.depth - maxOrigBottom));

    useStandStore.setState({
      elements: state.elements.map((el) => {
        if (!selectedSet.has(el.id)) return el;
        const orig = origins.get(el.id);
        if (!orig) return el;
        return { ...el, x: orig.x + constrainedDx, y: orig.y + constrainedDy };
      }),
    });
  }, []);

  const handleGroupDragEnd = useCallback(() => {
    groupDragOriginsRef.current = null;
  }, []);

  const scaledW = canvasW * scale;
  const scaledH = canvasH * scale;
  const mPx = METERS_TO_PX * scale;

  const handleZoomIn = () => {
    setHasManualZoom(true);
    setScale((currentScale) => Math.min(currentScale + 0.1, 2.5));
  };

  const handleZoomOut = () => {
    setHasManualZoom(true);
    setScale((currentScale) => Math.max(currentScale - 0.1, 0.35));
  };

  const handleZoomReset = () => {
    setHasManualZoom(false);
    setScale(fitScale);
  };

  return (
    <div ref={wrapperRef} className="flex-1 overflow-auto flex flex-col items-center justify-center bg-[#f4f5f7] relative">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-xl border border-[#e2e8f0] bg-white/95 px-2 py-2 shadow-sm backdrop-blur-sm">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#1e293b]"
          onClick={handleZoomOut}
          type="button"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="min-w-[52px] text-center text-[11px] font-semibold text-[#334155]">
          {Math.round(scale * 100)}%
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#1e293b]"
          onClick={handleZoomIn}
          type="button"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#1e293b]"
          onClick={handleZoomReset}
          type="button"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
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
            onMouseDown={handleCanvasMouseDown}
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

            {selectionRect && (
              <div
                className="pointer-events-none absolute border border-blue-400 bg-blue-100/30"
                style={{
                  left: Math.min(selectionRect.startX, selectionRect.currentX),
                  top: Math.min(selectionRect.startY, selectionRect.currentY),
                  width: Math.abs(selectionRect.currentX - selectionRect.startX),
                  height: Math.abs(selectionRect.currentY - selectionRect.startY),
                }}
              />
            )}

            {orderedElements.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                scale={scale}
                metersToPx={METERS_TO_PX}
                isSelected={selectedElementIds.includes(el.id)}
                isMultiSelected={selectedElementIds.length > 1}
                isReadOnly={isReadOnly}
                onSelect={(mode) =>
                  selectElement(
                    el.id,
                    mode === "toggle" ? { toggle: true } : undefined
                  )
                }
                onDragStart={handleElementDragStart}
                onDragMove={handleElementDragMove}
                onDragEnd={handleElementDragEnd}
                onGroupDragEnd={handleGroupDragEnd}
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
