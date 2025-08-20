import logo from "@/core/assets/images/logo-white.png";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { FormInput } from "@/core/components/ui/form-input";
import type { ApiErrorShape } from "@/core/services/http";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { AUTH_ROUTES } from "../../routes/constants";
import { onLoginSuccess } from "../../services/auth.service";
import {
  login,
  type LoginPayload,
  type LoginSuccess,
} from "../../services/http/auth.service";

export const schema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must be at most 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),

  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

export type FormType = z.infer<typeof schema>;

const SignIn = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      phoneNumber: "",
      password: "",
      remember: false,
    },
  });

  const { mutate, isPending } = useMutation<
    LoginSuccess,
    ApiErrorShape,
    LoginPayload
  >({
    mutationKey: ["auth", "login"],
    retry: 0,
    mutationFn: login,
    onSuccess(data) {
      onLoginSuccess(qc, data, form.getValues("remember"));
      toast.success("Login successful!", { duration: 900 });
      navigate("/", { replace: true });
    },
    onError(error) {
      console.log("🚀 ~ onError ~ error:", error);
      toast.error(error.message ?? "Something went wrong!");
    },
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const onSubmit = async (values: FormType) => {
    mutate({
      password: values.password,
      phoneNumber: values.phoneNumber,
    });
  };

  return (
    <div className="bg-muted p-4">
      <Form {...form}>
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center">
          <form
            className="bg-background flex h-full w-full flex-col items-center justify-center gap-8 rounded-lg border p-4 shadow-lg sm:p-10"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <img src={logo} alt="Logo" className="w-32" />

            <h5 className="-mt-4">Welcome to SkinBB Tracker</h5>

            <div className="flex w-full flex-col gap-5">
              <FormInput
                control={form.control}
                type="text"
                name="phoneNumber"
                label="Phone Number"
                placeholder="Enter phone number"
                disabled={isPending}
                inputProps={{
                  autoFocus: true,
                  keyfilter: "num",
                  endIcon: <PhoneIcon className="size-5" />,
                  className: "py-6",
                }}
              />

              <FormInput
                control={form.control}
                type={isDarkMode ? "text" : "password"}
                name="password"
                label="Password"
                placeholder="Enter password"
                disabled={isPending}
                inputProps={{
                  className: "py-6",
                  endIcon: isDarkMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="pointer-events-auto !size-5 rotate-180 transform !cursor-pointer transition-transform duration-500 dark:rotate-0"
                      onClick={toggleMode}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="pointer-events-auto !size-5 rotate-0 transform !cursor-pointer transition-transform duration-500 dark:rotate-180"
                      onClick={toggleMode}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ),
                }}
              />

              <div className="flex justify-between gap-2">
                <FormInput
                  control={form.control}
                  type="checkbox"
                  name="remember"
                  label="Remember me"
                  disabled={isPending}
                />

                <NavLink
                  to={AUTH_ROUTES.FORGOT_PASSWORD}
                  className="flex items-center gap-3"
                >
                  Forgot password
                </NavLink>
              </div>
            </div>

            <Button
              color={"primary"}
              className="h-13 w-full"
              loading={isPending}
            >
              Sign In
            </Button>

            {/* <hr />

        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <NavLink to={AUTH_ROUTES.SIGN_UP}>Sign up</NavLink>
        </p> */}
          </form>
        </div>
      </Form>
    </div>
  );
};

export default SignIn;
