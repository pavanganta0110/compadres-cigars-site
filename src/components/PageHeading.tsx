export default function PageHeading({ children, as: Tag = "h1" }: { children: React.ReactNode; as?: "h1" | "h2" }) {
  return (
    <Tag className="mb-10 text-center font-display text-3xl uppercase tracking-wide text-gold sm:text-4xl">
      {children}
    </Tag>
  );
}
