import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import { Category } from "@/hooks/useCategories";

interface DraggableCategoryItemProps {
  category: Category;
  linksCount: number;
  onEdit: (category: Category) => void;
  onClick: () => void;
}

export const DraggableCategoryItem = ({
  category,
  linksCount,
  onEdit,
  onClick,
}: DraggableCategoryItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:border-primary transition-all hover:shadow-md ${
        isDragging ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                style={{ backgroundColor: category.color || "hsl(var(--primary))" }}
              >
                {category.icon_name || "📁"}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
                }}
              >
                <Layers className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{category.slug}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {linksCount} {linksCount === 1 ? "link" : "links"}
              </Badge>
              {category.subcategories && (
                <Badge variant="outline" className="text-xs">
                  {category.subcategories.split(',').length} subcategories
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

