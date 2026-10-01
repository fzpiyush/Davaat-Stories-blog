import NewsletterForm from "./NewsletterForm";

export default function NewsletterSection() {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="w-full max-w-7xl 2xl:max-w-360 px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 mx-auto"
    >
      <div className="w-full px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12 bg-surface-muted rounded-lg">
        <div className="max-w-xl flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Stay in the loop
          </p>

          <h2
            id="newsletter-heading"
            className="font-serif text-2xl sm:text-3xl text-balance text-foreground"
          >
            New thoughts, straight to your inbox.
          </h2>

          <p className="text-sm leading-6 text-pretty text-muted">
            Get new posts, stories, and occasional updates without the noise.
          </p>
        </div>

        <div className="w-full lg:max-w-lg flex lg:flex-1">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
