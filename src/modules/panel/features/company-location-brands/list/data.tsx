// //import { TableAction } from "@/core/components/data-table/components/table-action";
// import { Avatar } from "@/core/components/ui/avatar";
// import { StatusBadge } from "@/core/components/ui/badge";
// import { Button } from "@/core/components/ui/button";
// import {
//   DropdownMenu,
//   type DropdownMenuItemType,
// } from "@/core/components/ui/dropdown-menu";
// import { STATUS_MAP } from "@/core/config/status";
// import { formatDate, formatCurrency, capitalize } from "@/core/utils";
// import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
// import type { CompanyLocationBrand } from "@/modules/panel/types/brand.type";
// import {
//   EllipsisVerticalIcon,
//   EyeIcon,
//   PencilIcon,
//   ShoppingBagIcon,
// } from "@heroicons/react/24/solid";
// import type { ColumnDef } from "@tanstack/react-table";

// export const columns = (
//   companyId: string,
//   locationId: string,
// ): ColumnDef<CompanyLocationBrand>[] => [
//   {
//     header: "Brand Name",
//     accessorKey: "name",
//     size: 180,
//     cell: ({ row }) => (
//       <div className="flex w-max items-center gap-3 font-medium">
//         {
//           <Avatar
//             src={row?.original?.logoImage}
//             feedback={capitalize(row.original.name?.charAt(0))}
//           />
//         }
//         <span>{row.original?.name}</span>
//       </div>
//     ),
//   },

//   // {
//   //   header: "Total SKU",
//   //   accessorKey: "totalSKU",
//   //   size: 120,
//   //   cell: ({ row }) => <div className="w-max">{row.original.totalSKU}</div>,
//   // },
//   {
//     header: "Marketing Budget",
//     accessorKey: "marketingBudget",
//     cell: ({ row }) => (
//       <div className="w-max">
//         {formatCurrency(row.original.marketingBudget)}
//       </div>
//     ),
//   },
//   {
//     header: "Status",
//     accessorKey: "status",
//     size: 200,
//     cell: ({ row }) => (
//       <div className="space-y-1">
//         <StatusBadge
//           status={row.original.status}
//           module="brand"
//           variant="badge"
//         >
//           {row.original.status}
//         </StatusBadge>
//         {row.original.status === "rejected" &&
//           row.original.statusChangeReason && (
//             <div
//               className="max-w-[180px] truncate text-xs text-red-600"
//               title={row.original.statusChangeReason}
//             >
//               Reason: {row.original.statusChangeReason}
//             </div>
//           )}
//       </div>
//     ),
//   },
//   {
//     header: "Created Date",
//     accessorKey: "createdAt",
//     size: 120,
//     cell: ({ row }) => {
//       const createdAt = row.getValue("createdAt") as string;
//       return <div className="w-max">{formatDate(createdAt)}</div>;
//     },
//   },
//   {
//     header: "Action",
//     accessorKey: "actions",
//     enableSorting: false,
//     enableHiding: false,
//     size: 80,
//     cell: ({ row }) => {
//       // const brandStatus = row.original.status;
//       const items: DropdownMenuItemType[] = [
//         {
//           type: "link",
//           to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(
//             companyId,
//             locationId,
//             row.original._id,
//           ),
//           title: "View brand details",
//           children: (
//             <>
//               <EyeIcon className="size-4" /> View
//             </>
//           ),
//         },
//       ];

//       // Always show View Products action
//       if (
//         ![
//           STATUS_MAP.brand.pending.value,
//           STATUS_MAP.brand.rejected.value,
//         ].includes(row.original.status)
//       ) {
//         items.push({
//           type: "link",
//           to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCTS(
//             companyId,
//             locationId,
//             row.original._id,
//           ),
//           title: "View products for this brand",
//           children: (
//             <>
//               <ShoppingBagIcon className="size-4" /> View Products
//             </>
//           ),
//         });
//       }

//       // Always show Edit action (redirects to onboarding for non-pending statuses)
//       items.push({
//         type: "link",
//         to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(
//           companyId,
//           locationId,
//           row.original._id,
//         ),
//         title: "Edit brand",
//         children: (
//           <>
//             <PencilIcon className="size-4" /> Edit
//           </>
//         ),
//       });

//       return (
//         <DropdownMenu items={items}>
//           <Button variant="outlined" size="icon">
//             <EllipsisVerticalIcon className="size-4" />
//           </Button>
//         </DropdownMenu>
//       );
//     },
//   },
// ];
// //   cell: ({ row }) => {
// //       return (
// //         <TableAction
// //           view={{
// //             onClick: () => console.log("View brand:", row.original._id),
// //             to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_VIEW(
// //               companyId,
// //               locationId,
// //               row.original._id,
// //             ),
// //             title: "View brand details",
// //           }}
// //           edit={{
// //             loading: false,
// //             onClick: () => console.log("Edit brand:", row.original._id),
// //             to: PANEL_ROUTES.COMPANY_LOCATION.BRAND_EDIT(
// //               companyId,
// //               locationId,
// //               row.original._id,
// //             ),
// //             title: "Edit brand",
// //           }}
// //         />
// //       );
// //     },
