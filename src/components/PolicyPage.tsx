import { getSettings } from "@/lib/settings";
import { POLICY_UPDATED, type Policy } from "@/lib/policies";

export default async function PolicyPage({ policy }: { policy: Policy }) {
  const s = await getSettings();
  const email = s.basic.email;
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px]">
      <div className="mx-auto max-w-[800px]">
        <h1 className="mb-3 text-center font-display text-[28px] uppercase leading-[1.4] text-gold lg:text-[39px]">{policy.title}</h1>
        <p className="mb-10 text-center text-sm text-muted">Last updated {POLICY_UPDATED}</p>
        <p className="leading-7">{policy.intro}</p>
        {policy.sections.map((sec) => (
          <div key={sec.h} className="mt-8">
            <h2 className="mb-3 text-xl uppercase leading-7 text-bone">{sec.h}</h2>
            {sec.p?.map((t) => <p key={t} className="mt-3 leading-7 text-muted">{t}</p>)}
            {sec.ul && (
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-7 text-muted">
                {sec.ul.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
            {sec.h === "Contact us" || sec.h === "How to contact us" ? (
              email ? <p className="mt-3 leading-7 text-muted">Email: <a href={`mailto:${email}`} className="underline">{email}</a></p> : null
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
