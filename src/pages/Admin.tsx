import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Home, ArrowLeft, Layers, ExternalLink } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { useAllLinks, useCreateLink, useUpdateLink, useDeleteLink, Link, useUpdateLinkOrder } from "@/hooks/useLinks";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category, useUpdateCategoryOrder } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { Tag } from "@/hooks/useTags";
import LinkForm from "@/components/admin/LinkForm";
import CategoryForm from "@/components/admin/CategoryForm";
import LinksList from "@/components/admin/LinksList";
import Analytics from "@/components/admin/Analytics";
import EnhancedAnalytics from "@/components/admin/EnhancedAnalytics";
import { DraggableCategoryItem } from "@/components/admin/DraggableCategoryItem";
import { DraggableLinkItem } from "@/components/admin/DraggableLinkItem";
import SubcategoryNav from "@/components/SubcategoryNav";
import TagsManagement from "@/components/admin/TagsManagement";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | undefined>();
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  const [categoryToClear, setCategoryToClear] = useState<string | null>(null);

  const { data: links } = useAllLinks();
  const { data: categories } = useCategories();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategoryOrder = useUpdateCategoryOrder();
  const updateLinkOrder = useUpdateLinkOrder();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        navigate("/admin/login");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleLinkSubmit = async (data: Partial<Link>, selectedTags?: Tag[]) => {
    // Remove 'category' field if present (it's a joined relation, not a database column)
    const { category, ...linkData } = data;
    
    if (editingLink) {
      // Update existing link
      updateLink.mutate({ id: editingLink.id, ...linkData }, {
        onSuccess: async () => {
          // Update tags for existing link (always update, even if empty)
          // Filter out any temp tags (shouldn't happen, but just in case)
          const validTags = (selectedTags || []).filter(t => !t.id.startsWith('temp_'));
          await updateLinkTags(editingLink.id, validTags);
          setLinkDialogOpen(false);
          setEditingLink(undefined);
          toast.success("Link updated successfully with tags!");
        },
        onError: (error: Error) => {
          toast.error("Failed to update link: " + error.message);
        },
      });
    } else {
      // Create new link
      createLink.mutate(linkData, {
        onSuccess: async (newLink: Link) => {
          // Add tags to newly created link (only if tags exist and not temp tags)
          if (selectedTags && selectedTags.length > 0) {
            // Filter out any remaining temp tags (shouldn't happen, but just in case)
            const validTags = selectedTags.filter(t => !t.id.startsWith('temp_'));
            if (validTags.length > 0) {
              await updateLinkTags(newLink.id, validTags);
            }
          }
          setLinkDialogOpen(false);
          toast.success("Link created successfully with tags!");
        },
        onError: (error: Error) => {
          toast.error("Failed to create link: " + error.message);
        },
      });
    }
  };

  // Helper function to update link tags
  const updateLinkTags = async (linkId: string, newTags: Tag[]) => {
    try {
      // Get current tags for this link
      const { data: linkTags, error: fetchError } = await supabase
        .from("link_tags" as never)
        .select("tag_id")
        .eq("link_id", linkId);
      
      if (fetchError) {
        console.error("Error fetching link tags:", fetchError);
        toast.error("Failed to fetch link tags: " + fetchError.message);
        return;
      }
      
      const currentTagIds = (linkTags || []).map((lt: { tag_id: string }) => lt.tag_id) as string[];
      const newTagIds = newTags.map((t) => t.id).filter((id: string) => !id.startsWith('temp_'));
      
      // Remove tags that are no longer selected
      for (const tagId of currentTagIds) {
        if (!newTagIds.includes(tagId)) {
          const { error: deleteError } = await supabase
            .from("link_tags" as never)
            .delete()
            .eq("link_id", linkId)
            .eq("tag_id", tagId);
          
          if (deleteError) {
            console.error("Error removing tag:", deleteError);
          }
        }
      }
      
      // Add new tags
      for (const tagId of newTagIds) {
        if (!currentTagIds.includes(tagId)) {
          const { error: insertError } = await supabase
            .from("link_tags" as never)
            .insert([{ link_id: linkId, tag_id: tagId }] as never);
          
          if (insertError) {
            console.error("Error adding tag:", insertError);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error updating link tags:", error);
      toast.error("Failed to update tags: " + errorMessage);
    }
  };

  const handleCategorySubmit = (data: Partial<Category>) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...data }, {
        onSuccess: () => {
          setCategoryDialogOpen(false);
          setEditingCategory(undefined);
        },
      });
    } else {
      createCategory.mutate(data, {
        onSuccess: () => {
          setCategoryDialogOpen(false);
        },
      });
    }
  };

  const openLinkDialog = (link?: Link) => {
    setEditingLink(link);
    setLinkDialogOpen(true);
  };

  const openCategoryDialog = (category?: Category) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const openLinkDialogForCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setEditingLink(undefined);
    setLinkDialogOpen(true);
  };

  // Filter links by selected category and subcategory
  const categoryLinks = useMemo(() => {
    if (!selectedCategoryId || !links) return [];
    let filtered = links.filter((link) => link.category_id === selectedCategoryId);
    
    // Filter by subcategory if selected
    if (selectedSubcategory) {
      filtered = filtered.filter((link) => link.subcategory === selectedSubcategory);
    }
    
    return filtered;
  }, [selectedCategoryId, selectedSubcategory, links]);

  // Get links count per category
  const getLinksCount = (categoryId: string) => {
    return links?.filter((link) => link.category_id === categoryId).length || 0;
  };

  // Get available subcategories for selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);
    if (!selectedCategory?.subcategories) return [];
    return selectedCategory.subcategories.split(',').map(s => s.trim()).filter(Boolean);
  }, [selectedCategoryId, categories]);

  // Show subcategory navigation for time-based categories or any category with subcategories
  const showSubcategoryNav = availableSubcategories.length > 0;

  // Reset selected subcategory when category changes
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategory(null);
  };

  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);

  // Check if selected category is a time-based category
  const isTimeBasedCategory = selectedCategory?.slug === "this-week" || selectedCategory?.slug === "this-month";

  // Handle clear all data for time-based categories
  const handleClearCategoryData = async () => {
    if (!categoryToClear || !selectedCategory) return;

    try {
      // Delete all links in this category
      const categoryLinks = links?.filter((link) => link.category_id === categoryToClear) || [];
      for (const link of categoryLinks) {
        await deleteLink.mutateAsync(link.id);
      }
      toast.success(`All links in "${selectedCategory.name}" have been cleared.`);
      setClearDataDialogOpen(false);
      setCategoryToClear(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to clear category data: " + errorMessage);
    }
  };

  // Handle category drag end
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !categories) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);

    if (oldIndex !== newIndex) {
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      const updates = newCategories.map((cat, index) => ({
        id: cat.id,
        order_position: index,
      }));
      updateCategoryOrder.mutate(updates);
    }
  };

  // Handle link drag end
  const handleLinkDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !categoryLinks.length) return;

    const oldIndex = categoryLinks.findIndex((l) => l.id === active.id);
    const newIndex = categoryLinks.findIndex((l) => l.id === over.id);

    if (oldIndex !== newIndex) {
      const newLinks = arrayMove(categoryLinks, oldIndex, newIndex);
      const updates = newLinks.map((link, index) => ({
        id: link.id,
        order_position: index,
      }));
      updateLinkOrder.mutate(updates);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {selectedCategoryId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSelectedSubcategory(null);
                  }}
                  className="-ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <h1 className="text-xl md:text-2xl font-bold">
                {selectedCategory ? `${selectedCategory.name} - Links` : "Admin Panel"}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-0 md:mr-2" />
                <span className="hidden md:inline">View Site</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-0 md:mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-4 md:py-8">
        {!selectedCategoryId ? (
          // Category Selection View
          <Tabs defaultValue="categories" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="categories" className="text-xs md:text-sm">Categories</TabsTrigger>
              <TabsTrigger value="links" className="text-xs md:text-sm">All Links</TabsTrigger>
              <TabsTrigger value="tags" className="text-xs md:text-sm">Tags</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manage Categories</CardTitle>
                      <CardDescription>Select a category to manage its links, or create a new category</CardDescription>
                    </div>
                    <Button onClick={() => openCategoryDialog()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleCategoryDragEnd}
                  >
                    <SortableContext
                      items={categories?.map((c) => c.id) || []}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories?.map((category) => {
                          const linksCount = getLinksCount(category.id);
                          return (
                            <DraggableCategoryItem
                              key={category.id}
                              category={category}
                              linksCount={linksCount}
                              onEdit={openCategoryDialog}
                              onClick={() => handleCategorySelect(category.id)}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {categories && categories.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No categories yet. Create your first category to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Links</CardTitle>
                      <CardDescription>View and manage all links across all categories</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setSelectedCategoryId(null);
                      openLinkDialog();
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {links && <LinksList links={links} onEdit={openLinkDialog} />}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tags">
              <Card>
                <CardHeader>
                  <CardTitle>Tags Management</CardTitle>
                  <CardDescription>Create and manage tags for organizing links</CardDescription>
                </CardHeader>
                <CardContent>
                  <TagsManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>Comprehensive analytics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  {links && categories && (
                    <EnhancedAnalytics links={links} categories={categories} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Category Links Management View
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: selectedCategory?.color || "hsl(var(--primary))" }}
                      >
                        {selectedCategory?.icon_name || "📁"}
                      </div>
                      {selectedCategory?.name} Links
                    </CardTitle>
                    <CardDescription>
                      Manage links for this category. {selectedCategory?.subcategories && "Links are organized by subcategories."}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {isTimeBasedCategory && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setCategoryToClear(selectedCategoryId);
                          setClearDataDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </Button>
                    )}
                    <Button onClick={() => openLinkDialogForCategory(selectedCategoryId)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Subcategory Navigation - Show for time-based categories or any category with subcategories */}
                {showSubcategoryNav && (
                  <div className="mb-6">
                    <SubcategoryNav
                      subcategories={availableSubcategories}
                      selectedSubcategory={selectedSubcategory}
                      onSelectSubcategory={setSelectedSubcategory}
                      categoryColor={selectedCategory?.color}
                    />
                  </div>
                )}

                {/* Links List */}
                <div>
                  {categoryLinks.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleLinkDragEnd}
                    >
                      <SortableContext
                        items={categoryLinks.map((l) => l.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="space-y-3">
                          {categoryLinks.map((link) => (
                            <DraggableLinkItem
                              key={link.id}
                              link={link}
                              onEdit={openLinkDialog}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>
                        {selectedSubcategory
                          ? `No links in "${selectedSubcategory}" subcategory yet. Add your first link!`
                          : "No links in this category yet. Add your first link!"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={linkDialogOpen} onOpenChange={(open) => {
        setLinkDialogOpen(open);
        if (!open) {
          setEditingLink(undefined);
          if (!editingLink) {
            // Don't reset selectedCategoryId - keep the category selected
          }
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Edit Link" : "Create Link"}</DialogTitle>
          </DialogHeader>
          <LinkForm
            link={editingLink}
            defaultCategoryId={selectedCategoryId || undefined}
            onSubmit={handleLinkSubmit}
            onCancel={() => {
              setLinkDialogOpen(false);
              setEditingLink(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSubmit={handleCategorySubmit}
            onCancel={() => {
              setCategoryDialogOpen(false);
              setEditingCategory(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={clearDataDialogOpen} onOpenChange={setClearDataDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all links in "{selectedCategory?.name}"? This action cannot be undone.
              <br />
              <br />
              <strong className="text-destructive">
                {links?.filter((link) => link.category_id === categoryToClear).length || 0} link(s) will be permanently deleted.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToClear(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCategoryData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All Links
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
