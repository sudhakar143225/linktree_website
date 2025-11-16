import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, Edit, X } from "lucide-react";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag, Tag } from "@/hooks/useTags";
import { Textarea } from "@/components/ui/textarea";

const TagsManagement = () => {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  });

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        description: tag.description || "",
        color: tag.color || "#3b82f6",
      });
    } else {
      setEditingTag(undefined);
      setFormData({
        name: "",
        description: "",
        color: "#3b82f6",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTag) {
      await updateTag.mutateAsync({
        id: editingTag.id,
        name: formData.name,
        description: formData.description || null,
        color: formData.color,
      });
    } else {
      await createTag.mutateAsync({
        name: formData.name,
        description: formData.description || null,
        color: formData.color,
      });
    }
    
    setDialogOpen(false);
    setEditingTag(undefined);
    setFormData({ name: "", description: "", color: "#3b82f6" });
  };

  const handleDelete = async (tag: Tag) => {
    if (window.confirm(`Are you sure you want to delete the tag "${tag.name}"? This will remove it from all links.`)) {
      await deleteTag.mutateAsync(tag.id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tags...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tags Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage tags for organizing links
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tag
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags?.map((tag) => (
          <Card key={tag.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color || "#3b82f6" }}
                  />
                  <CardTitle className="text-base">{tag.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleOpenDialog(tag)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(tag)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tag.description && (
                <p className="text-sm text-muted-foreground mb-2">{tag.description}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Used {tag.usage_count || 0} times
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tags && tags.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tags yet. Create your first tag to organize links!</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Create Tag"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tag-name">Name *</Label>
              <Input
                id="tag-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter tag name"
              />
            </div>
            <div>
              <Label htmlFor="tag-description">Description</Label>
              <Textarea
                id="tag-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="tag-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="tag-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingTag ? "Update Tag" : "Create Tag"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagsManagement;

