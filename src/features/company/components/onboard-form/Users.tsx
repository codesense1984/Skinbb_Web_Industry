import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import type { CompanyBrand } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";

const Users = () => {
  const columns: ColumnDef<CompanyBrand>[] = useMemo(
    () => [
      {
        accessorKey: "brandName",
        header: "Name",
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
              <Button variant={"outlined"}>Add User</Button>
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

export default Users;
