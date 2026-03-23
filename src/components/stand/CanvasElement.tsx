"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStandStore } from "@/lib/store";
import { StandElement } from "@/lib/types";
import { measureTextContent } from "@/lib/text-measure";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isCommittingTextEditRef = useRef(false);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [draftText, setDraftText] = useState(element.text ?? "Texte");

  const baseLeft = element.x * metersToPx * scale;
  const baseTop = element.y * metersToPx * scale;
  const width = element.width * metersToPx * scale;
  const height = element.height * metersToPx * scale;

  const left = baseLeft + (dragOffset?.dx ?? 0);
  const top = baseTop + (dragOffset?.dy ?? 0);
  const isDragging = dragOffset !== null;
  const isText = element.category === "texte";
  const baseTextFontSize = (element.fontSize ?? 18) * 0.8;

  useEffect(() => {
    if (!isEditingText || !textareaRef.current) {
      return;
    }

    isCommittingTextEditRef.current = false;
    textareaRef.current.focus();
    textareaRef.current.select();
  }, [isEditingText]);

  const commitInlineTextEdit = () => {
    if (!isText || isCommittingTextEditRef.current) {
      return;
    }

    isCommittingTextEditRef.current = true;

    const nextText = draftText.trim().length > 0 ? draftText : "Texte";
    const nextSize = measureTextContent({
      text: nextText,
      fontSize: baseTextFontSize,
      fontBold: element.fontBold,
      fontItalic: element.fontItalic,
    });

    setIsEditingText(false);
    useStandStore.getState().updateElement(element.id, {
      text: nextText,
      width: nextSize.widthPx / metersToPx,
      height: nextSize.heightPx / metersToPx,
    });
  };

  const cancelInlineTextEdit = () => {
    isCommittingTextEditRef.current = true;
    setDraftText(element.text ?? "Texte");
    setIsEditingText(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked || isReadOnly || isEditingText) return;
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

  return (
    <div
      className={`absolute select-none overflow-visible ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } ${isDragging ? "shadow-lg z-50 opacity-90" : "z-10"} ${
        element.locked || isReadOnly
          ? "cursor-not-allowed opacity-80"
          : isEditingText
            ? "cursor-text"
            : "cursor-move"
      }`}
      style={{
        left,
        top,
        width,
        height,
        willChange: isDragging ? "left, top" : "auto",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        if (!isText || isReadOnly) {
          return;
        }

        e.stopPropagation();
        e.preventDefault();
        onSelect();
        setDraftText(element.text ?? "Texte");
        setIsEditingText(true);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {isText ? (
        isEditingText ? (
          <textarea
            ref={textareaRef}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onBlur={commitInlineTextEdit}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitInlineTextEdit();
              }

              if (e.key === "Escape") {
                e.preventDefault();
                cancelInlineTextEdit();
              }
            }}
            className="h-full w-full resize-none overflow-hidden rounded-md border border-[#bfdbfe] bg-white px-1 py-0.5 text-left outline-none ring-2 ring-blue-200"
            style={{
              fontSize: baseTextFontSize * scale,
              lineHeight: 1.15,
              fontWeight: element.fontBold ? "bold" : "normal",
              fontStyle: element.fontItalic ? "italic" : "normal",
              color: element.color,
            }}
          />
        ) : (
          <div
            className="flex h-full w-full items-start justify-start"
            style={{
              transform: `rotate(${element.rotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            <span
              className="whitespace-pre"
              style={{
                fontSize: baseTextFontSize * scale,
                lineHeight: 1.15,
                fontWeight: element.fontBold ? "bold" : "normal",
                fontStyle: element.fontItalic ? "italic" : "normal",
                color: element.color,
              }}
            >
              {element.text}
            </span>
          </div>
        )
      ) : (
        <>
          <div
            className="h-full w-full rounded-[4px] shadow-sm"
            style={{
              backgroundColor: element.color,
              transform: `rotate(${element.rotation}deg)`,
              transformOrigin: "center center",
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 rounded-md border border-[#e2e8f0] bg-white/95 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-[#475569] shadow-sm whitespace-nowrap">
            {element.name}
          </div>
        </>
      )}

      {isSelected && !element.locked && !isReadOnly && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize rounded-tl-sm" />
      )}
    </div>
  );
}
