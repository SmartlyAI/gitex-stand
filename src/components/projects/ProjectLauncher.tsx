"use client";

import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePlanToApi } from "@/lib/plan-client";
import {
  buildPlanPath,
  createEmptyPlan,
  readStoredProjectLinks,
  StoredProjectLink,
  toAbsoluteProjectUrl,
  toRelativeProjectUrl,
  upsertStoredProjectLink,
} from "@/lib/project-links";

const CREATE_NEW_VALUE = "__create_new__";

export function ProjectLauncher() {
  const router = useRouter();
  const [projects, setProjects] = useState<StoredProjectLink[]>([]);
  const [selectedValue, setSelectedValue] = useState(CREATE_NEW_VALUE);
  const [newProjectName, setNewProjectName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedProjects = readStoredProjectLinks();
    setProjects(storedProjects);
    setSelectedValue(storedProjects[0]?.url ?? CREATE_NEW_VALUE);
  }, []);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (selectedValue !== CREATE_NEW_VALUE) {
      router.push(toRelativeProjectUrl(selectedValue));
      return;
    }

    try {
      setIsSubmitting(true);
      const planId = nanoid(10);
      const planName = newProjectName.trim() || `Projet ${projects.length + 1}`;
      const projectPath = buildPlanPath(planId, "editor");
      const projectUrl = toAbsoluteProjectUrl(projectPath);

      await savePlanToApi(createEmptyPlan(planId, planName));

      const nextProjects = upsertStoredProjectLink({
        planId,
        planName,
        url: projectUrl,
        updatedAt: new Date().toISOString(),
      });

      setProjects(nextProjects);
      router.push(projectPath);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Impossible de créer le projet"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasProjects = projects.length > 0;
  const isCreatingNewProject = selectedValue === CREATE_NEW_VALUE;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#e2e8f0] px-8 py-6 bg-gradient-to-br from-[#ffffff] to-[#f8fafc]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
            Gestion des projets
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#0f172a]">
            Ouvrir ou créer un projet de stand
          </h1>
          <p className="mt-2 text-sm text-[#64748b] leading-6 max-w-xl">
            L&apos;éditeur ne démarre plus depuis l&apos;URL racine. Choisissez un projet existant ou créez-en un nouveau pour obtenir une URL dédiée.
          </p>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[#334155]">
              Projet
            </label>
            <select
              value={selectedValue}
              onChange={(event) => setSelectedValue(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#dbe3ee] bg-white px-3 text-sm text-[#0f172a] outline-none transition-colors focus:border-[#3b82f6]"
            >
              <option value={CREATE_NEW_VALUE}>Créer un nouveau projet</option>
              {projects.map((project) => (
                <option key={project.planId} value={project.url}>
                  {project.planName} — {project.url}
                </option>
              ))}
            </select>
          </div>

          {isCreatingNewProject ? (
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-[#334155]">
                Nom du nouveau projet
              </label>
              <Input
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                placeholder="Ex. Stand Gitex 2026"
                className="h-11 border-[#dbe3ee] bg-white"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
              <p className="text-[12px] font-medium text-[#475569]">URL du projet sélectionné</p>
              <p className="mt-1 break-all text-[12px] text-[#0f172a]">
                {selectedValue}
              </p>
            </div>
          )}

          {!hasProjects && (
            <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-4 text-sm text-[#64748b] leading-6">
              Aucun projet enregistré localement pour le moment. Créez-en un pour initialiser son URL puis il sera proposé automatiquement ici.
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <p className="text-[12px] text-[#94a3b8]">
              Les URLs des projets disponibles sont mémorisées dans le stockage local du navigateur.
            </p>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-11 rounded-xl bg-[#0f172a] px-5 text-sm font-semibold text-white hover:bg-[#1e293b]"
            >
              {isSubmitting
                ? "Chargement..."
                : isCreatingNewProject
                  ? "Créer et ouvrir"
                  : "Ouvrir le projet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
