import { DataTable } from "@/components/table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CompanyBrand } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

const BrandList = ({ onAdd }: { onAdd: () => void }) => {
  const columns: ColumnDef<CompanyBrand>[] = useMemo(
    () => [
      {
        accessorKey: "brandName",
        header: "Name",
        cell: ({ row, getValue }) => (
          <ul className="flex min-w-40 items-center gap-2">
            <Avatar className="size-10 rounded-md border">
              <AvatarImage
                className="object-contain"
                src={row.original.logo}
                alt={`${row.original.brandName} logo`}
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
    ],
    [],
  );
  return (
    <div>
      <DataTable
        rows={[]}
        columns={columns}
        tableHeading="Brands"
        actionProps={{
          showColumnsFilter: false,
          children: (
            <div className="order-1">
              <Button variant={"outlined"} onClick={onAdd}>
                Add Brand
              </Button>
            </div>
          ),
        }}
        bodyProps={{
          containerProps: {
            className: "border rounded-md",
          },
        }}
        showPagination={false}
      />
    </div>
  );
};

export default BrandList;
