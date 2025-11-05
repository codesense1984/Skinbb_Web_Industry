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
  apiSendEmailOTP,
  apiVerifyEmailOTP,
  type VerifyEmailOTPData,
} from "@/modules/panel/services/http/company.service";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRef, type FC } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../../schema/fullCompany.schema";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface PersonalDetailsProps {
  mode: MODE;
}
// const isValidPhone = (val?: string) => !!val && /^[6-9]\d{9}$/.test(val);

const PersonalDetails: FC<PersonalDetailsProps> = ({ mode }) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<FullCompanyFormType>();
  console.log("🚀 ~ PersonalDetails ~ errors:", errors);
  const otpModalRef = useRef<OtpModalRef>(null);
  const emailOtpModalRef = useRef<OtpModalRef>(null);

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

  const email = useWatch({
    control,
    name: "email",
    defaultValue: "",
  });
  const emailVerified = useWatch({
    control,
    name: "emailVerified",
    defaultValue: false,
  });

  const rawInfoFields = fullCompanyDetailsSchema.personal_information({
    mode,
    disabled: mode === MODE.EDIT,
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

  // Send Email OTP
  const sendEmailOtpMutation = useMutation({
    mutationFn: (email: string) => apiSendEmailOTP({ email }),
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        `Failed to send OTP - ${(error?.response?.data as { message?: string })?.message || error.message || "Try again later"}`,
      );
    },
  });

  // Verify Email OTP
  const verifyEmailOtpMutation = useMutation({
    mutationFn: (payload: VerifyEmailOTPData) => apiVerifyEmailOTP(payload),
    onSuccess: () => {
      toast.success("Email verified");
    },
    onError: (error: Error) => {
      toast.error(`Verification failed - ${error.message || "Invalid OTP"}`);
    },
  });

  // Filter out email field from rawInfoFields since we'll render it separately
  const filteredInfoFields = rawInfoFields.filter((field) => field.name !== "email");

  return (
    <>
      <FormFieldsRenderer<FullCompanyFormType>
        className="flex flex-wrap gap-6 md:grid md:grid-cols-2 lg:grid-cols-2 [&>div]:w-full [&>div]:flex-[1_1_200px]"
        control={control}
        fieldConfigs={filteredInfoFields}
      >
        <FormInput
          type="email"
          control={control}
          name="email"
          label={
            <span>
              Email Address{" "}
              <span className="text-green-500">
                {emailVerified ? "(Verified)" : ""}
              </span>
            </span>
          }
          placeholder="Enter email address"
          className=""
          inputProps={{
            endIcon:
              mode !== MODE.EDIT && !emailVerified ? (
                <Button
                  variant={"contained"}
                  color={"primary"}
                  disableAnimation
                  type="button"
                  className="text-background !mr-0 rounded-l-none"
                  disabled={
                    sendEmailOtpMutation.isPending ||
                    verifyEmailOtpMutation.isPending ||
                    !email ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  }
                  onClick={() => emailOtpModalRef.current?.setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      emailOtpModalRef.current?.setOpen(true);
                    }
                  }}
                >
                  {sendEmailOtpMutation.isPending ? "Sending..." : "Send OTP"}
                </Button>
              ) : mode !== MODE.EDIT ? (
                <Button
                  variant={"outlined"}
                  color={"default"}
                  type="button"
                  className="!mr-0 rounded-l-none px-3"
                  startIcon={<XMarkIcon className="size-4" />}
                  onClick={() => {
                    setValue("emailVerified", false, {
                      shouldValidate: true,
                    });
                    setValue("email", "", { shouldValidate: true });
                  }}
                ></Button>
              ) : undefined,
          }}
          disabled={
            mode === MODE.EDIT || emailVerified || sendEmailOtpMutation.isPending
          }
        />

        <FormInput
          type="text"
          control={control}
          name="phoneNumber"
          label={
            <span>
              Phone Number{" "}
              <span className="text-green-500">
                {phoneVerified ? "(Verified)" : ""}
              </span>
            </span>
          }
          placeholder="Enter phone number"
          className=""
          inputProps={{
            keyfilter: "int",
            maxLength: 10,
            endIcon:
              mode !== MODE.EDIT && !phoneVerified ? (
                <Button
                  variant={"contained"}
                  color={"primary"}
                  disableAnimation
                  type="button"
                  className="text-background !mr-0 rounded-l-none"
                  disabled={
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
              ) : mode !== MODE.EDIT ? (
                <Button
                  variant={"outlined"}
                  color={"default"}
                  type="button"
                  className="!mr-0 rounded-l-none px-3"
                  startIcon={<XMarkIcon className="size-4" />}
                  onClick={() => {
                    setValue("phoneVerified", false, {
                      shouldValidate: true,
                    });
                    setValue("phoneNumber", "", { shouldValidate: true });
                  }}
                ></Button>
              ) : undefined,
          }}
          disabled={
            mode === MODE.EDIT || phoneVerified || sendOtpMutation.isPending
          }
        />

        {mode === MODE.ADD && (
          <FormInput
            className="col-span-2"
            type="password"
            control={control}
            name="password"
            label="Password"
            placeholder="Enter phone number"
          />
        )}
        <FormFieldsRenderer<FullCompanyFormType>
          control={control}
          fieldConfigs={fullCompanyDetailsSchema.terms({
            mode,
          })}
          className="!flex-[1_1_100%] md:!col-span-2"
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

      <OtpModal
        ref={emailOtpModalRef}
        onRequestCode={async () => {
          await sendEmailOtpMutation.mutateAsync(email);
        }}
        onVerifyCode={async (code) => {
          const data = await verifyEmailOtpMutation.mutateAsync({
            email,
            otp: code,
          });
          setValue("emailVerified", true, { shouldValidate: true });
          setValue("email", email, { shouldValidate: true });
          return !!data.success;
        }}
      />
    </>
  );
};

export default PersonalDetails;
