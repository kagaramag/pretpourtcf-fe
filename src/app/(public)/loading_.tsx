import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero section skeleton */}
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-3/4 max-w-xl" />
          <Skeleton className="h-6 w-2/3 max-w-lg" />
          <Skeleton className="h-6 w-1/2 max-w-md" />
          <Skeleton className="h-12 w-48 rounded-full mt-4" />
        </div>

        {/* Content cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 p-6 rounded-lg border border-gray-100">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
