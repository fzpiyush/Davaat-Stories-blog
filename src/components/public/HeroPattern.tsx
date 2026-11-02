/* Faint ink dots and a soft warm glow behind page headings, fading out at the edges */
export default function HeroPattern() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 pointer-events-none"
    >
      <div className="bg-radial-[ellipse_at_50%_0%] from-accent/10 via-transparent via-60% to-transparent absolute inset-0" />

      <div className="bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[22px_22px] absolute inset-0 mask-[radial-gradient(ellipse_70%_60%_at_50%_35%,black_20%,transparent_75%)]" />
    </div>
  );
}
