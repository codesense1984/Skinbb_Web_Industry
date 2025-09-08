import { TableAction } from "@/core/components/data-table/components/table-action";
import {
  AvatarRoot,
  AvatarFallback,
  AvatarImage,
  Avatar,
} from "@/core/components/ui/avatar";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type {
  CompanyList,
  CompanyListItem,
} from "@/modules/panel/types/company.type";
import type { ColumnDef } from "@tanstack/react-table";

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

export const columns: ColumnDef<CompanyListItem>[] = [
  {
    header: "Company Name",
    accessorKey: "companyName",
    cell: ({ row }) => (
      <div className="flex w-max items-center gap-3 font-medium">
        {row.original.brandLogo && (
          <Avatar
            src={row.original.brandLogo}
            feedback={row.original.companyName.charAt(0)}
          />
        )}
        <span>{row.original.companyName}</span>
      </div>
    ),
  },

  {
    header: "Category",
    accessorKey: "category",
    cell: ({ row }) => (
      <div className="w-max">{row.original.companyCategory}</div>
    ),
  },
  {
    header: "Phone",
    accessorKey: "landlineNo",
    cell: ({ row }) => <div className="w-max">{row.original.landlineNo}</div>,
  },
  {
    header: "Business Type",
    accessorKey: "businessType",
    cell: ({ row }) => <div className="w-max">{row.original.businessType}</div>,
  },
  {
    header: "Website",
    accessorKey: "website",
    cell: ({ row }) => (
      <a
        href={row.original.website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        {row.original.website}
      </a>
    ),
  },
  {
    header: "Location",
    accessorKey: "address",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-2">
        {row.original?.address.map((address) => (
          <Badge variant={"outline"}>{address.city}</Badge>
        ))}
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.status}
        module="company"
        variant="badge"
      >
        {row.original.status}
      </StatusBadge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    header: "Created Date",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return <div className="w-max">{formatDate(createdAt)}</div>;
    },
  },
  {
    header: "Action",
    accessorKey: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <TableAction
          view={{
            // onClick: () => console.log("View company:", row.original._id),
            to: PANEL_ROUTES.COMPANY.VIEW(row.original._id),
            tooltip: "View company details",
          }}
          edit={{
            // onClick: () => console.log("Edit company:", row.original._id),
            to: PANEL_ROUTES.COMPANY.EDIT(row.original._id),
            tooltip: "Edit company",
          }}
          // delete={{
          //   onClick: () => console.log("Delete company:", row.original._id),
          //   tooltip: "Delete company",
          // }}
        />
      );
    },
  },
];
