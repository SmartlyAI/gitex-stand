import { NextRequest } from "next/server";
import { getPlanById, savePlan } from "@/lib/plans";
import { StandPlan } from "@/lib/types";

export const runtime = "nodejs";

interface PlanRouteContext {
  params: Promise<{ planId: string }>;
}

export async function GET(
  _request: NextRequest,
  context: PlanRouteContext
) {
  try {
    const { planId } = await context.params;
    const plan = await getPlanById(planId);

    if (!plan) {
      return Response.json({ message: "Plan introuvable" }, { status: 404 });
    }

    return Response.json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur inconnue";
    return Response.json({ message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: PlanRouteContext
) {
  try {
    const { planId } = await context.params;
    const body = (await request.json()) as StandPlan;

    if (!body || body.planId !== planId) {
      return Response.json({ message: "Plan invalide" }, { status: 400 });
    }

    const savedPlan = await savePlan(body);
    return Response.json(savedPlan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur inconnue";
    return Response.json({ message }, { status: 500 });
  }
}
