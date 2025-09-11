"use client";

import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/ui/dialog";
import type { MODE } from "@/core/types";
import { Suspense, useState, type ComponentType, type ReactNode } from "react";

export type EntityFormComponentProps = {
  onClose?: () => void;
  defaultValues?: unknown;
  mode?: MODE;
  className: string;
};

type EntityDialogProps = {
  mode?: MODE;
  title: string;
  description?: string;
  triggerLabel: string;
  FormComponent: ComponentType<EntityFormComponentProps>;
  defaultValues?: unknown;
  triggerElement?: ReactNode;
  fallback?: ReactNode;
};

export const EntityDialog = ({
  mode,
  title,
  description,
  triggerLabel,
  FormComponent,
  defaultValues,
  triggerElement,
  fallback,
}: EntityDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement ?? (
          <Button variant="outlined" aria-label={triggerLabel}>
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="p-0 pb-4 md:pb-5">
        <DialogHeader className="px-4 pt-4 text-left md:px-5 md:pt-5">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <hr />

        <Suspense
          fallback={
            fallback ?? (
              <div className="flex animate-pulse space-x-4 px-4 md:px-5">
                <div className="flex-1 space-y-4 py-1">
                  <div className="bg-input h-11 rounded"></div>
                  <div className="bg-input h-11 rounded"></div>
                  <div className="bg-input h-11 rounded"></div>
                  <div className="flex justify-end gap-2">
                    <div className="bg-input h-11 w-25 rounded"></div>
                    <div className="bg-input h-11 w-25 rounded"></div>
                  </div>
                </div>
              </div>
            )
          }
        >
          <FormComponent
            onClose={() => setOpen(false)}
            defaultValues={defaultValues}
            mode={mode}
            className={"px-4 md:px-5"}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};
