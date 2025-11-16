import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pin, Star, Eye, EyeOff, Edit, Trash2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useUpdateLink, useDeleteLink } from "@/hooks/useLinks";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DraggableLinkItemProps {
  link: Link;
  onEdit: (link: Link) => void;
}

export const DraggableLinkItem = ({ link, onEdit }: DraggableLinkItemProps) => {
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLink.mutate({ id: link.id, is_pinned: !link.is_pinned });
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLink.mutate({ id: link.id, is_active: !link.is_active });
  };

  const handleToggleFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLink.mutate({ id: link.id, is_featured: !link.is_featured });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const isExpired = date < now;
    const formatted = date.toLocaleDateString();
    return { formatted, isExpired };
  };

  const expirationInfo = formatDate(link.expiration_date);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${!link.is_active ? "opacity-50" : ""} ${
        isDragging ? "ring-2 ring-primary" : ""
      }`}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded flex-shrink-0"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold truncate text-sm md:text-base">{link.title}</h3>
                <div className="flex gap-1 flex-shrink-0">
                  {link.is_pinned && (
                    <Pin className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                  )}
                  {link.is_featured && (
                    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
              </div>
              {link.description && (
                <p className="text-xs md:text-sm text-muted-foreground truncate mb-2">
                  {link.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Clicks: {link.click_count}</span>
                {link.category && (
                  <Badge variant="secondary" className="text-xs">
                    {link.category.name}
                  </Badge>
                )}
                {link.subcategory && (
                  <Badge variant="outline" className="text-xs">
                    {link.subcategory}
                  </Badge>
                )}
                {expirationInfo && (
                  <Badge
                    variant={expirationInfo.isExpired ? "destructive" : "default"}
                    className="text-xs flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    {expirationInfo.isExpired ? "Expired" : expirationInfo.formatted}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleFeatured}
              title={link.is_featured ? "Remove from featured" : "Add to featured"}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <Star className={`w-3 h-3 md:w-4 md:h-4 ${link.is_featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleTogglePin}
              title={link.is_pinned ? "Unpin" : "Pin"}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <Pin className={`w-3 h-3 md:w-4 md:h-4 ${link.is_pinned ? "fill-primary" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleActive}
              title={link.is_active ? "Hide" : "Show"}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              {link.is_active ? (
                <Eye className="w-3 h-3 md:w-4 md:h-4" />
              ) : (
                <EyeOff className="w-3 h-3 md:w-4 md:h-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(link);
              }}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <Edit className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(link.id);
              }}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteLink.mutate(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

