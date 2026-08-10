export default function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-navy">
      <div className="container-site py-16 text-center sm:py-20">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="subtitle-serif mt-3 text-lg sm:text-xl">{subtitle}</p>}
      </div>
      <div className="h-1 w-full bg-gold" />
    </section>
  );
}
