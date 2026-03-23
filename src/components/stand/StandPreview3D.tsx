"use client";

import React, { useMemo, useRef, useState } from "react";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useStandStore } from "@/lib/store";
import { StandElement } from "@/lib/types";

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type Point2D = {
  x: number;
  y: number;
};

type ProjectedPoint = Point2D & {
  depth: number;
};

type SceneFace = {
  depth: number;
  fill: string;
  key: string;
  points: Point2D[];
  stroke: string;
  strokeWidth?: number;
};

type SceneItem = {
  depth: number;
  elementId: string;
  faces: SceneFace[];
  key: string;
  label?: {
    color: string;
    fontSize: number;
    point: Point2D;
    text: string;
  };
  selected: boolean;
};

type DragState = {
  pitch: number;
  startX: number;
  startY: number;
  yaw: number;
};

const DEFAULT_YAW = -32;
const DEFAULT_PITCH = 28;
const DEFAULT_ZOOM = 1;
const WALL_HEIGHT = 3.2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(color: string) {
  const normalized = color.trim().replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((chunk) => `${chunk}${chunk}`)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return null;
  }

  return {
    b: Number.parseInt(expanded.slice(4, 6), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    r: Number.parseInt(expanded.slice(0, 2), 16),
  };
}

function adjustColor(color: string, amount: number) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return color;
  }

  const mixChannel = (channel: number) =>
    amount >= 0
      ? Math.round(channel + (255 - channel) * amount)
      : Math.round(channel * (1 + amount));

  const next = {
    r: clamp(mixChannel(rgb.r), 0, 255),
    g: clamp(mixChannel(rgb.g), 0, 255),
    b: clamp(mixChannel(rgb.b), 0, 255),
  };

  return `rgb(${next.r}, ${next.g}, ${next.b})`;
}

