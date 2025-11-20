// import { Button } from "@/core/components/ui/button";
// import { PageContent } from "@/core/components/ui/structure";
// import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
// import { BrandList } from "@/modules/panel/components/pages/brands/brand-list";
// import { SELLER_ROUTES } from "@/modules/seller/routes/constant";
// import { NavLink } from "react-router";

// const SellerBrandList = () => {
//   const { sellerInfo, isLoading: sellerInfoLoading } = useSellerAuth();

//   if (sellerInfoLoading) {
//     return (
//       <PageContent
//         header={{
//           title: "Brands",
//           description: "Loading your company's brands...",
//         }}
//       >
//         <div className="py-8 text-center">
//           <p className="text-gray-500">Loading...</p>
//         </div>
//       </PageContent>
//     );
//   }

//   return (
//     <PageContent
//       header={{
//         title: "Brands",
//         description: `Brands for ${sellerInfo?.companyName}`,
//         actions: (
//           <Button color={"primary"} asChild>
//             <NavLink to={SELLER_ROUTES.SELLER_BRANDS.CREATE}>Add Brand</NavLink>
//           </Button>
//         ),
//       }}
//     >
//       <BrandList
//         showLocationFilter
//         showStatusFilter
//         companyId={sellerInfo?.companyId}
//       />
//     </PageContent>
//   );
// };

// export default SellerBrandList;
