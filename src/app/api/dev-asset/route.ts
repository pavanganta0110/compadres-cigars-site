import fs from "node:fs";
import path from "node:path";
import { devStoreAllowed } from "@/lib/store";
import { DEV_FILES_ROOT } from "@/lib/store/file";

const TYPES: Record<string, string> = { png: "image/png", ico: "image/x-icon", jpg: "image/jpeg" };

// Development only: serves uploaded site assets (favicon) from the local stand-in store.
export async function GET(request: Request) {
  if (!devStoreAllowed()) return new Response("Not found", { status: 404 });
  const name = (new URL(request.url).searchParams.get("name") ?? "").replace(/[^\w.\-]/g, "");
  const full = path.join(DEV_FILES_ROOT, "assets", name);
  const type = TYPES[name.split(".").pop() ?? ""];
  if (!type || !fs.existsSync(full)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(full), { headers: { "Content-Type": type, "X-Content-Type-Options": "nosniff" } });
}
