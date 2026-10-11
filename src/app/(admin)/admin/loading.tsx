const blockClass =
  "bg-surface border border-border rounded-xl animate-pulse motion-reduce:animate-none";

export default function AdminLoading() {
  return (
    <div role="status" className="w-full flex flex-col gap-6">
      <span className="sr-only">Loading page</span>

      <div className="w-56 h-9 bg-surface-muted rounded-lg animate-pulse motion-reduce:animate-none" />

      <div className={`w-full h-40 ${blockClass}`} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {[0, 1, 2].map((item) => (
          <div key={item} className={`w-full h-56 ${blockClass}`} />
        ))}
      </div>
    </div>
  );
}
