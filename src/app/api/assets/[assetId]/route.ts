import { NextRequest } from "next/server";
import {
  nodeStreamToWebReadable,
  openStandAssetDownloadStream,
} from "@/lib/stand-assets.server";

export const runtime = "nodejs";

interface AssetRouteContext {
  params: Promise<{ assetId: string }>;
}

export async function GET(
  _request: NextRequest,
  context: AssetRouteContext
) {
  try {
    const { assetId } = await context.params;
    const download = await openStandAssetDownloadStream(assetId);

    if (!download) {
      return Response.json({ message: "Asset introuvable" }, { status: 404 });
    }

    return new Response(nodeStreamToWebReadable(download.stream), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${encodeURIComponent(download.asset.filename)}"`,
        "Content-Type": download.asset.contentType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur inconnue";
    return Response.json({ message }, { status: 500 });
  }
}
