import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/hooks/useCategories";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import IconPicker from "@/components/IconPicker";
import ImageUpload from "@/components/admin/ImageUpload";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: Partial<Category>) => void;
  onCancel: () => void;
}

const CategoryForm = ({ category, onSubmit, onCancel }: CategoryFormProps) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    icon_name: "",
    color: "hsl(280, 100%, 70%)",
    order_position: 0,
    subcategories: null,
  });
  const [subcategoryInput, setSubcategoryInput] = useState("");

  useEffect(() => {
    if (category) {
      setFormData(category);
    }
  }, [category]);

  const subcategories = formData.subcategories
    ? formData.subcategories.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const addSubcategory = () => {
    if (subcategoryInput.trim() && !subcategories.includes(subcategoryInput.trim())) {
      const newSubcats = [...subcategories, subcategoryInput.trim()];
      setFormData({
        ...formData,
        subcategories: newSubcats.join(','),
      });
      setSubcategoryInput("");
    }
  };

  const removeSubcategory = (subcat: string) => {
    const newSubcats = subcategories.filter(s => s !== subcat);
    setFormData({
      ...formData,
      subcategories: newSubcats.length > 0 ? newSubcats.join(',') : null,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-generate slug from name if not provided
    if (!formData.slug && formData.name) {
      formData.slug = formData.name.toLowerCase().replace(/\s+/g, "-");
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter category name"
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          placeholder="category-slug"
          disabled={category !== undefined && (category.slug === "this-week" || category.slug === "this-month")}
        />
        {category !== undefined && (category.slug === "this-week" || category.slug === "this-month") && (
          <p className="text-xs text-muted-foreground mt-1">
            Slug cannot be changed for time-based categories to preserve functionality.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="icon">Icon (Lucide Icon Name or Emoji)</Label>
        <div className="flex gap-2">
          <IconPicker
            value={formData.icon_lucide_name || formData.icon_name || ""}
            onValueChange={(value) => {
              // If it's a Lucide icon name, store in icon_lucide_name
              // If it's an emoji, store in icon_name
              const isEmoji = /[\p{Emoji}]/u.test(value);
              if (isEmoji) {
                setFormData({ ...formData, icon_name: value, icon_lucide_name: null });
              } else {
                setFormData({ ...formData, icon_lucide_name: value, icon_name: value });
              }
            }}
            label="Select Icon"
          />
          <Input
            id="icon"
            value={formData.icon_name || ""}
            onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
            placeholder="Or enter emoji: 📁"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Choose a Lucide icon or enter an emoji
        </p>
      </div>

      <div>
        <Label htmlFor="color">Color (HSL)</Label>
        <Input
          id="color"
          value={formData.color || ""}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          placeholder="hsl(280, 100%, 70%)"
        />
      </div>

      <div>
        <Label htmlFor="order">Order Position</Label>
        <Input
          id="order"
          type="number"
          value={formData.order_position}
          onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <ImageUpload
          value={formData.background_image || null}
          onChange={(url) => setFormData({ ...formData, background_image: url || null })}
          folder="categories"
          label="Background Image (Optional)"
        />
      </div>

      <div>
        <Label htmlFor="subcategories">Subcategories (Optional)</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Add subcategories to organize links within this category. Separate multiple subcategories with commas or add them one by one.
        </p>
        <div className="flex gap-2 mb-2">
          <Input
            id="subcategories"
            value={subcategoryInput}
            onChange={(e) => setSubcategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSubcategory();
              }
            }}
            placeholder="Enter subcategory name"
          />
          <Button type="button" onClick={addSubcategory} variant="outline">
            Add
          </Button>
        </div>
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {subcategories.map((subcat) => (
              <Badge key={subcat} variant="secondary" className="flex items-center gap-1">
                {subcat}
                <button
                  type="button"
                  onClick={() => removeSubcategory(subcat)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {category ? "Update Category" : "Create Category"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
