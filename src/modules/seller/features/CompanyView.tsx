// import React from "react";
// import { CompanyViewCore } from "@/modules/panel/features/company/components/CompanyViewCore";
// import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
// import { useNavigate } from "react-router";
// import { SELLER_ROUTES } from "../routes/constant";
// import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
// import { useEntityCacheActions } from "@/core/store/hooks";

// interface SellerCompanyViewProps {
//   showViewUsersAction?: boolean;
//   customHeader?: {
//     title?: string;
//     description?: string;
//     actions?: React.ReactNode;
//   };
//   onViewBrands?: (props: {
//     companyId: string;
//     locationId: string;
//     companyName: string;
//     locationName: string;
//   }) => void;
//   onViewProducts?: (companyId: string, locationId: string) => void;
//   onViewUsers?: (companyId: string) => void;
// }

// const SellerCompanyView: React.FC<SellerCompanyViewProps> = ({
//   showViewUsersAction = true,
//   customHeader,
//   onViewBrands,
//   onViewProducts,
//   onViewUsers,
// }) => {
//   const navigate = useNavigate();
//   const { setCompany, setLocation } = useEntityCacheActions();
//   const { sellerInfo, isLoading, isError, getCompanyId } = useSellerAuth();

//   console.log(sellerInfo);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="text-center">
//           <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
//           <p className="text-gray-600">Loading seller information...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError || !sellerInfo) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="text-center">
//           <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
//             <svg
//               className="h-6 w-6 text-red-600"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
//               />
//             </svg>
//           </div>
//           <p className="font-medium text-red-600">
//             Failed to load seller information
//           </p>
//           <p className="text-muted-foreground mt-1 text-sm">
//             Please try refreshing the page or contact support.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const companyId = getCompanyId();

//   if (!companyId) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="text-center">
//           <p className="text-gray-600">
//             Company ID not found in seller information
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const handleViewBrands = (props: {
//     companyId: string;
//     locationId: string;
//     companyName: string;
//     locationName: string;
//   }) => {
//     if (onViewBrands) {
//       onViewBrands(props);
//     } else {
//       // Navigate to brands list for this specific location
//       setCompany({ id: props.companyId, name: props.companyName });
//       setLocation({ id: props.locationId, name: props.locationName });
//       navigate(SELLER_ROUTES.BRANDS.LIST(props.companyId, props.locationId));
//     }
//   };

//   const handleViewProducts = (companyId: string, locationId: string) => {
//     if (onViewProducts) {
//       onViewProducts(companyId, locationId);
//     } else {
//       // Navigate to products list for this specific location
//       navigate(
//         SELLER_ROUTES.COMPANY_LOCATION_PRODUCTS.LIST(companyId, locationId),
//       );
//     }
//   };

//   const handleViewUsers = (companyId: string) => {
//     if (onViewUsers) {
//       onViewUsers(companyId);
//     } else {
//       // Navigate to company users list
//       navigate(SELLER_ROUTES.USERS.LIST(companyId));
//     }
//   };

//   const handleViewLocation = (_companyId: string, locationId: string) => {
//     // Navigate to specific location view
//     navigate(SELLER_ROUTES.COMPANY_LOCATION.VIEW(locationId));
//   };

//   const handleEditLocation = (companyId: string, locationId: string) => {
//     // Navigate to panel onboarding edit page for company location
//     navigate(PANEL_ROUTES.ONBOARD.COMPANY_EDIT(companyId, locationId));
//   };

//   return (
//     <CompanyViewCore
//       companyId={companyId}
//       showViewUsersAction={showViewUsersAction}
//       customHeader={customHeader}
//       onViewBrands={handleViewBrands}
//       onViewProducts={handleViewProducts}
//       onViewUsers={handleViewUsers}
//       onViewLocation={handleViewLocation}
//       onEditLocation={handleEditLocation}
//     />
//   );
// };

// export default SellerCompanyView;
