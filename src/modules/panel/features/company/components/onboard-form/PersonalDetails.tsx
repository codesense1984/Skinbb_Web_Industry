import { Button } from "@/core/components/ui/button";
import {
  FormFieldsRenderer,
  FormInput,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { OtpModal, type OtpModalRef } from "@/core/components/ui/input-otp";
import { MODE } from "@/core/types";
import {
  apiSendMobileOTP,
  apiVerifyMobileOTP,
  type VerifyMobileOTPData,
} from "@/modules/panel/services/http/company.service";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRef, type FC } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../schema/fullCompany.schema";

interface PersonalDetailsProps {
  mode: MODE;
}
// const isValidPhone = (val?: string) => !!val && /^[6-9]\d{9}$/.test(val);

const PersonalDetails: FC<PersonalDetailsProps> = ({ mode }) => {
  const { control, setValue } = useFormContext<FullCompanyFormType>();
  const otpModalRef = useRef<OtpModalRef>(null);

  const phoneNumber = useWatch({
    control,
    name: "phoneNumber",
    defaultValue: "",
  });
  const phoneVerified = useWatch({
    control,
    name: "phoneVerified",
    defaultValue: false,
  });

  const rawInfoFields = fullCompanyDetailsSchema.personal_information({
    mode,
  }) as FormFieldConfig<FullCompanyFormType>[];

  // Send OTP
  const sendOtpMutation = useMutation({
    mutationFn: (phoneNumber: string) => apiSendMobileOTP({ phoneNumber }),
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        `Failed to send OTP - ${(error?.response?.data as { message?: string })?.message || error.message || "Try again later"}`,
      );
    },
  });

  // // Verify OTP
  const verifyOtpMutation = useMutation({
    mutationFn: (payload: VerifyMobileOTPData) => apiVerifyMobileOTP(payload),
    onSuccess: () => {
      toast.success("Phone verified");
    },
    onError: (error: Error) => {
      toast.error(`Verification failed - ${error.message || "Invalid OTP"}`);
    },
  });

  return (
    <>
      <FormFieldsRenderer<FullCompanyFormType>
        className="gap-6 md:grid-cols-1 lg:grid-cols-2"
        control={control}
        fieldConfigs={rawInfoFields}
      >
        <div className="flex items-end gap-4">
          <FormInput
            className="grow"
            type="text"
            control={control}
            name="phoneNumber"
            label="Phone Number"
            placeholder="Enter phone number"
            inputProps={{
              keyfilter: "int",
              maxLength: 10,
              endIcon: (
                <Button
                  variant={"contained"}
                  color={"primary"}
                  disableAnimation
                  type="button"
                  className="text-background !mr-0 rounded-l-none"
                  disabled={
                    phoneVerified ||
                    sendOtpMutation.isPending ||
                    verifyOtpMutation.isPending ||
                    phoneNumber.length !== 10
                  }
                  onClick={() => otpModalRef.current?.setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      otpModalRef.current?.setOpen(true);
                    }
                  }}
                >
                  {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
                </Button>
              ),
            }}
            disabled={phoneVerified || sendOtpMutation.isPending}
          />
        </div>

        <FormInput
          className="col-span-2"
          type="password"
          control={control}
          name="password"
          label="Password"
          placeholder="Enter phone number"
        />

        <FormFieldsRenderer<FullCompanyFormType>
          control={control}
          fieldConfigs={fullCompanyDetailsSchema.terms({
            mode,
          })}
          className="col-span-2 flex"
        />
      </FormFieldsRenderer>

      <OtpModal
        ref={otpModalRef}
        onRequestCode={async () => {
          await sendOtpMutation.mutateAsync(phoneNumber);
        }}
        onVerifyCode={async (code) => {
          const data = await verifyOtpMutation.mutateAsync({
            phoneNumber,
            otp: code,
          });
          setValue("phoneVerified", true, { shouldValidate: true });
          setValue("phoneNumber", phoneNumber, { shouldValidate: true });
          return !!data.success;
        }}
      />
    </>
  );
};

export default PersonalDetails;
