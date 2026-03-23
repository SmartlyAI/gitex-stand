"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStandStore } from "@/lib/store";
import { savePlanToApi } from "@/lib/plan-client";
import { buildPlanPath } from "@/lib/project-links";
import { Eye, Pencil, Copy, Check } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareModal({ open, onOpenChange }: ShareModalProps) {
  const { planId, isReadOnly, serializePlan } = useStandStore();
  const [mode, setMode] = useState<"readonly" | "editor">("readonly");
  const [copied, setCopied] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const shareUrl = useMemo(() => {
    const base =
      typeof window !== "undefined" ? window.location.origin : "";
    return `${base}${buildPlanPath(planId, mode)}`;
  }, [planId, mode]);

  const handleCopy = async () => {
    if (!planId) return;

    try {
      setIsPreparing(true);
      if (!isReadOnly) {
        await savePlanToApi(serializePlan());
      }

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Partager le plan</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choisissez le mode de partage et envoyez le lien à votre
            prestataire.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {/* Readonly */}
          <button
            className={`flex flex-col items-start p-3 rounded-lg border-2 text-left transition-colors ${
              mode === "readonly"
                ? "border-emerald-500 bg-emerald-50"
                : "border-border hover:border-muted-foreground/30"
            }`}
            onClick={() => setMode("readonly")}
          >
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-sm">Lecture seule</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Le prestataire pourra voir le plan mais ne pourra pas le
              modifier.
            </p>
          </button>

          {/* Editor */}
          <button
            className={`flex flex-col items-start p-3 rounded-lg border-2 text-left transition-colors ${
              mode === "editor"
                ? "border-emerald-500 bg-emerald-50"
                : "border-border hover:border-muted-foreground/30"
            }`}
            disabled={isReadOnly}
            onClick={() => setMode("editor")}
          >
            <div className="flex items-center gap-2 mb-1">
              <Pencil className="h-4 w-4" />
              <span className="font-medium text-sm">Éditeur</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Le prestataire peut modifier le plan. Les changements écrasent la
              version actuelle.
            </p>
          </button>
        </div>

        {/* Link */}
        <div className="mt-4">
          <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
            <Check className="h-3 w-3 text-emerald-500" />
            Lien de partage ({mode === "readonly" ? "lecture seule" : "éditeur"})
          </label>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="text-sm h-9" />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleCopy}
              disabled={isPreparing || !planId}
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 p-3 rounded-md bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-800">
            {mode === "readonly"
              ? "Le prestataire pourra visualiser le plan avec toutes les dimensions et positions, sans pouvoir le modifier."
              : "Le prestataire pourra modifier le plan. Les changements seront sauvegardés automatiquement."}
          </p>
        </div>

        <div className="text-[10px] text-muted-foreground mt-2">
          ID du plan : {planId}
        </div>
      </DialogContent>
    </Dialog>
  );
}
