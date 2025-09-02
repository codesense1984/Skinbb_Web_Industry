import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { PageHeader } from "@/core/components/ui/structure";
import { fadeInUp } from "@/core/styles/animation/presets";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiCheckCompanyStatus,
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
    mutationFn: apiCheckCompanyStatus,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setStatusData(response.data);
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
      setError("Please enter an email or phone number");
      return;
    }

    // Determine if input is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);
    const isPhone = /^[6-9]\d{9}$/.test(inputValue);

    if (!isEmail && !isPhone) {
      setError("Please enter a valid email address or 10-digit phone number");
      return;
    }

    const params = isEmail
      ? { email: inputValue }
      : { phoneNumber: inputValue };

    checkStatusMutation.mutate(params);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits for phone or email format
    if (
      /^[6-9]\d{0,9}$/.test(value) ||
      /^[^\s@]*@?[^\s@]*\.?[^\s@]*$/.test(value)
    ) {
      setInputValue(value);
    } else if (value === "") {
      setInputValue(value);
    }
    setError("");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        animate
        title="Check Registration Status"
        description="Enter your email address or phone number to check your company's onboarding status"
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
            Email or Phone Number
          </label>
          <Input
            id="status-input"
            type="text"
            placeholder="Enter email (e.g., user@example.com) or phone (e.g., 9876543210)"
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
            color="primary"
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

                  <div className="flex flex-wrap items-center justify-between">
                    <span>Status:</span>
                    <StatusBadge
                      module="company"
                      variant="contained"
                      status={statusData.status}
                      className="px-3"
                      showDot={false}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between">
                    <span>Status Changed:</span>
                    <span className="font-medium">
                      {formatDate(statusData.statusChangedAt)}
                    </span>
                  </div>
                  {statusData.statusChangeReason && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>Reason:</span>
                      <p className="bg-muted border-border rounded-md border px-3 py-1 font-medium">
                        {statusData.statusChangeReason}
                      </p>
                    </div>
                  )}
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
