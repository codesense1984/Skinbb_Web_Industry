import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { DataTable } from "@/core/components/data-table";
import { columns } from "./data";
import { fetcher } from "./fetcher";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function ProductTagList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  console.log("ProductTagList rendering with isServerSide: true");

  return (
    <PageContent
      header={{
        title: "Product Tags",
        description: "Manage product tags for categorization and filtering",
        actions: (
          <Button
            onClick={() => navigate(PANEL_ROUTES.MASTER.PRODUCT_TAG_CREATE)}
            variant="contained"
            color="secondary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <DataTable
          columns={columns()}
          isServerSide={true}
          fetcher={fetcher()}
          queryKeyPrefix={`${PANEL_ROUTES.MASTER.PRODUCT_TAG}-v5`}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showPagination={true}
          pageSize={10}
        />
      </div>
    </PageContent>
  );
}
