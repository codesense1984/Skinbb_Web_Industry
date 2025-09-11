import React, { useCallback, useRef } from "react";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useFileUpload } from "@/core/hooks/use-file-upload";
import { Upload, X, User } from "lucide-react";
import { cn } from "@/core/utils/classnames";

interface ImageUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  maxSize?: number; // in bytes
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "Upload profile picture",
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = "image/*",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      
      // Validate file size
      if (file.size > maxSize) {
        alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Create preview URL and call onChange
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange?.(result);
      };
      reader.readAsDataURL(file);
    },
    [maxSize, onChange]
  );

  const handleRemove = useCallback(() => {
    onChange?.("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar Preview */}
        <div className="relative">
          <Avatar className="size-32 border-2 border-gray-200">
            <AvatarImage
              src={value}
              alt="Profile preview"
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-100">
              <User className="size-8 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          
          {/* Remove button */}
          {value && !disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 size-6 rounded-full p-0"
              onClick={handleRemove}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>

        {/* Upload Button */}
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Upload className="size-4" />
            {value ? "Change Picture" : "Upload Picture"}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            {placeholder}
          </p>
          <p className="text-xs text-gray-400">
            Max size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
