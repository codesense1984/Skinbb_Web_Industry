import onBoarding from "@/core/assets/images/onboard-company.jpg";
import { HorizontalLogo } from "@/core/config/svg";
import { Outlet } from "react-router";

const OnboardLayout = () => {
  return (
    <div className="w-full gap-4 md:h-[100vh]">
      <div className="relative grid grid-cols-1 md:grid-cols-12">
        <div
          className="relative p-4 py-10 before:absolute before:inset-0 before:bg-linear-to-b before:from-black/90 before:to-black/10 before:content-['*'] md:sticky md:top-0 md:col-span-5 md:h-[100dvh] md:px-8 md:py-12 md:before:z-[-1]"
          style={{
            backgroundImage: `url(${onBoarding})`,
            backgroundSize: "cover",
          }}
        >
          <div className="dark relative z-[1] space-y-6 text-center">
            <HorizontalLogo className="" />
            <h1 className="text-foreground h3">Corporate Compliance </h1>
            <p className="font-normal">
              To ensure regulatory alignment and maintain accurate company
              records, please complete this form with your organization’s
              official details. The information provided will be used solely for
              compliance, verification, and onboarding purposes.
            </p>
          </div>
        </div>
        <div className="col-span-7 mx-auto w-full max-w-2xl space-y-10 p-4 py-6 md:px-6 md:pt-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OnboardLayout;
