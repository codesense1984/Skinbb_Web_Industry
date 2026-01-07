// Placeholder components for remaining Quick Actions
export { CreateNewProductCard } from "./CreateNewProductCard";
export { CreateNewOrderCard } from "./CreateNewOrderCard";
export { AddDiscountCouponCard } from "./AddDiscountCouponCard";
export const AddBrandPartnerCard = () => (
  <div className="cursor-pointer rounded-lg border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 transition-all duration-200 hover:shadow-lg">
    <h3 className="mb-2 text-lg font-semibold text-purple-900">
      Add Brand Partner
    </h3>
    <p className="mb-4 text-sm text-purple-700">Onboard a new brand partner</p>
    <button className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
      Add Partner
    </button>
  </div>
);

export const LaunchCampaignCard = () => (
  <div className="cursor-pointer rounded-lg border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6 transition-all duration-200 hover:shadow-lg">
    <h3 className="mb-2 text-lg font-semibold text-orange-900">
      Launch Campaign
    </h3>
    <p className="mb-4 text-sm text-orange-700">Start a marketing campaign</p>
    <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700">
      Launch Campaign
    </button>
  </div>
);

export const ViewFullAnalyticsReportCard = () => (
  <div className="cursor-pointer rounded-lg border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 transition-all duration-200 hover:shadow-lg">
    <h3 className="mb-2 text-lg font-semibold text-indigo-900">
      View Full Analytics Report
    </h3>
    <p className="mb-4 text-sm text-indigo-700">
      Open detailed analytics dashboard
    </p>
    <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
      View Report
    </button>
  </div>
);

export const RespondToRecentReviewChatCard = () => (
  <div className="cursor-pointer rounded-lg border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 p-6 transition-all duration-200 hover:shadow-lg">
    <h3 className="mb-2 text-lg font-semibold text-teal-900">
      Respond to Recent Review/Chat
    </h3>
    <p className="mb-4 text-sm text-teal-700">Engage with users directly</p>
    <button className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700">
      Respond Now
    </button>
  </div>
);
