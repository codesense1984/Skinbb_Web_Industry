import { useNavigate } from "react-router";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { DataTable } from "@/core/components/data-table";
import { columns } from "../data";
import { fetcher } from "../fetcher";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function ProductCategoryList() {
  const navigate = useNavigate();

  // Handle form actions
  const handleAddCategory = () => {
    navigate(PANEL_ROUTES.MASTER.PRODUCT_CATEGORY_CREATE);
  };

  const handleViewCategory = (id: string) => {
    navigate(PANEL_ROUTES.MASTER.PRODUCT_CATEGORY_VIEW(id));
  };

  const handleEditCategory = (id: string) => {
    navigate(PANEL_ROUTES.MASTER.PRODUCT_CATEGORY_EDIT(id));
  };

  return (
    <PageContent
      header={{
        title: "Product Categories",
        description: "Manage product categories and their hierarchy",
        actions: (
          <Button
            onClick={handleAddCategory}
            variant="contained"
            color="secondary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <DataTable
          columns={columns()}
          isServerSide
          fetcher={fetcher()}
          queryKeyPrefix={PANEL_ROUTES.MASTER.PRODUCT_CATEGORY}
          meta={{
            onView: handleViewCategory,
            onEdit: handleEditCategory,
          }}
        />
      </div>
    </PageContent>
  );
}
