import { getSession } from "@/lib/auth";

const rateLimitWindowMs = 60_000;
const rateLimitMaxRequests = 120;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimitKey(request?: Request) {
  return request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request?.headers.get("x-real-ip")
    || "local-session";
}

function rateLimit(request?: Request) {
  const now = Date.now();
  const key = rateLimitKey(request);
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > rateLimitMaxRequests) {
    return Response.json(
      { ok: false, error: "Rate limit exceeded. Try again shortly." },
      { status: 429 },
    );
  }

  return null;
}

export async function requireApiSession() {
  const limited = rateLimit();
  if (limited) return limited;

  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function readUploadedText(request: Request, field = "file") {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get(field);
    if (!(file instanceof File)) throw new Error(`Missing uploaded ${field}`);
    return {
      text: await file.text(),
      filename: file.name,
    };
  }

  const body = await request.json() as { text?: string; filename?: string };
  if (!body.text) throw new Error("Missing request body text");
  return {
    text: body.text,
    filename: body.filename || "inline.csv",
  };
}

export function jsonError(error: unknown, status = 400) {
  return Response.json(
    { ok: false, error: error instanceof Error ? error.message : "Unknown import error" },
    { status },
  );
}

export function importBatchRow(input: {
  id: string;
  dataSourceId: string;
  sourceType: string;
  filename: string;
  recordCount: number;
}) {
  return {
    id: input.id,
    dataSourceId: input.dataSourceId,
    sourceType: input.sourceType,
    filename: input.filename,
    status: "SUCCESS",
    recordCount: input.recordCount,
    errorMessage: "",
    metadata: { backend: "google_sheets" },
    createdAt: new Date().toISOString(),
  };
}
