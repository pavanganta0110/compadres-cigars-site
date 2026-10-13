import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto bg-ink px-4 py-10 text-sm text-muted">
      <div className="mx-auto max-w-6xl space-y-4">
        <p>{SITE.warning}</p>
        <p>© Compadres Cigars. All rights reserved.</p>
      </div>
    </footer>
  );
}
