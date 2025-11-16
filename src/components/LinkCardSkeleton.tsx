import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LinkCardSkeleton = () => {
  return (
    <Card className="border-border bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-2.5 md:p-3">
        <div className="flex items-center gap-2 md:gap-3">
          <Skeleton className="w-10 h-10 md:w-11 md:h-11 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 md:h-4 w-3/4" />
            <Skeleton className="h-2.5 md:h-3 w-1/2" />
          </div>
          <Skeleton className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkCardSkeleton;

