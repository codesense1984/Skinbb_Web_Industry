import { Avatar } from "@/core/components/ui/avatar";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { capitalize, formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type {
  CompanyList,
  CompanyListItem,
} from "@/modules/panel/types/company.type";
import { MapPinIcon, UserIcon } from "@heroicons/react/24/solid";
import type { ColumnDef } from "@tanstack/react-table";
import {
  convertApiResponseToCompanyList,
  sampleApiResponse,
} from "./sample-api-data";
import { DropdownMenu } from "@/core/components/ui/dropdown-menu";
import { Button } from "@/core/components/ui/button";
import { EllipsisVerticalIcon, EyeIcon } from "@heroicons/react/24/outline";

export const statsData = [
  {
    title: "Total Company",
    value: 380,
    barColor: "bg-primary",
    icon: true,
  },
  {
    title: "Active Company",
    value: 350,
    barColor: "bg-blue-300",
    icon: false,
  },
  {
    title: "InActive/Paused Company",
    value: 30,
    barColor: "bg-violet-300",
    icon: false,
  },
  {
    title: "Total Brands",
    value: 860,
    barColor: "bg-red-300",
    icon: true,
  },
];

// Legacy company data for backward compatibility
export const companyData: CompanyList[] = [
  {
    id: "1",
    companyName: "The Derma",
    category: "Sensitive Skin",
    logo: "https://images.thedermaco.com/TheDermaCoLogo2-min.png",
    status: "active",
    products: 50,
    surveys: 50,
    promotions: 50,
    earnings: 125500,
  },
  {
    id: "2",
    companyName: "Glow Essentials",
    category: "Oily Skin",
    logo: "https://glow-essentials.com/cdn/shop/files/1_8d8dcce1-c8f8-4b82-a871-9144ca10035b_360x.png",
    status: "inactive",
    products: 32,
    surveys: 25,
    promotions: 12,
    earnings: 64040,
  },
  {
    id: "3",
    companyName: "AcneFix Labs",
    category: "Acne Treatment",
    logo: "https://www.acnefix.com/cdn/shop/files/ACNEFIX_logo_black_web_ready.png?height=168&v=1681153016",
    status: "active",
    products: 35,
    surveys: 42,
    promotions: 20,
    earnings: 94002,
  },
  {
    id: "4",
    companyName: "SkinScience Pro",
    category: "Medical Skincare",
    logo: "https://skinscience.md/wp-content/uploads/2022/07/ss-logo-2022-retina.png",
    status: "inactive",
    products: 40,
    surveys: 38,
    promotions: 15,
    earnings: 87000,
  },
  {
    id: "5",
    companyName: "EpiGlow",
    category: "Pigmentation Care",
    logo: "https://images.apollo247.in/images/pharmacy_logo.svg?tr=q-80,w-100,dpr-2,c-at_max",
    status: "active",
    products: 28,
    surveys: 30,
    promotions: 18,
    earnings: 65000,
  },
  {
    id: "6",
    companyName: "RejuvaDerm",
    category: "Anti-Aging",
    logo: "https://www.rejuvaderm.ca/wp-content/uploads/2024/04/logonew@1x.png",
    status: "active",
    products: 60,
    surveys: 55,
    promotions: 40,
    earnings: 160000,
  },
  {
    id: "7",
    companyName: "RejuvaDerm1",
    category: "Anti-Aging",
    logo: "https://www.rejuvaderm.ca/wp-content/uploads/2024/04/logonew@1x.png",
    status: "active",
    products: 60,
    surveys: 55,
    promotions: 40,
    earnings: 160000,
  },
  {
    id: "8",
    companyName: "RejuvaDerm2",
    category: "Anti-Aging",
    logo: "https://www.rejuvaderm.ca/wp-content/uploads/2024/04/logonew@1x.png",
    status: "active",
    products: 60,
    surveys: 55,
    promotions: 40,
    earnings: 160000,
  },
];

// New API-based company data
export const apiCompanyData: CompanyListItem[] =
  convertApiResponseToCompanyList(sampleApiResponse);

export const columns: ColumnDef<CompanyListItem>[] = [
  {
    header: "Company Name",
    accessorKey: "companyName",
    size: 250,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 font-medium">
        {
          <Avatar
            src={row.original?.logo ?? undefined}
            feedback={row.original.companyName.charAt(0)}
          />
        }
        <span className="break-all">
          {capitalize(row.original.companyName)}
        </span>
      </div>
    ),
  },
  {
    header: "Business Type",
    accessorKey: "businessType",
    size: 120,
    cell: ({ row }) => (
      <span className="break-all">{row.original.businessType}</span>
    ),
  },
  {
    header: "Location",
    accessorKey: "address",
    size: 130,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-2">
        {row.original?.address.slice(0, 1).map((address, index) => (
          <Badge key={index} className="whitespace-normal" variant={"outline"}>
            {address.city}
          </Badge>
        ))}
        {row.original?.address.length > 1 && (
          <Badge variant={"outline"}>+{row.original?.address.length - 1}</Badge>
        )}
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "companyStatus",
    size: 200,
    cell: ({ row }) => (
      <div className="space-y-1">
        <StatusBadge
          status={row.original.companyStatus}
          module="company"
          variant="badge"
        >
          {row.original.companyStatus}
        </StatusBadge>
        {row.original.companyStatus === "rejected" && row.original.statusChangeReason && (
          <div className="text-xs text-red-600 max-w-[180px] truncate" title={row.original.statusChangeReason}>
            Reason: {row.original.statusChangeReason}
          </div>
        )}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    header: "Created Date",
    accessorKey: "createdAt",
    size: 120,
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return <div className="w-max">{formatDate(createdAt)}</div>;
    },
  },
  {
    header: "Actions",
    accessorKey: "actions",
    size: 70,
    cell: ({ row }) => {
      return (
        <DropdownMenu
          items={[
            {
              type: "link",
              to: PANEL_ROUTES.COMPANY.VIEW(row.original._id),
              children: (
                <>
                  <EyeIcon className="size-4" /> View
                </>
              ),
            },
            {
              type: "link",
              to: PANEL_ROUTES.COMPANY.USERS(row.original._id),
              children: (
                <>
                  <UserIcon className="size-4" /> Users
                </>
              ),
            },
            {
              type: "link",
              to: PANEL_ROUTES.COMPANY_LOCATION.LIST(row.original._id),
              children: (
                <>
                  <MapPinIcon className="size-4" />
                  Locations
                </>
              ),
            },
          ]}
        >
          <Button variant="outlined" size="icon">
            <EllipsisVerticalIcon className="size-4" />
          </Button>
        </DropdownMenu>
      );
    },
  },
  // {
  //   header: "Action",
  //   accessorKey: "actions",
  //   enableSorting: false,
  //   enableHiding: false,
  //   size: 250,
  //   cell: ({ row }) => {
  //     return (
  //       <TableAction
  //         view={{
  //           // onClick: () => console.log("View company:", row.original._id),
  //           to: PANEL_ROUTES.COMPANY.VIEW(row.original._id),
  //           title: "View company details",
  //         }}
  //         // edit={{
  //         //   loading: false,
  //         //   // onClick: () => console.log("Edit company:", row.original._id),
  //         //   to: PANEL_ROUTES.COMPANY.EDIT(row.original._id),
  //         //   title: "Edit company",
  //         // }}
  //         // delete={{
  //         //   onClick: () => console.log("Delete company:", row.original._id),
  //         //   tooltip: "Delete company",
  //         // }}
  //       >
  //         {renderActionButton(
  //           {
  //             className: "w-auto px-2 text-muted-foreground",
  //             size: "md",
  //             variant: "outlined",
  //             to: `/company/${row.original._id}/users`,
  //             children: "Users",
  //             title: "View Users",
  //           },
  //           <UserIcon className="size-4" />,
  //         )}
  //         {renderActionButton(
  //           {
  //             className: "w-auto px-2 text-muted-foreground",
  //             size: "md",
  //             variant: "outlined",
  //             to: PANEL_ROUTES.COMPANY_LOCATION.LIST(row.original._id),
  //             children: "Locations",
  //             title: "Locations",
  //           },
  //           <MapPinIcon className="size-4" />,
  //         )}
  //       </TableAction>
  //     );
  //   },
  // },
];
