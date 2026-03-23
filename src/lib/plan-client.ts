import { StandPlan } from "@/lib/types";

export async function savePlanToApi(plan: StandPlan): Promise<StandPlan> {
  const response = await fetch(`/api/plans/${plan.planId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(plan),
  });

  if (!response.ok) {
    let message = "Impossible de sauvegarder le plan";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  return response.json() as Promise<StandPlan>;
}
