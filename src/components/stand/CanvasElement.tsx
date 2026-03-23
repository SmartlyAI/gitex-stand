"use client";

import React, { useRef, useState } from "react";
import { StandElement } from "@/lib/types";

interface CanvasElementProps {
  element: StandElement;
  scale: number;
  metersToPx: number;
  isSelected: boolean;
  isReadOnly: boolean;
  onSelect: () => void;
  onDragEnd: (id: string, newX: number, newY: number) => void;
  snapToGrid: (val: number) => number;
  standWidth: number;
  standDepth: number;
}

export function CanvasElement({
  element,
  scale,
  metersToPx,
  isSelected,
  isReadOnly,
  onSelect,
  onDragEnd,
  snapToGrid,
  standWidth,
  standDepth,
}: CanvasElementProps) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);

  const baseLeft = element.x * metersToPx * scale;
  const baseTop = element.y * metersToPx * scale;
  const width = element.width * metersToPx * scale;
  const height = element.height * metersToPx * scale;

  const left = baseLeft + (dragOffset?.dx ?? 0);
  const top = baseTop + (dragOffset?.dy ?? 0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked || isReadOnly) return;
    e.stopPropagation();
    e.preventDefault();
    onSelect();

    const startX = e.clientX;
    const startY = e.clientY;
    dragRef.current = { startX, startY, origX: element.x, origY: element.y };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setDragOffset({ dx, dy });
    };

    const handleMouseUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (dragRef.current) {
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;

        const dxM = dx / scale / metersToPx;
        const dyM = dy / scale / metersToPx;

        const newX = snapToGrid(Math.max(0, Math.min(dragRef.current.origX + dxM, standWidth - element.width)));
        const newY = snapToGrid(Math.max(0, Math.min(dragRef.current.origY + dyM, standDepth - element.height)));

        onDragEnd(element.id, newX, newY);
      }

      dragRef.current = null;
      setDragOffset(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const isDragging = dragOffset !== null;
  const isText = element.category === "texte";

  return (
    <div
      className={`absolute flex items-center justify-center select-none overflow-hidden ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } ${isDragging ? "shadow-lg z-50 opacity-90" : "z-10"} ${
        element.locked || isReadOnly
          ? "cursor-not-allowed opacity-80"
          : "cursor-move"
      }`}
      style={{
        left,
        top,
        width,
        height,
        backgroundColor: isText ? "transparent" : element.color,
        borderRadius: isText ? 0 : 4,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: "center center",
        willChange: isDragging ? "left, top" : "auto",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {isText ? (
        <span
          className="whitespace-nowrap"
          style={{
            fontSize: (element.fontSize ?? 18) * scale * 0.8,
            fontWeight: element.fontBold ? "bold" : "normal",
            fontStyle: element.fontItalic ? "italic" : "normal",
            color: element.color,
          }}
        >
          {element.text}
        </span>
      ) : (
        <span
          className="text-white text-center leading-tight px-1"
          style={{ fontSize: Math.max(8, Math.min(12 * scale, 14)) }}
        >
          {element.name}
          <br />
          <span className="opacity-70" style={{ fontSize: Math.max(7, 9 * scale) }}>
            {element.width}×{element.height}m
          </span>
        </span>
      )}

      {isSelected && !element.locked && !isReadOnly && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize rounded-tl-sm" />
      )}
    </div>
  );
}
