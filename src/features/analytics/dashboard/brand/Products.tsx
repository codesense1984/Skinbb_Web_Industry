import { Button } from "@/core/components/ui/button";
import { DataTable } from "@/core/components/table/data-table";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";

interface Product {
  product: string;
  mrp: string; // Can be converted to number if ₹ is stripped
  orders: number;
  unitsSold: number;
  gmv: string; // Can be converted to number if ₹ is stripped
  momGrowth: string; // e.g., "+12.5%" — can be normalized
  ftb: number;
  ftbValue: string; // ₹ format
  ftbPercent: string; // e.g., "61%"
  rb: number;
  rbValue: string;
  rbPercent: string;
  rto: number;
  rtoValue: string;
  rtoPercent: string;
  nnrv: string;
  tax: string;
  nrv: string;
}

const rows: Product[] = [
  {
    product: "Demelan Cream",
    mrp: "₹100",
    orders: 312,
    unitsSold: 480,
    gmv: "₹1.43L",
    momGrowth: "+12.5%",
    ftb: 190,
    ftbValue: "₹19k",
    ftbPercent: "61%",
    rb: 122,
    rbValue: "₹12.2k",
    rbPercent: "39%",
    rto: 15,
    rtoValue: "₹1.5K",
    rtoPercent: "5%",
    nnrv: "₹1.42L",
    tax: "₹25.47K",
    nrv: "₹1.16L",
  },
  {
    product: "Saslic DS Face Wash",
    mrp: "₹120",
    orders: 270,
    unitsSold: 310,
    gmv: "₹98.6K",
    momGrowth: "+9.8%",
    ftb: 202,
    ftbValue: "₹24.24k",
    ftbPercent: "75%",
    rb: 68,
    rbValue: "₹8.16k",
    rbPercent: "25%",
    rto: 13,
    rtoValue: "₹1.56K",
    rtoPercent: "5%",
    nnrv: "₹97.04K",
    tax: "₹17.47K",
    nrv: "₹79.57K",
  },
  {
    product: "Kojiglo Gold Cream",
    mrp: "₹150",
    orders: 208,
    unitsSold: 265,
    gmv: "₹82.5K",
    momGrowth: "–3.4%",
    ftb: 104,
    ftbValue: "₹15.6k",
    ftbPercent: "50%",
    rb: 104,
    rbValue: "₹15.6k",
    rbPercent: "50%",
    rto: 10,
    rtoValue: "₹1.5K",
    rtoPercent: "5%",
    nnrv: "₹81.0K",
    tax: "₹14.58K",
    nrv: "₹66.42K",
  },
  {
    product: "Ahaglow Face Wash",
    mrp: "₹100",
    orders: 312,
    unitsSold: 480,
    gmv: "₹1.43L",
    momGrowth: "+12.5%",
    ftb: 190,
    ftbValue: "₹19k",
    ftbPercent: "61%",
    rb: 122,
    rbValue: "₹12.2k",
    rbPercent: "39%",
    rto: 15,
    rtoValue: "₹1.5K",
    rtoPercent: "5%",
    nnrv: "₹1.42L",
    tax: "₹25.47K",
    nrv: "₹1.16L",
  },
  {
    product: "Cetaphil Moisturizer",
    mrp: "₹100",
    orders: 312,
    unitsSold: 480,
    gmv: "₹1.43L",
    momGrowth: "+12.5%",
    ftb: 190,
    ftbValue: "₹19k",
    ftbPercent: "61%",
    rb: 122,
    rbValue: "₹12.2k",
    rbPercent: "39%",
    rto: 15,
    rtoValue: "₹1.5K",
    rtoPercent: "5%",
    nnrv: "₹1.42L",
    tax: "₹25.47K",
    nrv: "₹1.16L",
  },
  // {
  //   product: "Total",
  //   orders: 1414,
  //   unitsSold: 2015,
  //   gmv: "₹6.1L",
  //   momGrowth: "+12.5%",
  //   ftb: 876,
  //   ftbValue: "₹96.84K",
  //   ftbPercent: "62%",
  //   rb: 538,
  //   rbValue: "₹60.36K",
  //   rbPercent: "38%",
  //   rto: 68,
  //   rtoValue: "₹7.56K",
  //   rtoPercent: "5%",
  //   nnrv: "₹6.03L",
  //   tax: "₹1.08L",
  //   nrv: "₹4.94L",
  //   mrp: "",
  // },
];
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "product",
    header: "Product Name",
  },
  {
    accessorKey: "mrp",
    header: "MRP",
    meta: {
      type: "currency",
    },
  },
  {
    accessorKey: "orders",
    header: "Orders",
    meta: {
      type: "number",
    },
  },
  {
    accessorKey: "unitsSold",
    header: "Units Sold",
    meta: {
      type: "number",
    },
  },
  {
    accessorKey: "gmv",
    header: "GMV",
    meta: {
      type: "currency",
    },
  },
  {
    accessorKey: "momGrowth",
    header: "MoM Growth",
    meta: {
      type: "percentage",
    },
  },
  {
    accessorKey: "ftb",
    header: "FTB",
    meta: {
      type: "number",
    },
  },
  {
    accessorKey: "ftbValue",
    header: "FTB Value",
    meta: {
      type: "currency",
    },
  },
  {
    accessorKey: "ftbPercent",
    header: "FTB%",
    meta: {
      type: "percentage",
    },
  },
  {
    accessorKey: "rb",
    header: "RB",
    meta: {
      type: "number",
    },
  },
  {
    accessorKey: "rbValue",
    header: "RB Value",
    meta: {
      type: "currency",
    },
  },
  {
    accessorKey: "rbPercent",
    header: "RB%",
    meta: {
      type: "percentage",
    },
  },
  {
    accessorKey: "rto",
    header: "RTO",
    meta: {
      type: "number",
    },
  },
  {
    accessorKey: "rtoValue",
    header: "RTO Value",
    meta: {
      type: "currency",
    },
  },
  {
    accessorKey: "rtoPercent",
    header: "RTO%",
    meta: {
      type: "percentage",
    },
  },
  {
    accessorKey: "nnrv",
    header: "NNRV",
    meta: {
      type: "currency",
    },
  },
  {
    accessorKey: "tax",
    header: "Tax",
    meta: {
      type: "currency",
    },
  },
  {
    accessorKey: "nrv",
    header: "NRV",
    meta: {
      type: "currency",
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

const Products = () => {
  return (
    <div>
      <DataTable
        bodyProps={{
          className: "[&_th]:bg-muted border-b",
        }}
        rows={rows}
        columns={columns}
        showAction={false}
        showPagination={true}
        paginationProps={{
          className: "px-5 py-0",
        }}
      />
    </div>
  );
};

export default Products;
