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
    <div className="w-full h-full flex flex-col bg-surface shadow-sm rounded-lg overflow-hidden">
      <Skeleton className="w-full aspect-16/10" shape="block" />

      <div className="p-5 sm:p-6 flex flex-1 flex-col gap-4">
        <Skeleton className="w-20 h-6" shape="pill" />

        <div className="flex flex-col gap-2">
          <Skeleton className="w-full h-6 sm:h-7" />
          <Skeleton className="w-2/3 h-6 sm:h-7" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-4/5 h-4" />
        </div>

        <div className="pt-4 flex items-center justify-between">
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
      className="w-full max-w-7xl 2xl:max-w-360 min-h-screen px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24 mx-auto flex flex-col gap-12 sm:gap-16"
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

          <div className="max-w-2xl pt-1 flex flex-col gap-2">
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
