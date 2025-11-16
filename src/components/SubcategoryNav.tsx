import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SubcategoryNavProps {
  subcategories: string[];
  selectedSubcategory: string | null;
  onSelectSubcategory: (subcategory: string | null) => void;
  categoryColor?: string | null;
}

const SubcategoryNav = ({ 
  subcategories, 
  selectedSubcategory, 
  onSelectSubcategory,
  categoryColor 
}: SubcategoryNavProps) => {
  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-4">
          <Button
            onClick={() => onSelectSubcategory(null)}
            variant={selectedSubcategory === null ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-shrink-0 transition-all duration-300 hover:scale-105",
              selectedSubcategory === null && categoryColor && {
                backgroundColor: categoryColor,
                borderColor: categoryColor,
                color: "white",
              }
            )}
            style={{
              borderColor: selectedSubcategory === null 
                ? categoryColor || "hsl(var(--primary))"
                : categoryColor || "hsl(var(--border))",
              borderWidth: "2px",
            }}
          >
            All
          </Button>
          {subcategories.map((subcategory, index) => {
            const isSelected = selectedSubcategory === subcategory;
            return (
              <Button
                key={subcategory}
                onClick={() => onSelectSubcategory(subcategory)}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-shrink-0 transition-all duration-300 hover:scale-105",
                  isSelected && categoryColor && {
                    backgroundColor: categoryColor,
                    borderColor: categoryColor,
                    color: "white",
                  }
                )}
                style={{
                  borderColor: isSelected
                    ? categoryColor || "hsl(var(--primary))"
                    : categoryColor || "hsl(var(--border))",
                  borderWidth: "2px",
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = categoryColor 
                      ? `${categoryColor}15` 
                      : "hsl(var(--primary) / 0.1)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.transform = "";
                  }
                }}
              >
                {subcategory}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SubcategoryNav;

