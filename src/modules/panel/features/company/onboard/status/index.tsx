import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { PageHeader } from "@/core/components/ui/structure";
import { fadeInUp } from "@/core/styles/animation/presets";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiGetOnboardingCheckStatus,
  type CompanyStatusData,
} from "@/modules/panel/services/http/company.service";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { AnimatePresence, motion } from "motion/react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { toast } from "sonner";
const OnboardStatus = () => {
  const [inputValue, setInputValue] = useState("");
  const [statusData, setStatusData] = useState<CompanyStatusData | null>(null);
  const [error, setError] = useState("");

  const checkStatusMutation = useMutation({
    mutationFn: apiGetOnboardingCheckStatus,
    onSuccess: (response) => {
      if (response) {
        setStatusData(response);
      } else {
        toast.error("Failed to retrieve status");
        setError("Failed to retrieve status");
        setStatusData(null);
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      setError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to check status",
      );
      setStatusData(null);
    },
  });

  const handleCheckStatus = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError("Please enter an email address");
      return;
    }

    // Validate email format
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);

    if (!isEmail) {
      setError("Please enter a valid email address");
      return;
    }

    const params = { email: inputValue };

    checkStatusMutation.mutate(params);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow email format
    if (/^[^\s@]*@?[^\s@]*\.?[^\s@]*$/.test(value) || value === "") {
      setInputValue(value);
    }
    setError("");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        animate
        title="Check Registration Status"
        description="Enter your email address to check your company's onboarding status"
        fallbackBackUrl={PANEL_ROUTES.ONBOARD.COMPANY}
      />

      <motion.form
        onSubmit={handleCheckStatus}
        className="space-y-6"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0.03 },
        }}
      >
        <div className="space-y-1">
          <label
            htmlFor="status-input"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <Input
            id="status-input"
            type="email"
            placeholder="Enter email address (e.g., user@example.com)"
            value={inputValue}
            onChange={handleInputChange}
            className="flex-1"
            disabled={checkStatusMutation.isPending}
            invalid={!!error}
          />
          {error && (
            <p
              id={"status-input-message"}
              data-slot="form-message"
              className={"text-destructive text-sm"}
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={checkStatusMutation.isPending || !inputValue.trim()}
            loading={checkStatusMutation.isPending}
            variant="contained"
            color="secondary"
            className="mt-2"
          >
            {checkStatusMutation.isPending ? "Checking..." : "Check Status"}
          </Button>
        </div>

        <AnimatePresence>
          {statusData && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
            >
              <Card className="border-border border">
                <CardHeader className="text-lg font-semibold">
                  Company Status
                </CardHeader>

                <hr />

                <CardContent className="text-muted-foreground space-y-4">
                  <div className="flex flex-wrap items-center justify-between">
                    <span>Company Name:</span>
                    <span className="font-medium">
                      {statusData.companyName}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <span className="text-sm font-medium">Addresses:</span>
                    {statusData.addresses.map((address, index) => (
                      <div
                        key={address.addressId}
                        className="bg-muted border-border space-y-2 rounded-md border p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {address.addressType} Address
                          </span>
                          <StatusBadge
                            module="company"
                            variant="contained"
                            status={address.status}
                            className="px-2 py-1 text-xs"
                            showDot={false}
                          />
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Location:</span>{" "}
                          {address.location}
                        </div>
                        {address.statusChangeReason && (
                          <div className="text-sm">
                            <span className="font-medium">Reason:</span>{" "}
                            {address.statusChangeReason}
                          </div>
                        )}
                        {address.statusChangedAt && (
                          <div className="text-sm">
                            <span className="font-medium">Status Changed:</span>{" "}
                            {formatDate(address.statusChangedAt)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
};

export default OnboardStatus;
