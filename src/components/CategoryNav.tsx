import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Category } from "@/hooks/useCategories";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryNavProps {
  categories: Category[];
}

const CategoryNav = ({ categories }: CategoryNavProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-4">
          {categories.map((category, index) => (
            <Button
              key={category.id}
              onClick={() => navigate(`/category/${category.slug}`)}
              variant="outline"
              className="flex-shrink-0 h-auto py-3 px-4 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                borderColor: category.color || "hsl(var(--border))",
                borderWidth: "2px",
                animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = category.color ? `${category.color}15` : "hsl(var(--primary) / 0.1)";
                e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "";
                e.currentTarget.style.transform = "";
              }}
            >
              <span 
                className="text-2xl transition-transform duration-300"
                style={{ color: category.color || "inherit" }}
              >
                {category.icon_name || "📁"}
              </span>
              <span className="text-xs font-medium whitespace-normal text-center leading-tight">
                {category.name}
              </span>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryNav;
