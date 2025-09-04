import { HorizontalLogo } from "@/core/config/svg";
import { fadeInUp } from "@/core/styles/animation/presets";
import { motion } from "motion/react";
import { Outlet } from "react-router";

const OnboardLayout = () => {
  return (
    <div className="w-full gap-4">
      {/* <style>
        {`
  html{
    overflow: hidden;
  }
  `}
      </style> */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12">
        <div
          className="from-secondary to-secondary relative flex h-[100dvh] items-center justify-center bg-linear-to-b p-4 py-10 md:top-0 md:px-8 md:py-12 lg:sticky lg:col-span-5"
          // className="before:from-secondary before:to-secondary relative flex items-center justify-center p-4 py-10 before:absolute before:inset-0 before:bg-linear-to-b  md:sticky md:top-0 md:col-span-5 md:min-h-[100dvh] md:px-8 md:py-12 md:before:z-[-1]"
          // style={{
          //   // backgroundImage: `url(${onBoarding})`,
          //   backgroundSize: "cover",
          // }}
        >
          <div className="dark relative z-[1] mx-auto max-w-lg space-y-8 text-center">
            <motion.div
              {...{
                ...fadeInUp,
                transition: { ...fadeInUp.transition, delay: 0 },
              }}
            >
              <HorizontalLogo className="h-10" />
            </motion.div>

            <motion.h1
              className="h4 text-foreground font-bold"
              {...{
                ...fadeInUp,
                transition: { ...fadeInUp.transition, delay: 0.03 },
              }}
            >
              Join the Skincare Metaverse — Where Knowledge, Trust & Commerce
              Converge
            </motion.h1>

            <motion.p
              {...{
                ...fadeInUp,
                transition: { ...fadeInUp.transition, delay: 0.06 },
              }}
            >
              <b>SkinBB</b> is more than a platform — it&apos;s the operating
              system for skincare brands. From consumer intelligence to
              dermatologist validation and seamless commerce, we help you cut
              through noise, build trust, and drive measurable growth.
            </motion.p>

            <motion.p
              {...{
                ...fadeInUp,
                transition: { ...fadeInUp.transition, delay: 0.08 },
              }}
            >
              Be an early mover. Join <b>SkinBB</b> today and redefine the
              future of skincare with us. 🚀
            </motion.p>

            {/* <img src={onBoarding} alt="" className="w-80 h-full object-cover mx-auto" /> */}
          </div>
        </div>
        <div className="col-span-7 w-full">
          <div className="mx-auto h-full w-full max-w-2xl space-y-10 p-4 py-6 md:px-6 md:pt-12 lg:py-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardLayout;
