import "server-only";
import { WithId, Document } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
import { DEFAULT_STAND_FLOOR_SETTINGS, normalizeStandFloorSettings } from "@/lib/stand-floor";
import { normalizeStandElements } from "@/lib/stand-assets";
import { StandPlan } from "@/lib/types";

const COLLECTION_NAME = "stand_plans";

type StandPlanDocument = WithId<Document> & StandPlan;

function normalizePlan(document: StandPlanDocument): StandPlan {
  return {
    planId: document.planId,
    planName: document.planName,
    dimensions: document.dimensions,
    floorSettings: normalizeStandFloorSettings(document.floorSettings),
    elements: normalizeStandElements(document.elements),
    history: (document.history ?? []).map((entry) => ({
      ...entry,
      elements: normalizeStandElements(entry.elements),
      floorSettings: normalizeStandFloorSettings(entry.floorSettings),
    })),
    historyIndex: typeof document.historyIndex === "number" ? document.historyIndex : -1,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export async function getPlanById(planId: string): Promise<StandPlan | null> {
  const db = await getMongoDb();
  const document = await db
    .collection<StandPlanDocument>(COLLECTION_NAME)
    .findOne({ planId });

  return document ? normalizePlan(document) : null;
}

export async function savePlan(plan: StandPlan): Promise<StandPlan> {
  const db = await getMongoDb();
  const now = new Date().toISOString();
  const existing = await getPlanById(plan.planId);
  const normalizedPlan: StandPlan = {
    ...plan,
    floorSettings: normalizeStandFloorSettings(plan.floorSettings),
    elements: normalizeStandElements(plan.elements),
    history: (plan.history ?? []).map((entry) => ({
      ...entry,
      elements: normalizeStandElements(entry.elements),
      floorSettings: normalizeStandFloorSettings(entry.floorSettings),
    })),
  };

  await db.collection<StandPlan>(COLLECTION_NAME).updateOne(
    { planId: normalizedPlan.planId },
    {
      $set: {
        planId: normalizedPlan.planId,
        planName: normalizedPlan.planName,
        dimensions: normalizedPlan.dimensions,
        floorSettings: normalizedPlan.floorSettings ?? DEFAULT_STAND_FLOOR_SETTINGS,
        elements: normalizedPlan.elements,
        history: normalizedPlan.history,
        historyIndex: normalizedPlan.historyIndex,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: existing?.createdAt ?? now,
      },
    },
    { upsert: true }
  );

  return {
    ...normalizedPlan,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
