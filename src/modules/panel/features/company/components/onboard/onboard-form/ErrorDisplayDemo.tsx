import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ErrorDisplaySection from "./ErrorDisplaySection";

// Simple demo schema to show validation errors
const demoSchema = z.object({
  designation: z.string().min(1, "Designation is required"),
  address: z
    .array(
      z.object({
        addressType: z.enum(["registered", "office"]),
        address: z.string().min(1, "Address is required"),
      }),
    )
    .min(1, "At least one address is required")
    .refine(
      (addresses) =>
        addresses.some((addr) => addr.addressType === "registered"),
      {
        message: "At least one address must be 'registered'",
        path: ["root"],
      },
    ),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

type DemoFormType = z.infer<typeof demoSchema>;

const ErrorDisplayDemo: React.FC = () => {
  const methods = useForm<DemoFormType>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      designation: "",
      address: [],
      email: "",
      phoneNumber: "",
    },
    mode: "onChange",
  });

  const { handleSubmit, setValue } = methods;

  const onSubmit = (data: DemoFormType) => {
    console.log("Form submitted:", data);
  };

  const onError = (errors: any) => {
    console.log("Form errors:", errors);
  };

  // Function to trigger validation errors for demo
  const triggerErrors = () => {
    setValue("designation", "");
    setValue("email", "invalid-email");
    setValue("phoneNumber", "123");
    setValue("address", []);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">Error Display Section Demo</h1>
        <p className="text-muted-foreground">
          This demonstrates how the ErrorDisplaySection component shows all form
          validation errors
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Error Display Section - This will show all validation errors */}
          <ErrorDisplaySection />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Designation
              </label>
              <input
                type="text"
                className="w-full rounded-md border px-3 py-2"
                {...methods.register("designation")}
                placeholder="Enter designation"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-md border px-3 py-2"
                {...methods.register("email")}
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full rounded-md border px-3 py-2"
                {...methods.register("phoneNumber")}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Address Type
              </label>
              <select
                className="w-full rounded-md border px-3 py-2"
                {...methods.register("address.0.addressType")}
              >
                <option value="">Select address type</option>
                <option value="registered">Registered</option>
                <option value="office">Office</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Address</label>
            <textarea
              className="w-full rounded-md border px-3 py-2"
              {...methods.register("address.0.address")}
              placeholder="Enter address"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={triggerErrors}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Trigger Validation Errors
            </button>

            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Submit Form
            </button>
          </div>
        </form>
      </FormProvider>

      <div className="mt-8 rounded-md bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold">How it works:</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            • The ErrorDisplaySection automatically detects all form validation
            errors
          </li>
          <li>
            • Errors are grouped by category (Personal Information, Address
            Information, etc.)
          </li>
          <li>
            • Each error shows the field name, error type, and specific message
          </li>
          <li>
            • The section is collapsible and only appears when there are errors
          </li>
          <li>• Click "Trigger Validation Errors" to see it in action</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorDisplayDemo;
