import { DataTableToogle } from "@/core/components/data-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import { formatCurrency, formatNumber } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { Brand } from "@/modules/panel/types/brand.type";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";
import { BrandCard } from "./BrandCard";

const statsData = [
  {
    title: "Listed brands",
    value: 380,
    barColor: "bg-primary",
    icon: true,
  },
  {
    title: "Inactive Brands",
    value: 350,
    barColor: "bg-blue-300",
    icon: false,
  },
  {
    title: "Total Surveys",
    value: 550,
    barColor: "bg-violet-300",
    icon: false,
  },
  {
    title: "Total Products",
    value: 860,
    barColor: "bg-red-300",
    icon: true,
  },
];

export const brandData: Brand[] = [
  {
    id: 1,
    name: "The Derma",
    category: "Sensitive Skin",
    image: "https://images.thedermaco.com/TheDermaCoLogo2-min.png",
    status: "active",
    products: 50,
    surveys: 50,
    promotions: 50,
    earnings: 125500,
  },
  {
    id: 2,
    name: "Glow Essentials",
    category: "Oily Skin",
    image:
      "https://glow-essentials.com/cdn/shop/files/1_8d8dcce1-c8f8-4b82-a871-9144ca10035b_360x.png",
    status: "inactive",
    products: 32,
    surveys: 25,
    promotions: 12,
    earnings: 64040,
  },
  {
    id: 3,
    name: "AcneFix Labs",
    category: "Acne Treatment",
    image:
      "https://www.acnefix.com/cdn/shop/files/ACNEFIX_logo_black_web_ready.png?height=168&v=1681153016",
    status: "active",
    products: 35,
    surveys: 42,
    promotions: 20,
    earnings: 94002,
  },
  {
    id: 4,
    name: "SkinScience Pro",
    category: "Medical Skincare",
    image:
      "https://skinscience.md/wp-content/uploads/2022/07/ss-logo-2022-retina.png",
    status: "inactive",
    products: 40,
    surveys: 38,
    promotions: 15,
    earnings: 87000,
  },
  {
    id: 5,
    name: "EpiGlow",
    category: "Pigmentation Care",
    image:
      "https://images.apollo247.in/images/pharmacy_logo.svg?tr=q-80,w-100,dpr-2,c-at_max",
    status: "active",
    products: 28,
    surveys: 30,
    promotions: 18,
    earnings: 65000,
  },
  {
    id: 6,
    name: "RejuvaDerm",
    category: "Anti-Aging",
    image:
      "https://www.rejuvaderm.ca/wp-content/uploads/2024/04/logonew@1x.png",
    status: "active",
    products: 60,
    surveys: 55,
    promotions: 40,
    earnings: 160000,
  },
  {
    id: 7,
    name: "RejuvaDerm1",
    category: "Anti-Aging",
    image:
      "https://www.rejuvaderm.ca/wp-content/uploads/2024/04/logonew@1x.png",
    status: "active",
    products: 60,
    surveys: 55,
    promotions: 40,
    earnings: 160000,
  },
  {
    id: 8,
    name: "RejuvaDerm2",
    category: "Anti-Aging",
    image:
      "https://www.rejuvaderm.ca/wp-content/uploads/2024/04/logonew@1x.png",
    status: "active",
    products: 60,
    surveys: 55,
    promotions: 40,
    earnings: 160000,
  },
];

const columns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row, getValue }) => (
      <ul className="flex min-w-40 items-center gap-2">
        <Avatar className="size-10 rounded-md border">
          <AvatarImage
            className="object-contain"
            src={row.original.image}
            alt={`${row.original.name} logo`}
          />
          <AvatarFallback className="rounded-md capitalize">
            {(getValue() as string)?.charAt(1)}
          </AvatarFallback>
        </Avatar>
        <span> {getValue() as string}</span>
      </ul>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <StatusBadge module="brand" status={row.original.status} />;
    },
  },
  {
    accessorKey: "products",
    header: "Products",
    meta: {
      type: "number",
    },
  },
  {
    accessorKey: "surveys",
    header: "Surveys",
  },
  {
    accessorKey: "promotions",
    header: "Promotions",
  },
  {
    accessorKey: "earnings",
    header: "Earnings",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("earnings"));
      return formatCurrency(amount, { useAbbreviation: false });
    },
  },
  {
    header: "Action",
    id: "actions",
    enableHiding: false,
    cell: () => {
      return (
        <Button variant="ghost" size="icon" className="">
          <span className="sr-only">Open Brand Details</span>
          <EyeIcon />
        </Button>
      );
    },
  },
];
const BrandList = () => {
  return (
    <PageContent
      header={{
        title: "Brands",
        description: "Discover top brands from around the world.",
        actions: (
          <Button color={"primary"} asChild>
            <NavLink to={PANEL_ROUTES.BRAND.CREATE}>Add Brand</NavLink>
          </Button>
        ),
      }}
    >
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
        {statsData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={formatNumber(item.value)}
            barColor={item.barColor}
          />
        ))}
      </section>

      <DataTableToogle
        rows={brandData}
        columns={columns}
        gridProps={{
          renderGridItem: (row) => <BrandCard key={row.id} brand={row} />,
        }}
      />
    </PageContent>
  );
};

export default BrandList;
