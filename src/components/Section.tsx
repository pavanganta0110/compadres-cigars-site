export default function Section({ children, className = "", dark = false }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <section className={`${dark ? "bg-ink-deep" : ""} px-4 py-14 sm:py-20`}>
      <div className={`mx-auto max-w-5xl ${className}`}>{children}</div>
    </section>
  );
}
