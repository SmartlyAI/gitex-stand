import { StandAssetKind, StandAssetReference } from "./types";

export async function uploadStandAsset(
  file: File,
  kind: StandAssetKind
): Promise<StandAssetReference> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("kind", kind);

  const response = await fetch("/api/assets", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Impossible d'envoyer le fichier";

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

  return response.json() as Promise<StandAssetReference>;
}
