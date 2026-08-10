export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  light = false,
  as: Tag = "h2",
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <Tag
        className={`font-heading text-3xl font-bold tracking-tight sm:text-4xl ${
          light ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </Tag>
      {subtitle && <p className="subtitle-serif mt-2 text-lg sm:text-xl">{subtitle}</p>}
    </div>
  );
}
