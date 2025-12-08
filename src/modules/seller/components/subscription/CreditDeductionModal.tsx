import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Zap } from "lucide-react";

interface CreditDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  creditCost: number;
  creditsRemaining: number;
  featureName: string;
  isLoading?: boolean;
}

export function CreditDeductionModal({
  isOpen,
  onClose,
  onConfirm,
  creditCost,
  creditsRemaining,
  featureName,
  isLoading = false,
}: CreditDeductionModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Credit Deduction Required
          </DialogTitle>
          <DialogDescription className="pt-2">
            This action will deduct credits from your account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Feature:</span>
                <span className="text-sm text-gray-900 capitalize">{featureName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Credit Cost:</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                  <Zap className="h-4 w-4" />
                  {creditCost} credits
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="text-sm font-medium text-gray-700">Current Balance:</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                  <Zap className="h-4 w-4" />
                  {creditsRemaining} credits
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="text-sm font-medium text-gray-700">Balance After:</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                  <Zap className="h-4 w-4" />
                  {creditsRemaining - creditCost} credits
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Credits will be deducted immediately upon confirmation.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outlined" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : `Confirm & Deduct ${creditCost} Credits`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

