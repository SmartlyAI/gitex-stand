import { NextRequest } from "next/server";
import { isStandAssetKind } from "@/lib/stand-assets";
import { uploadStandAssetToGridFs } from "@/lib/stand-assets.server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const kindValue = formData.get("kind");
    const fileValue = formData.get("file");

    if (typeof kindValue !== "string" || !isStandAssetKind(kindValue)) {
      return Response.json({ message: "Type d'asset invalide" }, { status: 400 });
    }

    if (!(fileValue instanceof File)) {
      return Response.json({ message: "Fichier manquant" }, { status: 400 });
    }

    const asset = await uploadStandAssetToGridFs(fileValue, kindValue);
    return Response.json(asset, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur inconnue";
    return Response.json({ message }, { status: 500 });
  }
}
