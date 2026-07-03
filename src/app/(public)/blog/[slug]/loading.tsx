import { Skeleton } from "@/components/ui/skeleton";

export default function BlogDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-4 w-48 mb-8" />
      <Skeleton className="h-64 w-full rounded-lg mb-8" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
