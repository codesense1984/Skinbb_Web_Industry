import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

// Validation schema for approval form
const approvalSchema = z
  .object({
    status: z.string({
      required_error: "Please select a status",
    }),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      // If status is rejected, reason is required and must be at least 10 characters
      if (data.status === "rejected") {
        return data.reason && data.reason.length >= 10;
      }
      // If status is approved, reason is optional but recommended
      return true;
    },
    {
      message:
        "Reason is required and must be at least 10 characters when rejecting",
      path: ["reason"],
    },
  );

type ApprovalFormData = z.infer<typeof approvalSchema>;

interface ProductApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: ApprovalFormData) => Promise<void>;
  productName?: string;
  isLoading?: boolean;
}

export const ProductApprovalDialog: React.FC<ProductApprovalDialogProps> = ({
  isOpen,
  onClose,
  onApprove,
  productName,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
    trigger,
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      status: undefined,
      reason: "",
    },
  });

  const status = useWatch({
    control: control,
    name: "status",
    defaultValue: undefined,
  });

  const onSubmit = async (data: ApprovalFormData) => {
    try {
      await onApprove(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Approval error:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStatusChange = async (status: "approved" | "rejected") => {
    setValue("status", status);
    // Trigger validation to update the reason field validation
    await trigger("reason");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product Approval</DialogTitle>
          <DialogDescription>
            {productName && `Review and approve/reject ${productName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={status === "approved" ? "contained" : "outlined"}
                color={"secondary"}
                onClick={() => handleStatusChange("approved")}
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                type="button"
                variant={status === "rejected" ? "contained" : "outlined"}
                color={"secondary"}
                onClick={() => handleStatusChange("rejected")}
                className="flex-1"
              >
                Reject
              </Button>
            </div>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason/Feedback{" "}
              {status === "rejected" && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="reason"
              placeholder={
                status === "approved"
                  ? "Enter feedback for approval (optional)..."
                  : "Enter reason for rejection (required)..."
              }
              {...register("reason")}
              className="min-h-[100px]"
            />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color={"secondary"}
              disabled={!status || isLoading}
            >
              {isLoading
                ? "Processing..."
                : `${status === "approved" ? "Approve" : "Reject"} Product`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
