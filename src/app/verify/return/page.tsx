import type { Metadata } from "next";
import ReturnActions from "./ReturnActions";

export const metadata: Metadata = { title: "ID verification", robots: { index: false, follow: false } };

// Didit sends the customer here when they finish. The result itself is NOT read from this URL: the
// application form checks it with our server, which asks Didit.
export default function Page() {
  // The site's body background is dark, so this page brings its own white background (like the form page).
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-6 text-center font-[Times,'Times_New_Roman',serif] text-[#111]">
      <h1 className="text-2xl font-bold">Thank you</h1>
      <p className="mt-3 max-w-[460px]">
        We&apos;ve received your ID check. Return to your application tab. It will show &ldquo;Verified&rdquo; in a few seconds. This tab will close on its own.
      </p>
      <ReturnActions />
    </main>
  );
}
