import { Button } from "@/core/components/ui/button.tsx";
import { fadeInUp } from "@/core/styles/animation/presets";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { type ComponentType, type FC } from "react";
import { Link } from "react-router";

interface FeatureCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="flex max-w-full gap-4">
    <div className="bg-muted border-primary flex h-12 w-12 items-center justify-center rounded-full border">
      <Icon className="text-primary h-6 w-6" />
    </div>
    <div className="flex-1">
      <h6 className="text-lg font-medium">{title}</h6>
      <p className="">{description}</p>
    </div>
  </div>
);

const CompanyOnboard = () => {
  const features = [
    {
      icon: GlobeAltIcon,
      title: "Real-Time Consumer Insights",
      description:
        "Ingredient-level data, routine analysis, and predictive trends.",
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Doctor-Backed Credibility",
      description:
        "Dermatologist validation builds trust where influencers can’t.",
    },
    {
      icon: CurrencyDollarIcon,
      title: "Targeted Marketing",
      description:
        "Reach exactly the right audience with hyper-segmented campaigns.",
    },
    {
      icon: ChartBarIcon,
      title: "Integrated Commerce",
      description:
        "Integrated Commerce → From discovery → validation → purchase, all within one ecosystem.",
    },
  ];

  return (
    <div className="flex h-full flex-col justify-center space-y-4 md:space-y-8">
      {/* <motion.h4
        className="font-bold"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0 },
        }}
      >
        Join the Skincare Metaverse — Where Knowledge, Trust & Commerce Converge
      </motion.h4>
      <motion.p
        className="text-lg"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0.01 },
        }}
      >
        SkinBB is more than a platform — it&apos;s the operating system for
        skincare brands. From consumer intelligence to dermatologist validation
        and seamless commerce, we help you cut through noise, build trust, and
        drive measurable growth.
      </motion.p> */}

      <motion.h1
        className="h4 font-semibold"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0.03 },
        }}
      >
        Why Partner with Us
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 gap-8"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0.05 },
        }}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </motion.div>

      <motion.div
        className="mt-5 flex gap-4"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0.07 },
        }}
      >
        <Button variant="contained" size={"lg"} color="secondary" asChild>
          <Link to={PANEL_ROUTES.ONBOARD.COMPANY_CREATE}>Begin Onboarding</Link>
        </Button>
        <Button variant="outlined" size={"lg"} color="secondary" asChild>
          <Link to={PANEL_ROUTES.ONBOARD.COMPANY_STATUS}>Check Status</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default CompanyOnboard;
