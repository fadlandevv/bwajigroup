export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-4 pt-5 pb-4 md:px-8 md:pt-7 md:pb-5">
        <div className="h-7 w-40 rounded-lg bg-gray-200 animate-pulse" />
        <div className="mt-1.5 h-4 w-24 rounded-md bg-gray-200 animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="px-4 py-5 md:px-8 md:py-6 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gray-200 animate-pulse flex-none" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-48 rounded bg-gray-100 animate-pulse" />
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </>
  );
}
