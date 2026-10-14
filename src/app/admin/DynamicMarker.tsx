import { connection } from "next/server";

// Admin pages are always rendered per request (they need the signed-in user). Rendering this inside
// <Suspense> tells Next the page's head tags can't be prerendered either.
export default async function DynamicMarker() {
  await connection();
  return null;
}
