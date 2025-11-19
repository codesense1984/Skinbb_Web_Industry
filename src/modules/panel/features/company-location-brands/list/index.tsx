// import { Button } from "@/core/components/ui/button";
// import { PageContent } from "@/core/components/ui/structure";
// import { useAuth } from "@/modules/auth/hooks/useAuth";
// import { BrandList } from "@/modules/panel/components/pages/brands/brand-list";
// import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
// import { NavLink, useParams } from "react-router";

// const CompanyLocationBrandsList = () => {
//   const { companyId, locationId } = useParams();
//   const { userId } = useAuth();

//   if (!companyId || !locationId || !userId) {
//     return (
//       <div className="py-8 text-center">
//         <p className="text-gray-500">
//           Invalid company, location, or user ID provided.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <PageContent
//       header={{
//         title: "Brands ashish",
//         description: "Manage brands for this location",
//         actions: (
//           <Button color="primary" asChild>
//             <NavLink
//               to={PANEL_ROUTES.COMPANY_LOCATION.BRAND_CREATE(
//                 companyId,
//                 locationId,
//               )}
//             >
//               {"Add Brand"}
//             </NavLink>
//           </Button>
//         ),
//       }}
//     >
//       <BrandList
//         showStatusFilter
//         companyId={companyId}
//         locationId={locationId}
//         userId={userId}
//       />
//     </PageContent>
//   );
// };

// export default CompanyLocationBrandsList;
