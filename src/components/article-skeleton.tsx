import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArticleSkeleton() {
  return (
    <Card className="h-full overflow-hidden border-border/50">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}
