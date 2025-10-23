import { Skeleton } from './ui/skeleton';

export const NewsCardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-10 w-32" />
  </div>
);
