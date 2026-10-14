import fs from "node:fs";
import path from "node:path";
import { getAdmin } from "@/lib/admin-auth";
import { devStoreAllowed } from "@/lib/store";
import { DEV_FILES_ROOT } from "@/lib/store/file";

// Development only: serves license uploads from the local stand-in store.
export async function GET(request: Request) {
  if (!devStoreAllowed() || !(await getAdmin())) return new Response("Not found", { status: 404 });
  const rel = new URL(request.url).searchParams.get("p") ?? "";
  const full = path.resolve(DEV_FILES_ROOT, rel);
  if (!full.startsWith(DEV_FILES_ROOT + path.sep) || !fs.existsSync(full)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(full), { headers: { "Content-Disposition": `attachment; filename="${path.basename(full)}"`, "X-Content-Type-Options": "nosniff" } });
}
