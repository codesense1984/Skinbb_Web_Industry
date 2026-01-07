// import { useParams, useNavigate } from "react-router";
// import { PageContent } from "@/core/components/ui/structure";
// import { Button } from "@/core/components/ui/button";
// import { ArrowLeftIcon } from "@heroicons/react/24/solid";
// import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

// const CompanyBrandCreate = () => {
//   const { companyId } = useParams();
//   const navigate = useNavigate();

//   if (!companyId) {
//     return (
//       <PageContent
//         header={{
//           title: "Create Brand",
//           description: "Company ID is required to create brand.",
//         }}
//       >
//         <div className="py-8 text-center">
//           <p className="text-gray-500">Invalid company ID provided.</p>
//         </div>
//       </PageContent>
//     );
//   }

//   return (
//     <PageContent
//       header={{
//         title: "Create Brand",
//         description: `Create a new brand for company ID: ${companyId}`,
//         actions: (
//           <Button
//             onClick={() => navigate(PANEL_ROUTES.COMPANY.BRANDS(companyId))}
//             variant="outlined"
//           >
//             <ArrowLeftIcon className="mr-2 h-4 w-4" />
//             Back to Brands
//           </Button>
//         ),
//       }}
//     >
//       <div className="py-8 text-center">
//         <p className="text-gray-500">
//           Brand creation form will be implemented here.
//         </p>
//         <p className="mt-2 text-sm text-gray-400">
//           This will use the existing brand form component with the API data.
//         </p>
//       </div>
//     </PageContent>
//   );
// };

// export default CompanyBrandCreate;
