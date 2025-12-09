import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/core/components/ui/textarea";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { cn } from "@/core/utils";
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface NotesPadProps {
  notes: string;
  onSave: (notes: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
  disabled?: boolean;
  buttonLabel?: string;
  buttonVariant?: "default" | "outlined" | "contained" | "ghost";
  buttonSize?: "sm" | "md" | "lg";
}

export const NotesPad = ({
  notes: initialNotes,
  onSave,
  placeholder = "Add your notes here...",
  className,
  autoSave = false,
  autoSaveDelay = 2000,
  disabled = false,
  buttonLabel = "Notes",
  buttonVariant = "outlined",
  buttonSize = "md",
}: NotesPadProps) => {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasChangesRef = useRef(false);

  const handleSave = useCallback(async () => {
    if (disabled || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(notes);
      setHasChanges(false);
      hasChangesRef.current = false;
      // Don't close editing mode automatically - let user continue editing
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  }, [disabled, isSaving, notes, onSave]);

  // Sync with external notes changes
  useEffect(() => {
    if (initialNotes !== notes && !isEditing && !isOpen) {
      setNotes(initialNotes || "");
    }
  }, [initialNotes, isEditing, isOpen]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges && isEditing && isOpen) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        handleSave();
      }, autoSaveDelay);

      return () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
      };
    }
  }, [notes, autoSave, hasChanges, isEditing, isOpen, autoSaveDelay, handleSave]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    const changed = value !== initialNotes;
    setHasChanges(changed);
    hasChangesRef.current = changed;
    setIsEditing(true);
  };

  const handleCancel = () => {
    setNotes(initialNotes || "");
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleFocus = () => {
    setIsEditing(true);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleBlur = () => {
    // Don't auto-close if there are unsaved changes
    if (!hasChanges) {
      setIsEditing(false);
    }
  };

  // Auto-resize on content change
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [notes, isEditing]);

  const isEmpty = !notes || notes.trim().length === 0;
  const notesCount = notes ? notes.length : 0;

  // Reset editing state when dialog closes and sync notes when opening
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setHasChanges(false);
    } else {
      // Sync notes when dialog opens
      setNotes(initialNotes || "");
      setHasChanges(false);
      setIsEditing(true); // Auto-enter edit mode when opening
      // Focus textarea when dialog opens
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, initialNotes]);

  return (
    <>
      {/* Notes Button */}
      <Button
        variant={buttonVariant === "outlined" ? "outline" : buttonVariant}
        size={buttonSize}
        onClick={() => {
          console.log("Notes button clicked, opening dialog");
          setIsOpen(true);
        }}
        disabled={disabled}
        className={cn(
          "relative flex items-center gap-2",
          "hover:bg-primary/10 transition-colors",
          "border border-border",
          className
        )}
        type="button"
      >
        <DocumentTextIcon className="h-4 w-4" />
        <span>{buttonLabel}</span>
        {notesCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full min-w-[20px] text-center">
            {notesCount}
          </span>
        )}
      </Button>

      {/* Notes Dialog */}
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open && hasChangesRef.current) {
            // Warn user about unsaved changes
            if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
              setIsOpen(false);
            }
          } else {
            setIsOpen(open);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              Notes
            </DialogTitle>
            <DialogDescription>
              Add your notes about this analysis. Changes are saved automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <Card
              className={cn(
                "relative overflow-hidden transition-all duration-200 flex-1 flex flex-col",
                "border-2",
                isEditing
                  ? "border-primary shadow-lg"
                  : isEmpty
                    ? "border-muted-foreground/30"
                    : "border-muted-foreground/50"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b bg-muted/30 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <span className="text-xs text-muted-foreground">(unsaved)</span>
                  )}
                  {isSaving && (
                    <span className="text-xs text-muted-foreground">(saving...)</span>
                  )}
                  {!hasChanges && !isSaving && notesCount > 0 && (
                    <span className="text-xs text-green-600">Saved</span>
                  )}
                </div>
                {isEditing && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      disabled={disabled || isSaving || !hasChanges}
                      className="h-7 px-2"
                    >
                      <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={disabled || isSaving}
                      className="h-7 px-2"
                    >
                      <XMarkIcon className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  </div>
                )}
                {!isEditing && !disabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(true);
                      setTimeout(() => textareaRef.current?.focus(), 0);
                    }}
                    className="h-7 px-2"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Notes Content */}
              <div className="relative flex-1 overflow-auto">
                {isEditing ? (
                  <Textarea
                    ref={textareaRef}
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled || isSaving}
                    className={cn(
                      "min-h-[300px] resize-none border-0 focus-visible:ring-0",
                      "bg-transparent p-4 text-sm",
                      "font-mono leading-relaxed h-full"
                    )}
                    style={{
                      backgroundImage: isEmpty
                        ? "linear-gradient(to right, transparent 0%, transparent 100%)"
                        : "linear-gradient(to right, #f0f0f0 0%, transparent 0%)",
                      backgroundSize: "100% 1.5em",
                      backgroundPosition: "0 0",
                    }}
                  />
                ) : (
                  <div
                    className={cn(
                      "min-h-[300px] p-4 text-sm h-full overflow-auto",
                      "font-mono leading-relaxed whitespace-pre-wrap",
                      isEmpty
                        ? "text-muted-foreground italic"
                        : "text-foreground",
                      "cursor-text"
                    )}
                    onClick={() => {
                      if (!disabled) {
                        setIsEditing(true);
                        setTimeout(() => textareaRef.current?.focus(), 0);
                      }
                    }}
                    style={{
                      backgroundImage: isEmpty
                        ? "linear-gradient(to right, transparent 0%, transparent 100%)"
                        : "linear-gradient(to right, #f0f0f0 0%, transparent 0%)",
                      backgroundSize: "100% 1.5em",
                      backgroundPosition: "0 0",
                    }}
                  >
                    {isEmpty ? placeholder : notes}
                  </div>
                )}

                {/* Notepad lines effect (only when not empty) */}
                {!isEmpty && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                      backgroundImage: "repeating-linear-gradient(transparent, transparent 1.4em, #e0e0e0 1.4em, #e0e0e0 1.5em)",
                    }}
                  />
                )}
              </div>

              {/* Footer with character count */}
              {!isEmpty && (
                <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground flex justify-end flex-shrink-0">
                  {notesCount} {notesCount === 1 ? "character" : "characters"}
                </div>
              )}
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

