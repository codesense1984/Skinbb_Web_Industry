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
    <div className="bg-muted border-border flex h-15 w-15 items-center justify-center rounded-full border">
      <Icon className="text-primary h-8 w-8" />
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
      title: "Higher Reach",
      description: "Access millions of buyers across India",
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Business on the go",
      description: "No upfront cost to get started",
    },
    {
      icon: CurrencyDollarIcon,
      title: "Simplified Fee Structure",
      description: "Start selling products in a matter of minutes",
    },
    {
      icon: ChartBarIcon,
      title: "Grow your business",
      description: "Promote your business with our webpage",
    },
  ];

  return (
    <div className="space-y-4">
      <motion.h4
        className="font-bold"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0 },
        }}
      >
        👋 Welcome to SkinBB Onboarding
      </motion.h4>
      <motion.p
        className="text-lg"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0.01 },
        }}
      >
        Let&apos;s get started with your journey. Our onboarding helps you
        register your business, verify compliance, and make your brand visible
        to millions of potential customers. You can either begin a new
        onboarding or check the status of your existing submission.
      </motion.p>

      <motion.h1
        className="text-2xl font-semibold"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0.03 },
        }}
      >
        Grow your business on SkinBB
      </motion.h1>

      <motion.div
        className="grid grid-cols-2 gap-4"
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
        className="mt-10 flex gap-4"
        {...{
          ...fadeInUp,
          transition: { ...fadeInUp.transition, delay: 0.07 },
        }}
      >
        <Button variant="contained" color="primary" asChild>
          <Link to={PANEL_ROUTES.ONBOARD.COMPANY_CREATE}>Begin Onboarding</Link>
        </Button>
        <Button variant="outlined" color="primary" asChild>
          <Link to={PANEL_ROUTES.ONBOARD.COMPANY_STATUS}>Check Status</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default CompanyOnboard;
