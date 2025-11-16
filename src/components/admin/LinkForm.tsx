import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/hooks/useCategories";
import { Link } from "@/hooks/useLinks";
import { Tag, useTags, useLinkTags, useAddTagToLink, useRemoveTagFromLink, useCreateTag } from "@/hooks/useTags";
import { useFetchLinkPreview } from "@/hooks/useLinkPreview";
import { useCheckLinkHealth } from "@/hooks/useLinkHealth";
import TagInput from "@/components/TagInput";
import ScheduledPublishForm from "@/components/ScheduledPublishForm";
import ImageUpload from "@/components/admin/ImageUpload";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LinkFormProps {
  link?: Link;
  defaultCategoryId?: string;
  onSubmit: (data: Partial<Link>, selectedTags?: Tag[]) => void;
  onCancel: () => void;
}

const LinkForm = ({ link, defaultCategoryId, onSubmit, onCancel }: LinkFormProps) => {
  const { data: categories } = useCategories();
  const { data: allTags } = useTags();
  const { data: linkTags } = useLinkTags(link?.id || null);
  const fetchPreview = useFetchLinkPreview();
  const checkHealth = useCheckLinkHealth();
  const addTagToLink = useAddTagToLink();
  const removeTagFromLink = useRemoveTagFromLink();
  const createTag = useCreateTag();

  const [formData, setFormData] = useState<Partial<Link>>({
    title: "",
    description: "",
    url: "",
    icon_name: "",
    category_id: defaultCategoryId || "",
    subcategory: "",
    is_pinned: false,
    is_active: true,
    is_featured: false,
    order_position: 0,
    scheduled_publish_at: null,
    scheduled_unpublish_at: null,
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (link) {
      setFormData(link);
    } else if (defaultCategoryId) {
      setFormData(prev => ({ ...prev, category_id: defaultCategoryId }));
    }
  }, [link, defaultCategoryId]);

  useEffect(() => {
    if (linkTags && allTags) {
      const tags = linkTags.map((lt) => allTags.find((t) => t.id === lt.tag_id)).filter(Boolean) as Tag[];
      setSelectedTags(tags);
    }
  }, [linkTags, allTags]);

  // Handle tag creation when user adds a temp tag
  const handleTagChange = async (tags: Tag[]): Promise<Tag[]> => {
    // Check if any tags need to be created (tags with temp IDs)
    const tagsToCreate = tags.filter(t => t.id.startsWith('temp_'));
    const existingTags = tags.filter(t => !t.id.startsWith('temp_'));
    
    // If no temp tags, just update state and return
    if (tagsToCreate.length === 0) {
      setSelectedTags(tags);
      return tags;
    }
    
    // Create new tags that don't exist yet
    const createdTags: Tag[] = [];
    for (const tempTag of tagsToCreate) {
      try {
        // Check if tag already exists by name
        const existingTag = allTags?.find(t => t.name.toLowerCase() === tempTag.name.toLowerCase());
        if (existingTag) {
          // Tag already exists, use it instead
          createdTags.push(existingTag);
        } else {
          // Create new tag
          const newTag = await createTag.mutateAsync({
            name: tempTag.name,
            slug: tempTag.slug,
            color: tempTag.color || '#3b82f6',
            description: tempTag.description || null,
          });
          createdTags.push(newTag);
        }
      } catch (error) {
        console.error('Failed to create tag:', error);
        toast.error(`Failed to create tag "${tempTag.name}"`);
        // Continue with other tags even if one fails
      }
    }
    
    // Combine existing and newly created tags
    const finalTags = [...existingTags, ...createdTags];
    setSelectedTags(finalTags);
    return finalTags;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all temp tags are created before submission
    const tagsToCreate = selectedTags.filter(t => t.id.startsWith('temp_'));
    let finalTags = selectedTags;
    
    if (tagsToCreate.length > 0) {
      // Create tags and get updated tag list
      const createdTags = await handleTagChange(selectedTags);
      if (createdTags) {
        finalTags = createdTags;
      }
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Prepare form data - exclude 'category' (it's a joined relation, not a database column)
    const { category, ...linkData } = formData;
    
    // Submit link with final tags (all temp tags should be created by now)
    onSubmit(linkData, finalTags);
  };

  const handleFetchPreview = async () => {
    if (!formData.url || !link?.id) {
      toast.error("Please enter a URL first");
      return;
    }
    
    try {
      await fetchPreview.mutateAsync({ linkId: link.id, url: formData.url });
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleCheckHealth = async () => {
    if (!formData.url || !link?.id) {
      toast.error("Please enter a URL first");
      return;
    }
    
    try {
      await checkHealth.mutateAsync({ linkId: link.id, url: formData.url });
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const selectedCategory = categories?.find((c) => c.id === formData.category_id);
  
  // Get subcategories from selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory?.subcategories) return [];
    return selectedCategory.subcategories.split(',').map(s => s.trim()).filter(Boolean);
  }, [selectedCategory]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Enter link title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description / Text Content</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter link description or text content"
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Add description text or content that will be displayed with this link
        </p>
      </div>

      <div>
        <Label htmlFor="url">URL *</Label>
        <div className="flex gap-2">
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            placeholder="https://example.com"
            className="flex-1"
          />
          {link?.id && formData.url && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleFetchPreview}
                disabled={fetchPreview.isPending}
                title="Fetch preview"
              >
                {fetchPreview.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCheckHealth}
                disabled={checkHealth.isPending}
                title="Check health"
              >
                {checkHealth.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "✓"
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        <ImageUpload
          value={formData.preview_image || null}
          onChange={(url) => setFormData({ ...formData, preview_image: url || null })}
          folder="links"
          label="Preview Image (Optional)"
        />
      </div>

      <div>
        <Label htmlFor="icon">Icon (emoji or icon name)</Label>
        <Input
          id="icon"
          value={formData.icon_name || ""}
          onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
          placeholder="🔗 or Sparkles"
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category_id || ""}
          onValueChange={(value) => setFormData({ ...formData, category_id: value, subcategory: "" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory && availableSubcategories.length > 0 && (
        <div>
          <Label htmlFor="subcategory">Subcategory</Label>
          <Select
            value={formData.subcategory || undefined}
            onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a subcategory (optional)" />
            </SelectTrigger>
            <SelectContent>
              {availableSubcategories.map((subcat) => (
                <SelectItem key={subcat} value={subcat}>
                  {subcat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.subcategory && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-8 text-xs"
              onClick={() => setFormData({ ...formData, subcategory: "" })}
            >
              Clear subcategory
            </Button>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Optional: Organize this link within a subcategory of "{selectedCategory.name}"
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="order">Order Position</Label>
        <Input
          id="order"
          type="number"
          value={formData.order_position}
          onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="pinned">Pin to Top</Label>
        <Switch
          id="pinned"
          checked={formData.is_pinned}
          onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="featured">Featured on Home</Label>
        <Switch
          id="featured"
          checked={formData.is_featured}
          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="active">Active</Label>
        <Switch
          id="active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      {/* Tags - Always show, even for new links */}
      <div>
        <Label>Tags (Optional)</Label>
        <TagInput
          selectedTags={selectedTags}
          onTagsChange={handleTagChange}
          placeholder="Type tag name, press Enter or comma to add..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Add tags to organize this link. Type to search existing tags, press Enter or type comma (,) to add. New tags will be created automatically.
        </p>
      </div>

      {/* Scheduled Publishing */}
      <div>
        <Label>Scheduled Publishing</Label>
        <ScheduledPublishForm
          scheduledPublishAt={formData.scheduled_publish_at || null}
          scheduledUnpublishAt={formData.scheduled_unpublish_at || null}
          onPublishChange={(date) => setFormData({ ...formData, scheduled_publish_at: date?.toISOString() || null })}
          onUnpublishChange={(date) => setFormData({ ...formData, scheduled_unpublish_at: date?.toISOString() || null })}
          onTimezoneChange={(tz) => {
            // Timezone stored in scheduled_links table
          }}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {link ? "Update Link" : "Create Link"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default LinkForm;
