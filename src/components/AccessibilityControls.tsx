import { useState, useEffect } from "react";
import { Settings, Type, Contrast, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  keyboardNav: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 16,
  highContrast: false,
  keyboardNav: true,
};

const AccessibilityControls = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [open, setOpen] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("accessibility_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        applySettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error("Failed to load accessibility settings:", error);
      }
    } else {
      applySettings(DEFAULT_SETTINGS);
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    // Apply font size
    document.documentElement.style.fontSize = `${newSettings.fontSize}px`;

    // Apply high contrast
    if (newSettings.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Apply keyboard navigation (always enabled, but add visual indicators)
    if (newSettings.keyboardNav) {
      document.documentElement.classList.add("keyboard-nav");
    } else {
      document.documentElement.classList.remove("keyboard-nav");
    }
  };

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem("accessibility_settings", JSON.stringify(newSettings));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
          aria-label="Accessibility settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Accessibility Settings</SheetTitle>
          <SheetDescription>
            Customize your viewing experience
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          {/* Font Size Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="font-size">Font Size</Label>
            </div>
            <div className="space-y-2">
              <Slider
                id="font-size"
                min={12}
                max={24}
                step={1}
                value={[settings.fontSize]}
                onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Small (12px)</span>
                <span>Current: {settings.fontSize}px</span>
                <span>Large (24px)</span>
              </div>
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
            />
          </div>

          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
            </div>
            <Switch
              id="keyboard-nav"
              checked={settings.keyboardNav}
              onCheckedChange={(checked) => updateSettings({ keyboardNav: checked })}
            />
          </div>

          {/* Keyboard Shortcuts Info */}
          {settings.keyboardNav && (
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Keyboard Shortcuts</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li><kbd className="px-1.5 py-0.5 bg-background rounded border">/</kbd> Focus search</li>
                <li><kbd className="px-1.5 py-0.5 bg-background rounded border">Esc</kbd> Close modals</li>
                <li><kbd className="px-1.5 py-0.5 bg-background rounded border">Tab</kbd> Navigate elements</li>
                <li><kbd className="px-1.5 py-0.5 bg-background rounded border">Enter</kbd> Activate buttons/links</li>
              </ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AccessibilityControls;

