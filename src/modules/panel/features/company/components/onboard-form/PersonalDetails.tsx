import { Button } from "@/core/components/ui/button";
import {
  FormFieldsRenderer,
  FormInput,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { OtpModal } from "@/core/components/ui/input-otp";
import { MODE } from "@/core/types";
import { type FC } from "react";
import { useFormContext } from "react-hook-form";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../../schema/fullCompany.schema";

interface PersonalDetailsProps {
  mode: MODE;
}
// const isValidPhone = (val?: string) => !!val && /^[6-9]\d{9}$/.test(val);

const PersonalDetails: FC<PersonalDetailsProps> = ({ mode }) => {
  const { control } = useFormContext<FullCompanyFormType>();
  // const [phoneVerified, setPhoneVerified] = useState(false);

  // const phoneNumber = useWatch({
  //   control,
  //   name: "phoneNumber",
  //   defaultValue: "",
  // });

  const rawInfoFields = fullCompanyDetailsSchema.personal_information({
    mode,
  }) as FormFieldConfig<FullCompanyFormType>[];

  // Send OTP
  // const sendOtpMutation = useMutation({
  //   mutationFn: (phoneNumber: string) =>
  //     apiSendMobileOTP<{ success: boolean }, { phoneNumber: string }>({
  //       phoneNumber,
  //     }),
  //   onSuccess: () => {
  //     toast.success("OTP sent - Check your phone.");
  //   },
  //   onError: (error: AxiosError) => {
  //     toast.error(
  //       `Failed to send OTP - ${error?.response?.data?.message || error.message || "Try again later"}`,
  //     );
  //   },
  // });

  // // Verify OTP
  // const verifyOtpMutation = useMutation({
  //   mutationFn: (payload: { phoneNumber: string; otp: string }) =>
  //     apiVerifyMobileOTP<
  //       { verified: boolean },
  //       { phoneNumber: string; otp: string }
  //     >(payload),
  //   onSuccess: () => {
  //     toast.success("Phone verified");
  //     setPhoneVerified(true);
  //   },
  //   onError: (error) => {
  //     toast.error(`Verification failed - ${error.message || "Invalid OTP"}`);
  //   },
  // });

  return (
    <>
      <FormFieldsRenderer<FullCompanyFormType>
        className="gap-6 lg:grid-cols-2"
        control={control}
        fieldConfigs={rawInfoFields}
      />

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
          }}
        />

        <OtpModal
          onRequestCode={() => Promise.resolve()}
          onVerifyCode={() => Promise.resolve(true)}
          // onRequestCode={() => sendOtpMutation.mutate(phoneNumber)}
          // onVerifyCode={(otp) => verifyOtpMutation.mutate({ phoneNumber, otp })}
        >
          <Button variant={"contained"} color={"primary"}>
            Send OTP
          </Button>
        </OtpModal>
      </div>
    </>
  );
};

export default PersonalDetails;
