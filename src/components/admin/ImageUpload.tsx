import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  maxSizeMB?: number;
  label?: string;
  accept?: string;
}

const ImageUpload = ({
  value,
  onChange,
  folder = "uploads",
  maxSizeMB = 5,
  label = "Image",
  accept = "image/*",
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(7)}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // If bucket doesn't exist, create it first (this will fail gracefully)
        toast.error("Failed to upload image. Please ensure storage bucket is configured.");
        setPreview(null);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);

      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload image: " + error.message);
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    toast.success("Image removed");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {preview ? (
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`image-upload-${label}`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(`image-upload-${label}`)?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Image
              </>
            )}
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Optional. Max size: {maxSizeMB}MB. Image will be displayed in a frame.
      </p>
    </div>
  );
};

export default ImageUpload;

