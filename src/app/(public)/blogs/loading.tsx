type SkeletonShape = "line" | "pill" | "block";

interface SkeletonProps {
  className: string;
  shape?: SkeletonShape;
}

const shapeClass: Record<SkeletonShape, string> = {
  line: "rounded",
  pill: "rounded-full",
  block: "",
};

function Skeleton({ className, shape = "line" }: SkeletonProps) {
  return (
    <div className={`${className} bg-surface-muted ${shapeClass[shape]}`} />
  );
}

function BlogCardSkeleton() {
  return (
    <div className="w-full h-full flex flex-col bg-surface rounded-lg overflow-hidden shadow-sm">
      <Skeleton className="w-full aspect-16/10" shape="block" />

      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="w-20 h-6" shape="pill" />

        <div className="flex flex-col gap-2">
          <Skeleton className="w-full h-7" />
          <Skeleton className="w-2/3 h-7" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-4/5 h-4" />
        </div>

        <div className="flex items-center justify-between pt-4">
          <Skeleton className="w-32 h-3" />
          <Skeleton className="w-12 h-3" />
        </div>
      </div>
    </div>
  );
}

export default function BlogsLoading() {
  return (
    <section
      aria-busy="true"
      className="w-full max-w-7xl min-h-screen flex flex-col gap-12 sm:gap-16 mx-auto px-6 py-16 sm:py-20 lg:px-8 lg:py-24"
    >
      <p role="status" className="sr-only">
        Loading posts
      </p>

      <div
        aria-hidden="true"
        className="flex flex-col gap-12 sm:gap-16 animate-pulse motion-reduce:animate-none"
      >
        <div className="max-w-3xl flex flex-col gap-5">
          <Skeleton className="w-28 h-4" />

          <div className="flex flex-col gap-3">
            <Skeleton className="w-full h-10 sm:h-12 lg:h-14" />
            <Skeleton className="w-3/4 h-10 sm:h-12 lg:h-14" />
          </div>

          <div className="max-w-2xl flex flex-col gap-2 pt-1">
            <Skeleton className="w-full h-5" />
            <Skeleton className="w-2/3 h-5" />
          </div>

          <Skeleton className="w-16 h-4" />
        </div>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="flex">
              <BlogCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
