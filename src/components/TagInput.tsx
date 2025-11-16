import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus, Search } from "lucide-react";
import { useTags, Tag } from "@/hooks/useTags";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
}

const TagInput = ({ selectedTags, onTagsChange, placeholder = "Add tags..." }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: allTags } = useTags();

  const availableTags = allTags?.filter(
    (tag) => !selectedTags.some((selected) => selected.id === tag.id)
  ) || [];

  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
      setInputValue("");
      setOpen(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateTag = (tagName?: string) => {
    const tagToCreate = (tagName || inputValue).trim();
    if (tagToCreate) {
      // Check if tag already exists by name
      const existingTag = allTags?.find(
        (t) => t.name.toLowerCase() === tagToCreate.toLowerCase()
      );
      
      if (existingTag && !selectedTags.some((t) => t.id === existingTag.id)) {
        // Use existing tag
        handleAddTag(existingTag);
      } else if (!existingTag) {
        // Create new tag (will be handled by parent)
        const newTag: Tag = {
          id: `temp_${Date.now()}`,
          name: tagToCreate,
          slug: tagToCreate.toLowerCase().replace(/\s+/g, "-"),
          color: null,
          description: null,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        handleAddTag(newTag);
      }
    }
  };

  // Handle comma-separated tag input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Check if user typed a comma - add tag immediately
    if (value.includes(',')) {
      const parts = value.split(',');
      const tagToAdd = parts[0].trim();
      
      if (tagToAdd) {
        handleCreateTag(tagToAdd);
      }
      
      // Continue with remaining parts
      const remaining = parts.slice(1).join(',').trim();
      setInputValue(remaining);
    } else {
      setInputValue(value);
    }
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Selected Tags:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1.5 text-sm"
                style={{ backgroundColor: tag.color || undefined }}
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 hover:text-destructive transition-colors"
                  aria-label={`Remove ${tag.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add Tag Input with + Button */}
      <div className="flex gap-2">
        <Popover open={open && filteredTags.length > 0 && inputValue.trim()} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (inputValue.trim()) {
                      if (filteredTags.length > 0) {
                        handleAddTag(filteredTags[0]);
                      } else {
                        handleCreateTag();
                      }
                    }
                  }
                }}
                onFocus={() => {
                  if (inputValue.trim() && filteredTags.length > 0) {
                    setOpen(true);
                  }
                }}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                placeholder={placeholder || "Search or type new tag name..."}
                className="pl-9"
              />
            </div>
          </PopoverTrigger>
          {filteredTags.length > 0 && inputValue.trim() && (
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup heading="Matching Tags">
                    {filteredTags.slice(0, 8).map((tag) => (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => handleAddTag(tag)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {tag.color && (
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                          )}
                          <span>{tag.name}</span>
                          {tag.usage_count > 0 && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {tag.usage_count} uses
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
        <Button
          type="button"
          onClick={() => {
            if (inputValue.trim()) {
              handleCreateTag();
            } else {
              inputRef.current?.focus();
            }
          }}
          size="icon"
          variant="outline"
          className="flex-shrink-0"
          disabled={!inputValue.trim() && filteredTags.length === 0}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Available Tags - Show existing tags if any */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Available Tags ({availableTags.length}):
            </p>
            {inputValue.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setInputValue("")}
                className="h-6 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-muted/30">
            {availableTags
              .filter((tag) => 
                !inputValue.trim() || 
                tag.name.toLowerCase().includes(inputValue.toLowerCase())
              )
              .slice(0, 20)
              .map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag.color && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  {tag.name}
                  {tag.usage_count > 0 && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({tag.usage_count})
                    </span>
                  )}
                </Badge>
              ))}
            {availableTags.length > 20 && (
              <p className="text-xs text-muted-foreground italic">
                + {availableTags.length - 20} more tags...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Create New Tag Option */}
      {inputValue.trim() && filteredTags.length === 0 && (
        <div className="p-2 border rounded-md bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Create new tag:</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                "{inputValue.trim()}" (will be created when you add it)
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => handleCreateTag()}
              variant="outline"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagInput;

