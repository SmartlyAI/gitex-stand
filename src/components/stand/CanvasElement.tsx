"use client";

import React, { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { useStandStore } from "@/lib/store";
import { StandElement } from "@/lib/types";
import { measureTextContent } from "@/lib/text-measure";

interface CanvasElementProps {
  element: StandElement;
  scale: number;
  metersToPx: number;
  isSelected: boolean;
  isMultiSelected: boolean;
  isReadOnly: boolean;
  onSelect: (mode?: "single" | "toggle") => void;
  onDragStart: (id: string) => void;
  onDragMove: (id: string, totalDxM: number, totalDyM: number) => void;
  onDragEnd: (id: string, newX: number, newY: number) => void;
  onGroupDragEnd: () => void;
  snapToGrid: (val: number) => number;
  standWidth: number;
  standDepth: number;
}

export function CanvasElement({
  element,
  scale,
  metersToPx,
  isSelected,
  isMultiSelected,
  isReadOnly,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onGroupDragEnd,
  snapToGrid,
  standWidth,
  standDepth,
}: CanvasElementProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    liveGroup: boolean;
    didPushHistory: boolean;
  } | null>(null);
  const rotateRef = useRef<{ startAngle: number; startRotation: number; didPushHistory: boolean } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isCommittingTextEditRef = useRef(false);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [draftText, setDraftText] = useState(element.text ?? "Texte");
  const [previewRotation, setPreviewRotation] = useState<number | null>(null);

  const baseLeft = element.x * metersToPx * scale;
  const baseTop = element.y * metersToPx * scale;
  const width = element.width * metersToPx * scale;
  const height = element.height * metersToPx * scale;

  const left = baseLeft + (dragOffset?.dx ?? 0);
  const top = baseTop + (dragOffset?.dy ?? 0);
  const isDragging = dragOffset !== null;
  const isText = element.category === "texte";
  const baseTextFontSize = (element.fontSize ?? 18) * 0.8;
  const rotation = previewRotation ?? element.rotation;

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

    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      onSelect("toggle");
      return;
    }

    if (!isSelected) {
      onSelect("single");
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const liveGroup = isSelected && isMultiSelected;
    dragRef.current = {
      startX,
      startY,
      origX: element.x,
      origY: element.y,
      liveGroup,
      didPushHistory: false,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;

      if (dragRef.current.liveGroup) {
        if (!dragRef.current.didPushHistory && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
          onDragStart(element.id);
          dragRef.current.didPushHistory = true;
        }

        if (dragRef.current.didPushHistory) {
          const dxM = dx / scale / metersToPx;
          const dyM = dy / scale / metersToPx;
          const snappedDx = snapToGrid(dragRef.current.origX + dxM) - dragRef.current.origX;
          const snappedDy = snapToGrid(dragRef.current.origY + dyM) - dragRef.current.origY;
          onDragMove(element.id, snappedDx, snappedDy);
        }
        return;
      }

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

        if (dragRef.current.liveGroup) {
          onGroupDragEnd();
        } else {
          onDragEnd(element.id, newX, newY);
        }
      }

      dragRef.current = null;
      setDragOffset(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    if (element.locked || isReadOnly || isEditingText) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    if (!isSelected) {
      onSelect("single");
    }

    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    rotateRef.current = {
      startAngle,
      startRotation: element.rotation,
      didPushHistory: false,
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!rotateRef.current) {
        return;
      }

      const currentAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
      const rawRotation = rotateRef.current.startRotation + (currentAngle - rotateRef.current.startAngle);
      const nextRotation = event.shiftKey
        ? Math.round(rawRotation / 15) * 15
        : rawRotation;

      if (!rotateRef.current.didPushHistory && Math.abs(nextRotation - rotateRef.current.startRotation) > 0.1) {
        useStandStore.getState().pushHistory();
        rotateRef.current.didPushHistory = true;
      }

      setPreviewRotation(nextRotation);
      useStandStore.getState().setElementRotation(element.id, nextRotation);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      rotateRef.current = null;
      setPreviewRotation(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const containerClassName = `absolute select-none overflow-visible ${
    isDragging ? "z-50 opacity-90" : "z-10"
  } ${
    element.locked || isReadOnly
      ? "cursor-not-allowed opacity-80"
      : isEditingText
        ? "cursor-text"
        : "cursor-move"
  }`;

  return (
    <div
      className={containerClassName}
      style={{
        left,
        top,
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        willChange: isDragging ? "left, top" : "auto",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        if (!isText || isReadOnly) {
          return;
        }

        e.stopPropagation();
        e.preventDefault();
        if (!isSelected) {
          onSelect("single");
        }
        setDraftText(element.text ?? "Texte");
        setIsEditingText(true);
      }}
      onClick={(e) => {
        e.stopPropagation();

        if (e.metaKey || e.ctrlKey || e.shiftKey) {
          onSelect("toggle");
          return;
        }

        if (!isSelected) {
          onSelect("single");
        }
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
            className={`flex h-full w-full items-start justify-start ${
              isSelected ? "ring-[3px] ring-blue-500" : ""
            }`}
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
        <div
          className={`relative flex h-full w-full items-end justify-center overflow-hidden rounded-[4px] px-1 py-1 shadow-sm ${
            isSelected ? "ring-[3px] ring-blue-500" : ""
          }`}
          style={{
            backgroundColor: element.color,
          }}
        >
          <span className="pointer-events-none text-center text-[8px] font-medium leading-none text-white/85 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            {element.name}
          </span>
        </div>
      )}

      {isDragging && !isText && (
        <div className="pointer-events-none absolute inset-0 rounded-[4px] shadow-lg" />
      )}

      {isSelected && !element.locked && !isReadOnly && (
        <>
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-tl-sm bg-blue-500" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 -translate-y-full bg-blue-400" />
          <button
            type="button"
            onMouseDown={handleRotateMouseDown}
            className="absolute left-1/2 top-0 flex h-6 w-6 -translate-x-1/2 -translate-y-[calc(100%+24px)] items-center justify-center rounded-full border border-blue-300 bg-white text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
            title="Pivoter"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
