export default function Section({ children, className = "", dark = false }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <section className={`${dark ? "bg-ink-deep" : ""} px-6 py-14 lg:px-[84px]`}>
      <div className={`mx-auto max-w-[1112px] ${className}`}>{children}</div>
    </section>
  );
}
