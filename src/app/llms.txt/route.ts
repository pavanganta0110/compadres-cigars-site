import { defaultLlms, getSettings } from "@/lib/settings";

export async function GET() {
  const s = await getSettings();
  return new Response(s.llms.text.trim() ? s.llms.text : defaultLlms(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
