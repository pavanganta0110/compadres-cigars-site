import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto flex min-h-[175px] items-center bg-ink px-6 py-12 text-sm text-footer lg:px-[84px]">
      <div className="mx-auto w-full max-w-[1112px] space-y-6">
        <p>{SITE.warning}</p>
        <p>© Compadres Cigars. All rights reserved.</p>
      </div>
    </footer>
  );
}
