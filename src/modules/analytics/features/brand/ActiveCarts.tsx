import { Button } from "@/core/components/ui/button";
import { DataTable } from "@/core/components/data-table";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";

interface Carts {
  product: string;
  timesInCart: number;
  conversionRate: string;
  abandonmentRate: string;
  price: string;
  productImage: string;
}

const rows: Carts[] = [
  {
    productImage:
      "https://m.media-amazon.com/images/I/315TQ2C7ooL._SX300_SY300_QL70_FMwebp_.jpg",
    product: "Demelan Cream",
    timesInCart: 320,
    conversionRate: "38.1%",
    abandonmentRate: "61.9%",
    price: "₹299",
  },
  {
    productImage:
      "https://images.apollo247.in/pub/media/catalog/product/S/A/SAS0001_1-AUG23_1.jpg?tr=w-264,q-80,f-webp,dpr-1.5,c-at_max",
    product: "Saslic DS Face Wash",
    timesInCart: 190,
    conversionRate: "34.7%",
    abandonmentRate: "65.3%",
    price: "₹399",
  },
  {
    productImage:
      "https://i5.walmartimages.com/seo/Cetaphil-Moisturizing-Lotion-for-Normal-to-Dry-Skin-Hydrating-Fragrance-Free-8-fl-oz_7ca67493-c70e-4ea7-9012-8b20f3187056.51b296bb605657253438f6de8f53d02c.jpeg",
    product: "Cetaphil Moisturizer",
    timesInCart: 140,
    conversionRate: "21.5%",
    abandonmentRate: "78.5%",
    price: "₹259",
  },
  {
    productImage:
      "https://imgs.search.brave.com/DZXX5aPvKyv5Oo5VkHRGsAoxjnxdnsiz3M68lPqxeDk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pNS53/YWxtYXJ0aW1hZ2Vz/LmNvbS9zZW8vS29q/aWdsby1Hb2xkLVNr/aW4tQ3JlYW0tMjBH/XzE1YzkzMjJkLWFj/NjgtNDJkNy05ZGZj/LTVmNTk2OGI5YmMz/Yy4xN2MzMGYwZGJm/NzFkMzliZTA1NGYw/MGU4MjcyMzBiOS5q/cGVnP29kbkhlaWdo/dD02NDAmb2RuV2lk/dGg9NjQwJm9kbkJn/PUZGRkZGRg",
    product: "Kojiglo Gold Cream",
    timesInCart: 95,
    conversionRate: "42.3%",
    abandonmentRate: "57.7%",
    price: "₹499",
  },
  {
    productImage:
      "https://imgs.search.brave.com/IRdg_mM0nJXtb1FZWXaFEa9jw6XO3RDJkIgEHkWnjMk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rYXJp/c3Nha2FydC5jb20v/Y2RuL3Nob3AvZmls/ZXMvQWhhZ2xvdy1G/YWNlLVdhc2hfLTUw/Zy5qcGc_dj0xNzM4/MzAzNjU0JndpZHRo/PTQ2NQ",
    product: "Ahaglow Face Wash G",
    timesInCart: 88,
    conversionRate: "19.6%",
    abandonmentRate: "80.4%",
    price: "₹559",
  },
];

const columns: ColumnDef<Carts>[] = [
  {
    accessorKey: "product",
    header: "Name",
    cell: ({ row, getValue }) => (
      <div className="flex items-center gap-2">
        <img
          src={row.original.productImage}
          alt={`${row.original.productImage} logo`}
          className="size-10 rounded-md border object-contain p-1"
        />
        {getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: "timesInCart",
    header: "Times In Cart",
    meta: {
      type: "number",
    },
  },
  {
    accessorKey: "conversionRate",
    header: "Conv Rate",
  },
  {
    accessorKey: "abandonmentRate",
    header: "Aban Rate",
  },
  {
    accessorKey: "price",
    header: "Price",
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

const ActiveCarts = () => {
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

export default ActiveCarts;
