import NewsletterForm from "./NewsletterForm";

export default function NewsletterSection() {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="w-full max-w-7xl mx-auto px-6 pb-20 lg:px-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12 px-6 py-10 sm:px-10 bg-surface-muted rounded-lg">
        <div className="max-w-xl flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Stay in the loop
          </p>

          <h2
            id="newsletter-heading"
            className="text-balance font-serif text-3xl text-foreground"
          >
            New thoughts, straight to your inbox.
          </h2>

          <p className="text-pretty text-sm leading-6 text-muted">
            Get new posts, stories, and occasional updates without the noise.
          </p>
        </div>

        <NewsletterForm />
      </div>
    </section>
  );
}