function withAlpha(color: string, alpha: number) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return color;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function formatPoints(points: Point2D[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function getFaceDepth(points: ProjectedPoint[]) {
  return points.reduce((totalDepth, point) => totalDepth + point.depth, 0) / points.length;
}

function rotateFloorPoint(
  x: number,
  z: number,
  centerX: number,
  centerZ: number,
  angleRad: number
) {
  const offsetX = x - centerX;
  const offsetZ = z - centerZ;

  return {
    x: centerX + offsetX * Math.cos(angleRad) - offsetZ * Math.sin(angleRad),
    z: centerZ + offsetX * Math.sin(angleRad) + offsetZ * Math.cos(angleRad),
  };
}

function getElementHeight(element: StandElement) {
  switch (element.category) {
    case "bars_comptoirs":
      return 1.1;
    case "assises":
      return 0.85;
    case "tables":
      return 0.78;
    case "ecrans_supports":
      return 1.8;
    case "decoration":
      return 1.9;
    case "texte":
      return Math.max(0.7, (element.height + 0.18) * 2.6);
    default:
      return 1;
  }
}

export function StandPreview3D() {
  const {
    dimensions,
    elements,
    gridSize,
    selectElement,
    selectedElementIds,
    showGrid,
  } = useStandStore();
  const [yaw, setYaw] = useState(DEFAULT_YAW);
  const [pitch, setPitch] = useState(DEFAULT_PITCH);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState | null>(null);

  const selectedIds = useMemo(() => new Set(selectedElementIds), [selectedElementIds]);

  const scene = useMemo(() => {
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    const cosYaw = Math.cos(yawRad);
    const sinYaw = Math.sin(yawRad);
    const cosPitch = Math.cos(pitchRad);
    const sinPitch = Math.sin(pitchRad);
    const center = {
      x: dimensions.width / 2,
      y: WALL_HEIGHT / 2.25,
      z: dimensions.depth / 2,
    };
    const perspective = Math.max(dimensions.width, dimensions.depth, WALL_HEIGHT) * 5.5;
    const allPoints: Point2D[] = [];

    const projectPoint = (point: Point3D): ProjectedPoint => {
      const translatedX = point.x - center.x;
      const translatedY = point.y - center.y;
      const translatedZ = point.z - center.z;
      const rotatedX = translatedX * cosYaw - translatedZ * sinYaw;
      const rotatedZ = translatedX * sinYaw + translatedZ * cosYaw;
      const rotatedY = translatedY * cosPitch - rotatedZ * sinPitch;
      const depth = translatedY * sinPitch + rotatedZ * cosPitch;
      const factor = (perspective / Math.max(perspective + depth, 0.2)) * zoom;
      const projected = {
        depth,
        x: rotatedX * factor,
        y: -rotatedY * factor,
      };
      allPoints.push(projected);
      return projected;
    };

    const projectFace = (points: Point3D[]) => points.map(projectPoint);

    const floorFace = projectFace([
      { x: 0, y: 0, z: 0 },
      { x: dimensions.width, y: 0, z: 0 },
      { x: dimensions.width, y: 0, z: dimensions.depth },
      { x: 0, y: 0, z: dimensions.depth },
    ]);

    const backWallFace = projectFace([
      { x: 0, y: 0, z: dimensions.depth },
      { x: dimensions.width, y: 0, z: dimensions.depth },
      { x: dimensions.width, y: WALL_HEIGHT, z: dimensions.depth },
      { x: 0, y: WALL_HEIGHT, z: dimensions.depth },
    ]);

    const sideWallFace = yaw <= 0
      ? projectFace([
          { x: dimensions.width, y: 0, z: 0 },
          { x: dimensions.width, y: 0, z: dimensions.depth },
          { x: dimensions.width, y: WALL_HEIGHT, z: dimensions.depth },
          { x: dimensions.width, y: WALL_HEIGHT, z: 0 },
        ])
      : projectFace([
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: dimensions.depth },
          { x: 0, y: WALL_HEIGHT, z: dimensions.depth },
          { x: 0, y: WALL_HEIGHT, z: 0 },
        ]);

    const gridLines = showGrid
      ? Array.from(
          { length: Math.floor(dimensions.width / Math.max(gridSize / 100, 0.25)) + 1 },
          (_, index) => index * Math.max(gridSize / 100, 0.25)
        )
          .filter((offset) => offset > 0 && offset < dimensions.width)
          .map((offset) =>
            projectFace([
              { x: offset, y: 0.01, z: 0 },
              { x: offset, y: 0.01, z: dimensions.depth },
            ])
          )
          .concat(
            Array.from(
              { length: Math.floor(dimensions.depth / Math.max(gridSize / 100, 0.25)) + 1 },
              (_, index) => index * Math.max(gridSize / 100, 0.25)
            )
              .filter((offset) => offset > 0 && offset < dimensions.depth)
              .map((offset) =>
                projectFace([
                  { x: 0, y: 0.01, z: offset },
                  { x: dimensions.width, y: 0.01, z: offset },
                ])
              )
          )
      : [];

    const items: SceneItem[] = elements
      .map((element) => {
        const itemHeight = getElementHeight(element);
        const isText = element.category === "texte";
        const width = isText ? Math.max(element.width + 0.25, 0.75) : element.width;
        const depth = isText ? 0.08 : element.height;
        const centerX = element.x + element.width / 2;
        const centerZ = element.y + element.height / 2;
        const rotationRad = (element.rotation * Math.PI) / 180;
        const top = itemHeight;
        const baseCorners = [
          rotateFloorPoint(
            centerX - width / 2,
            centerZ - depth / 2,
            centerX,
            centerZ,
            rotationRad
          ),
          rotateFloorPoint(
            centerX + width / 2,
            centerZ - depth / 2,
            centerX,
            centerZ,
            rotationRad
          ),
          rotateFloorPoint(
            centerX + width / 2,
            centerZ + depth / 2,
            centerX,
            centerZ,
            rotationRad
          ),
          rotateFloorPoint(
            centerX - width / 2,
            centerZ + depth / 2,
            centerX,
            centerZ,
            rotationRad
          ),
        ];
        const selected = selectedIds.has(element.id);
        const topFace = projectFace(
          baseCorners.map((corner) => ({ x: corner.x, y: top, z: corner.z }))
        );
        const sideFaces = [
          [baseCorners[0], baseCorners[1]],
          [baseCorners[1], baseCorners[2]],
          [baseCorners[2], baseCorners[3]],
          [baseCorners[3], baseCorners[0]],
        ]
          .map(([startCorner, endCorner], index) => {
            const projectedFace = projectFace([
              { x: startCorner.x, y: 0, z: startCorner.z },
              { x: endCorner.x, y: 0, z: endCorner.z },
              { x: endCorner.x, y: top, z: endCorner.z },
              { x: startCorner.x, y: top, z: startCorner.z },
            ]);

            return {
              depth: getFaceDepth(projectedFace),
              fill: adjustColor(
                isText ? adjustColor(element.color, 0.25) : element.color,
                index % 2 === 0 ? -0.04 : -0.18
              ),
              key: `${element.id}-side-${index}`,
              points: projectedFace,
            };
          })
          .sort((left, right) => right.depth - left.depth);
        const centerPoint = projectPoint({
          x: centerX,
          y: top + (isText ? 0.06 : 0.02),
          z: centerZ,
        });
        const depthHint = projectPoint({
          x: centerX,
          y: top / 2,
          z: centerZ,
        }).depth;
        const stroke = selected ? "#2563eb" : withAlpha("#0f172a", isText ? 0.22 : 0.16);
        const color = isText ? adjustColor(element.color, 0.25) : element.color;

        return {
          depth: depthHint,
          elementId: element.id,
          faces: [
            {
              depth: getFaceDepth(topFace),
              fill: adjustColor(color, 0.28),
              key: `${element.id}-top`,
              points: topFace,
              stroke,
              strokeWidth: selected ? 0.11 : 0.05,
            },
            ...sideFaces.map((face) => ({
              depth: face.depth,
              fill: face.fill,
              key: face.key,
              points: face.points,
              stroke,
              strokeWidth: selected ? 0.11 : 0.05,
            })),
          ].sort((left, right) => right.depth - left.depth),
          key: element.id,
          label: {
            color: isText ? element.color : "rgba(255,255,255,0.92)",
            fontSize: isText ? 0.34 : 0.24,
            point: centerPoint,
            text: isText ? element.text ?? "Texte" : element.name,
          },
          selected,
        } satisfies SceneItem;
      })
      .sort((left, right) => right.depth - left.depth);

    const minX = Math.min(...allPoints.map((point) => point.x));
    const maxX = Math.max(...allPoints.map((point) => point.x));
    const minY = Math.min(...allPoints.map((point) => point.y));
    const maxY = Math.max(...allPoints.map((point) => point.y));
    const padding = Math.max(dimensions.width, dimensions.depth) * 0.18 + 0.8;

    return {
      backWallFace,
      floorFace,
      gridLines,
      items,
      sideWallFace,
      viewBox: `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`,
    };
  }, [dimensions.depth, dimensions.width, elements, gridSize, pitch, selectedIds, showGrid, yaw, zoom]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = {
      pitch,
      startX: event.clientX,
      startY: event.clientY,
      yaw,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState) {
      return;
    }

    setYaw(clamp(dragState.yaw + (event.clientX - dragState.startX) * 0.28, -78, 78));
    setPitch(clamp(dragState.pitch + (dragState.startY - event.clientY) * 0.18, 12, 64));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff,_#eef2ff_45%,_#e2e8f0_100%)]">
      <div className="relative h-full w-full">
        <div
          className={`h-full w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={(event) => {
            event.preventDefault();
            setZoom((currentZoom) => clamp(currentZoom - event.deltaY * 0.0012, 0.72, 2.15));
          }}
          style={{ touchAction: "none" }}
        >
          <svg
            className="h-full w-full"
            viewBox={scene.viewBox}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                selectElement(null);
              }
            }}
          >
            <polygon
              fill="transparent"
              points={formatPoints(scene.floorFace)}
              stroke="transparent"
              onClick={() => selectElement(null)}
            />
            <polygon
              fill={withAlpha("#f8fafc", 0.94)}
              points={formatPoints(scene.backWallFace)}
              stroke={withAlpha("#94a3b8", 0.45)}
              strokeWidth={0.06}
            />
            <polygon
              fill={withAlpha("#f1f5f9", 0.92)}
              points={formatPoints(scene.sideWallFace)}
              stroke={withAlpha("#94a3b8", 0.38)}
              strokeWidth={0.06}
            />
            <polygon
              fill="url(#standFloorGradient)"
              points={formatPoints(scene.floorFace)}
              stroke={withAlpha("#475569", 0.32)}
              strokeWidth={0.06}
            />
            <defs>
              <linearGradient id="standFloorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
            </defs>
            {scene.gridLines.map((line, index) => (
              <polyline
                key={`grid-${index}`}
                fill="none"
                points={formatPoints(line)}
                stroke={withAlpha("#94a3b8", 0.28)}
                strokeWidth={0.03}
              />
            ))}
            {scene.items.map((item) => (
              <g
                key={item.key}
                className="transition-opacity"
                onClick={(event) => {
                  event.stopPropagation();
                  selectElement(
                    item.elementId,
                    event.metaKey || event.ctrlKey || event.shiftKey
                      ? { toggle: true }
                      : undefined
                  );
                }}
              >
                {item.faces.map((face) => (
                  <polygon
                    key={face.key}
                    fill={face.fill}
                    points={formatPoints(face.points)}
                    stroke={face.stroke}
                    strokeWidth={face.strokeWidth ?? 0.05}
                  />
                ))}
                {item.label ? (
                  <text
                    fill={item.label.color}
                    fontSize={item.label.fontSize}
                    fontWeight={item.selected ? 700 : 600}
                    paintOrder="stroke"
                    stroke={item.selected ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.12)"}
                    strokeWidth={item.selected ? 0.05 : 0.025}
                    textAnchor="middle"
                    x={item.label.point.x}
                    y={item.label.point.y}
                  >
                    {item.label.text}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>
        </div>

        <div className="absolute left-4 top-4 z-20 rounded-xl border border-[#dbe4ff] bg-white/90 px-3 py-2 text-[11px] font-medium text-[#475569] shadow-sm backdrop-blur-sm">
          Glissez pour orienter la vue, utilisez la molette pour zoomer.
        </div>

        <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-xl border border-[#dbe4ff] bg-white/95 px-2 py-2 shadow-sm backdrop-blur-sm">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
            onClick={() => setZoom((currentZoom) => clamp(currentZoom - 0.1, 0.72, 2.15))}
            type="button"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <div className="min-w-[52px] text-center text-[11px] font-semibold text-[#334155]">
            {Math.round(zoom * 100)}%
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
            onClick={() => setZoom((currentZoom) => clamp(currentZoom + 0.1, 0.72, 2.15))}
            type="button"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
            onClick={() => {
              setYaw(DEFAULT_YAW);
              setPitch(DEFAULT_PITCH);
            }}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
            onClick={() => {
              setYaw(DEFAULT_YAW);
              setPitch(DEFAULT_PITCH);
              setZoom(DEFAULT_ZOOM);
            }}
            type="button"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white/90 to-transparent px-6 pb-4 pt-10 text-center text-[11px] font-medium text-[#64748b]">
          Stand : {dimensions.width}m × {dimensions.depth}m — Surface : {dimensions.width * dimensions.depth}m² — Éléments : {elements.length}
        </div>
      </div>
    </div>
  );
}
