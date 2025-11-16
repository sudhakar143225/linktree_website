import { useState } from "react";
import { Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

// Common Lucide icons for categories
const commonIcons = [
  "Sparkles", "Folder", "Link", "Bookmark", "Star", "Heart", "ThumbsUp",
  "TrendingUp", "Rocket", "Code", "Palette", "Music", "Video", "Camera",
  "Image", "FileText", "Layers", "Grid", "Box", "Package", "Tag",
  "Zap", "Globe", "Map", "Mail", "Phone", "MessageCircle", "Share2",
  "ArrowRight", "ChevronRight", "Plus", "Minus", "Settings", "Tool",
  "Home", "User", "Users", "Briefcase", "GraduationCap", "BookOpen",
];

interface IconPickerProps {
  value?: string;
  onValueChange: (iconName: string) => void;
  label?: string;
}

const IconPicker = ({ value, onValueChange, label = "Select Icon" }: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Get icon component dynamically
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const filteredIcons = commonIcons.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = value ? getIconComponent(value) : <Search className="w-4 h-4" />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          role="combobox"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2 flex-1">
            {SelectedIcon}
            <span className="text-sm">{value || label}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search icons..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup>
              {filteredIcons.map((iconName) => {
                const IconComponent = getIconComponent(iconName);
                const isSelected = value === iconName;
                
                return (
                  <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={() => {
                      onValueChange(iconName);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {IconComponent}
                      <span>{iconName}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;

