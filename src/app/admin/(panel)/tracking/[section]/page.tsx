import { notFound } from "next/navigation";
import { SECTIONS, loadSettings, sectionBySlug } from "@/lib/settings";
import { getStore } from "@/lib/store";
import SettingsForm from "../../../SettingsForm";
import { Card, Notice, PageTitle } from "../../../ui";

export default async function TrackingPage({ params }: PageProps<"/admin/tracking/[section]">) {
  const { section } = await params;
  const spec = sectionBySlug(section);
  if (!spec || spec.group !== "tracking") notFound();

  const store = getStore();
  if (!store) return <><PageTitle title={spec.title}>{spec.description}</PageTitle><Notice tone="warn">The database isn&apos;t connected yet (see the README setup steps).</Notice></>;

  const s = await loadSettings();
  const banner = s.cookieBanner.enabled === "1";
  return (
    <>
      <PageTitle title={spec.title}>{spec.description}</PageTitle>
      {spec.key !== "cookieBanner" && (
        <Notice>
          {banner ? "Your cookie banner is ON: this tag loads only after a visitor accepts." : "Your cookie banner is OFF: this tag loads for every visitor. Turn the banner on under Cookie Banner if you serve visitors who need consent."}
        </Notice>
      )}
      <Card>
        <SettingsForm sectionKey={spec.key} fields={spec.fields.map(({ pattern: _p, patternHelp: _h, ...f }) => f)} values={(s as unknown as Record<string, Record<string, string>>)[spec.key]} />
      </Card>
    </>
  );
}

export function generateStaticParams() {
  return SECTIONS.filter((x) => x.group === "tracking").map((x) => ({ section: x.slug }));
}
