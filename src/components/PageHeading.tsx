export default function PageHeading({ children, as: Tag = "h1", mixed = false }: { children: React.ReactNode; as?: "h1" | "h2"; mixed?: boolean }) {
  return (
    <Tag className={`mb-10 text-center font-display text-[28px] leading-[1.4] text-gold lg:text-[39px] ${mixed ? "" : "uppercase"}`}>
      {children}
    </Tag>
  );
}
