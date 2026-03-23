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
  const mode = searchParams.mode === "editor" ? "editor" : "readonly";

  const plan = await getPlanById(planId);

  if (!plan) {
    notFound();
  }

  return <StandEditor initialPlan={plan} readOnly={mode === "readonly"} />;
}
