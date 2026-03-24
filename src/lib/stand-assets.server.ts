import "server-only";
import { GridFSBucket, ObjectId } from "mongodb";
import { getMongoDb } from "./mongodb";
import {
  buildStandAssetUrl,
  isStandAssetKind,
  isSupportedStandAssetContentType,
  STAND_ASSET_MAX_SIZE_BYTES,
} from "./stand-assets";
import { StandAssetKind, StandAssetReference } from "./types";

const BUCKET_NAME = "stand_assets";

interface GridFsAssetFile {
  _id: ObjectId;
  filename: string;
  metadata?: {
    kind?: string;
    contentType?: string;
  };
}

function getAssetBucket() {
  return getMongoDb().then((db) => new GridFSBucket(db, { bucketName: BUCKET_NAME }));
}

function buildAssetReference(file: GridFsAssetFile): StandAssetReference {
  const kind = file.metadata?.kind;
  if (!kind || !isStandAssetKind(kind)) {
    throw new Error("Asset GridFS invalide");
  }

  return {
    assetId: file._id.toString(),
    contentType: file.metadata?.contentType ?? "application/octet-stream",
    filename: file.filename,
    kind,
    url: buildStandAssetUrl(file._id.toString()),
  };
}

export async function uploadStandAssetToGridFs(
  file: File,
  kind: StandAssetKind
): Promise<StandAssetReference> {
  if (!file.name) {
    throw new Error("Fichier invalide");
  }

  if (file.size > STAND_ASSET_MAX_SIZE_BYTES) {
    throw new Error("Le fichier dépasse la taille maximale autorisée");
  }

  const contentType = (file.type || "application/octet-stream").toLowerCase();
  if (!isSupportedStandAssetContentType(kind, contentType)) {
    throw new Error("Type de fichier non supporté pour cet usage");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = await getAssetBucket();
  const uploadStream = bucket.openUploadStream(file.name, {
    metadata: {
      kind,
      contentType,
    },
  });

  await new Promise<void>((resolve, reject) => {
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve());
    uploadStream.end(buffer);
  });

  const fileId = uploadStream.id;
  if (!(fileId instanceof ObjectId)) {
    throw new Error("Impossible de déterminer l'identifiant du fichier uploadé");
  }

  return {
    assetId: fileId.toString(),
    contentType,
    filename: file.name,
    kind,
    url: buildStandAssetUrl(fileId.toString()),
  };
}

export async function getStandAssetReferenceById(
  assetId: string
): Promise<StandAssetReference | null> {
  if (!ObjectId.isValid(assetId)) {
    return null;
  }

  const db = await getMongoDb();
  const file = await db
    .collection<GridFsAssetFile>(`${BUCKET_NAME}.files`)
    .findOne({ _id: new ObjectId(assetId) });

  return file ? buildAssetReference(file) : null;
}

export async function openStandAssetDownloadStream(assetId: string) {
  if (!ObjectId.isValid(assetId)) {
    return null;
  }

  const db = await getMongoDb();
  const objectId = new ObjectId(assetId);
  const file = await db
    .collection<GridFsAssetFile>(`${BUCKET_NAME}.files`)
    .findOne({ _id: objectId });

  if (!file) {
    return null;
  }

  const bucket = await getAssetBucket();

  return {
    asset: buildAssetReference(file),
    stream: bucket.openDownloadStream(objectId),
  };
}

export function nodeStreamToWebReadable(stream: NodeJS.ReadableStream) {
  const destroyableStream = stream as NodeJS.ReadableStream & {
    destroy?: (error?: Error) => void;
  };

  return new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("data", (chunk: Buffer | Uint8Array | string) => {
        if (typeof chunk === "string") {
          controller.enqueue(new TextEncoder().encode(chunk));
          return;
        }

        controller.enqueue(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
      });
      stream.on("end", () => controller.close());
      stream.on("error", (error) => controller.error(error));
    },
    cancel() {
      if (typeof destroyableStream.destroy === "function") {
        destroyableStream.destroy();
      }
    },
  });
}
