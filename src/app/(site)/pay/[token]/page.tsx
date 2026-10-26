import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeading from "@/components/PageHeading";
import { formatUsd, isPayToken } from "@/lib/authnet";
import { serif } from "@/components/FormField";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Payment", robots: { index: false, follow: false } };

export const instant = false; // per-request page (reads the payment from the database)

export default async function Page({ params, searchParams }: PageProps<"/pay/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const store = getStore();
  if (!store || !isPayToken(token)) notFound();
  const p = await store.getPaymentRequestByToken(token);
  if (!p) notFound();

  const returned = sp.returned === "1";
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px]">
      <div className="mx-auto max-w-[1112px]">
        <PageHeading>Payment</PageHeading>
        <div className={`${serif} mx-auto w-full max-w-[460px] rounded bg-white p-6`}>
          <p className="text-sm text-[#111]/60">Compadres Cigars</p>
          {p.description && <p className="mt-1 font-bold">{p.description}</p>}
          <p className="mt-4 text-3xl font-bold">{formatUsd(p.amount_cents)}</p>

          {p.status === "paid" ? (
            <p role="status" className="mt-6 font-bold text-green-700">✓ Paid. Thank you! We&apos;ll be in touch about your shipment.</p>
          ) : p.status === "cancelled" ? (
            <p role="status" className="mt-6">This payment request was cancelled. Please call us at (816) 878-3545.</p>
          ) : (
            <>
              {returned && (
                <p role="status" className="mt-6 rounded bg-[#197bff]/10 p-3 text-sm">
                  Thank you. We&apos;re confirming your payment with the payment processor. This page will show &ldquo;Paid&rdquo; once it&apos;s confirmed; you can refresh it in a minute.
                </p>
              )}
              <form method="POST" action={`/api/pay/${token}`} className="mt-6">
                <button type="submit" className="h-12 w-full rounded bg-[#197bff] text-lg font-bold text-white transition hover:brightness-110">
                  {returned ? "Pay again" : "Pay securely"}
                </button>
              </form>
              <p className="mt-4 text-sm leading-5 text-[#111]/60">
                You&apos;ll enter your card on our payment processor&apos;s secure page (Authorize.net). Compadres Cigars never sees or stores your card number.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
