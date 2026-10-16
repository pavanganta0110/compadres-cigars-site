import type { Metadata } from "next";

export const metadata: Metadata = { title: "ID verification", robots: { index: false, follow: false } };

// Didit sends the customer here when they finish. The result itself is NOT read from this URL: the
// application form checks it with our server, which asks Didit.
export default function Page() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[460px] flex-col items-center justify-center px-6 text-center font-[Times,'Times_New_Roman',serif] text-[#111]">
      <h1 className="text-2xl font-bold">Thank you</h1>
      <p className="mt-3">
        We&apos;ve received your ID check. You can close this tab and return to your application. It will update on its own in a few seconds.
      </p>
    </main>
  );
}
