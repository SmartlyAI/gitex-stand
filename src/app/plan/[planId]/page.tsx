import { notFound } from "next/navigation";
import { StandEditor } from "@/components/stand/StandEditor";
import { getPlanById } from "@/lib/plans";

interface PlanPageProps {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function PlanPage(props: PlanPageProps) {
  const { planId } = await props.params;
  const searchParams = await props.searchParams;
  
  // Par défaut c'est un viewer si rien n'est spécifié,
  // ou si c'est explicitement mode=readonly.
  // Pour être éditeur, il faut que mode=editor soit présent.
  const isEditor = searchParams.mode === "editor";
  const mode = isEditor ? "editor" : "readonly";

  const plan = await getPlanById(planId);

  if (!plan) {
    notFound();
  }

  return <StandEditor initialPlan={plan} readOnly={mode === "readonly"} />;
}
