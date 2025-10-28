// Placeholder components for remaining Quick Actions
export { CreateNewProductCard } from "./CreateNewProductCard";
export { CreateNewOrderCard } from "./CreateNewOrderCard";
export { AddDiscountCouponCard } from "./AddDiscountCouponCard";
export const AddBrandPartnerCard = () => (
  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
    <h3 className="text-lg font-semibold text-purple-900 mb-2">Add Brand Partner</h3>
    <p className="text-sm text-purple-700 mb-4">Onboard a new brand partner</p>
    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
      Add Partner
    </button>
  </div>
);

export const LaunchCampaignCard = () => (
  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
    <h3 className="text-lg font-semibold text-orange-900 mb-2">Launch Campaign</h3>
    <p className="text-sm text-orange-700 mb-4">Start a marketing campaign</p>
    <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm">
      Launch Campaign
    </button>
  </div>
);

export const ViewFullAnalyticsReportCard = () => (
  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
    <h3 className="text-lg font-semibold text-indigo-900 mb-2">View Full Analytics Report</h3>
    <p className="text-sm text-indigo-700 mb-4">Open detailed analytics dashboard</p>
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
      View Report
    </button>
  </div>
);

export const RespondToRecentReviewChatCard = () => (
  <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
    <h3 className="text-lg font-semibold text-teal-900 mb-2">Respond to Recent Review/Chat</h3>
    <p className="text-sm text-teal-700 mb-4">Engage with users directly</p>
    <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm">
      Respond Now
    </button>
  </div>
);
