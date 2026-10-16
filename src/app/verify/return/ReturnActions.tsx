"use client";

import { useEffect } from "react";

// The ID check opens in a second tab so the application form isn't lost. When Didit sends the customer
// here, close this tab so they land back on the form (which updates itself). Browsers only allow a tab to
// close itself if a script opened it, which is how the form opens it; otherwise the link below is the way back.
export default function ReturnActions() {
  useEffect(() => {
    const t = setTimeout(() => window.close(), 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <a href="/become-a-customer" className="mt-6 inline-block rounded bg-[#197bff] px-5 py-3 font-bold text-white hover:brightness-110">
      Back to my application
    </a>
  );
}
