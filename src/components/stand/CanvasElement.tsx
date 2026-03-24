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
  onResizeEnd?: (id: string, newWidth: number, newHeight: number) => void;
  snapToGrid: (val: number) => number;
  standWidth: number;
  standDepth: number;
}

function FurniturePlanPreview({ element, isSelected }: { element: StandElement; isSelected: boolean }) {
  if (element.catalogId === "mini_bar_couronne_logo") {
    return (
      <div
        className={`relative flex h-full w-full items-end justify-center overflow-hidden rounded-[6px] px-1 py-1 shadow-sm ${
          isSelected ? "ring-[3px] ring-blue-500" : ""
        }`}
        style={{
          background: `linear-gradient(180deg, ${element.color} 0%, rgba(71, 53, 31, 0.92) 100%)`,
        }}
      >
        <div className="absolute inset-[12%] rounded-[6px] border-2 border-white/70" />
        
        {/* Forme en U du comptoir (avec passage démontable arrière) */}
        <div className="absolute inset-x-[18%] bottom-[12%] top-[24%] rounded-[8px] border border-white/50 bg-[#4b2e1c]/22" />
        <div className="absolute inset-x-[26%] bottom-[20%] top-[32%] rounded-[4px] border border-white/35 bg-[#0f172a]/16" />
        {/* Ligne indiquant la séparation de la planche démontable */}
        <div className="absolute left-1/2 bottom-[12%] h-[8%] w-[16%] -translate-x-1/2 border-x border-white/40 bg-white/5" />
        
        {/* Etagere et machine à café */}
        <div className="absolute left-1/2 top-[38%] h-[12%] w-[14%] -translate-x-1/2 rounded-[3px] border border-white/30 bg-[#9ca3af]" />
        <div className="absolute left-1/2 top-[40%] h-[4%] w-[8%] -translate-x-1/2 rounded-[2px] bg-[#334155]" />

        <div className="absolute left-[14%] top-[14%] h-[10%] w-[10%] rounded-[3px] bg-white/80" />
        <div className="absolute right-[14%] top-[14%] h-[10%] w-[10%] rounded-[3px] bg-white/80" />
        <div className="absolute bottom-[14%] left-[14%] h-[10%] w-[10%] rounded-[3px] bg-white/80" />
        <div className="absolute bottom-[14%] right-[14%] h-[10%] w-[10%] rounded-[3px] bg-white/80" />
        <div
          className="absolute left-1/2 top-[14%] h-[16%] w-[52%] -translate-x-1/2 rounded-full border border-white/65 bg-white/85 bg-center bg-contain bg-no-repeat"
          style={{
            backgroundImage: element.logoAsset?.url
              ? `url(${element.logoAsset.url})`
              : undefined,
          }}
        />
        <div className="absolute left-1/2 bottom-[8%] h-[16%] w-[18%] -translate-x-1/2 rounded-t-md border border-white/45 bg-[#6b4423]/80" />
        <span className="pointer-events-none relative text-center text-[8px] font-medium leading-none text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
          {element.name}
        </span>
      </div>
    );
  }

  if (element.catalogId === "table_demo") {
    const isLeft = element.storageOrientation === "left";
    return (
      <div
        className={`relative flex h-full w-full overflow-hidden rounded-[4px] px-1 py-1 shadow-sm ${
          isSelected ? "ring-[3px] ring-blue-500" : ""
        }`}
        style={{ backgroundColor: element.color }}
      >
        {/* Zone de rangement */}
        <div 
          className={`absolute top-0 bottom-0 w-[35%] bg-black/15 ${isLeft ? "left-0 border-r border-white/20" : "right-0 border-l border-white/20"}`} 
        />
        <div className="absolute inset-0 flex items-center justify-center p-1">
          <span className="pointer-events-none text-center text-[8px] font-medium leading-none text-white/85 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            {element.name}
          </span>
        </div>
      </div>
    );
  }

  if (element.catalogId === "presentoir_brochures") {
    return (
      <div
        className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[4px] shadow-sm ${
          isSelected ? "ring-[3px] ring-blue-500" : ""
        }`}
        style={{ backgroundColor: element.color }}
      >
        <div className="absolute top-[10%] h-[40%] w-[80%] rounded-[2px] bg-white/20 border border-white/40" />
        <div className="absolute top-[20%] h-[20%] w-[60%] bg-white/40" />
        <div className="absolute bottom-[20%] h-[20%] w-[40%] rounded-full bg-black/10" />
        <span className="pointer-events-none z-10 text-center text-[7px] font-medium leading-none text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
          Brochures
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-[4px] px-1 py-1 shadow-sm ${
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
  );
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
  onResizeEnd,
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
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number; didPushHistory: boolean } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isCommittingTextEditRef = useRef(false);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const [resizeOffset, setResizeOffset] = useState<{ dw: number; dh: number } | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [draftText, setDraftText] = useState(element.text ?? "Texte");
  const [previewRotation, setPreviewRotation] = useState<number | null>(null);

  const baseLeft = element.x * metersToPx * scale;
  const baseTop = element.y * metersToPx * scale;
  const baseWidth = element.width * metersToPx * scale;
  const baseHeight = element.height * metersToPx * scale;

  const left = baseLeft + (dragOffset?.dx ?? 0);
  const top = baseTop + (dragOffset?.dy ?? 0);
  const width = baseWidth + (resizeOffset?.dw ?? 0);
  const height = baseHeight + (resizeOffset?.dh ?? 0);
  const isDragging = dragOffset !== null;
  const isResizing = resizeOffset !== null;
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

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (element.locked || isReadOnly || isEditingText || isText) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    if (!isSelected) {
      onSelect("single");
    }

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      didPushHistory: false,
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!resizeRef.current) return;

      const dx = event.clientX - resizeRef.current.startX;
      const dy = event.clientY - resizeRef.current.startY;

      // Unrotate the dx/dy to match the element's local coordinate system
      const angleRad = (-element.rotation * Math.PI) / 180;
      const localDx = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
      const localDy = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

      if (!resizeRef.current.didPushHistory && (Math.abs(localDx) > 1 || Math.abs(localDy) > 1)) {
        useStandStore.getState().pushHistory();
        resizeRef.current.didPushHistory = true;
      }

      // Live visual preview via local state
      setResizeOffset({ dw: localDx, dh: localDy });
    };

    const handleMouseUp = (event: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (resizeRef.current && onResizeEnd) {
        const dx = event.clientX - resizeRef.current.startX;
        const dy = event.clientY - resizeRef.current.startY;
        
        const angleRad = (-element.rotation * Math.PI) / 180;
        const localDx = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
        const localDy = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

        const dwM = localDx / scale / metersToPx;
        const dhM = localDy / scale / metersToPx;

        // Min size 1cm (0.01m)
        const newWidth = Math.max(0.01, resizeRef.current.startWidth + dwM);
        const newHeight = Math.max(0.01, resizeRef.current.startHeight + dhM);

        onResizeEnd(element.id, newWidth, newHeight);
      }

      resizeRef.current = null;
      setResizeOffset(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const layerClassName = isText
    ? isDragging
      ? "z-[90] opacity-95"
      : "z-[80]"
    : isDragging
      ? "z-50 opacity-90"
      : "z-10";
  const containerClassName = `absolute select-none overflow-visible ${layerClassName} ${
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
        willChange: isDragging || isResizing ? "left, top, width, height" : "auto",
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
              // Always use a dark color while editing so text stays readable
              color: "#111827",
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
        <FurniturePlanPreview element={element} isSelected={isSelected} />
      )}

      {isDragging && !isText && (
        <div className="pointer-events-none absolute inset-0 rounded-[4px] shadow-lg" />
      )}

      {/* Rotate Handle */}
      {!isReadOnly && !element.locked && isSelected && (
        <div
          className="absolute -right-5 top-1/2 z-[100] flex -translate-y-1/2 cursor-grab items-center justify-center rounded-full border border-blue-500 bg-white p-1 shadow-sm active:cursor-grabbing"
          onMouseDown={handleRotateMouseDown}
          title="Pivoter"
        >
          <RotateCw className="h-2.5 w-2.5 text-blue-600" />
        </div>
      )}

      {/* Resize Handle (bottom-right) */}
      {!isReadOnly && !element.locked && !isText && isSelected && (
        <div
          className="absolute -bottom-1 -right-1 z-[100] h-3 w-3 cursor-se-resize rounded-full border border-blue-500 bg-white shadow-sm"
          onMouseDown={handleResizeMouseDown}
          title="Redimensionner"
        />
      )}
    </div>
  );
}
