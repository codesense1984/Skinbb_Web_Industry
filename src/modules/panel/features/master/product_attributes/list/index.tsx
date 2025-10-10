import { useNavigate } from "react-router";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { DataTable } from "@/core/components/data-table";
import { columns } from "../data";
import { fetcher } from "../fetcher";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function ProductAttributeList() {
  const navigate = useNavigate();

  // Handle form actions
  const handleAddAttribute = () => {
    navigate(PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_CREATE);
  };

  const handleViewAttribute = (id: string) => {
    navigate(PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_VIEW(id));
  };

  const handleEditAttribute = (id: string) => {
    navigate(PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_EDIT(id));
  };

  const handleDeleteAttribute = (id: string) => {
    // TODO: Implement delete functionality
    console.log("Delete attribute:", id);
  };

  const handleConfigureAttribute = (id: string, name: string) => {
    navigate(PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_VALUES(id, name));
  };

  return (
    <PageContent
      header={{
        title: "Product Attributes",
        description: "Manage product attributes and their configurations",
        actions: (
          <Button
            onClick={handleAddAttribute}
            variant="contained"
            color="secondary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <DataTable
          columns={columns()}
          isServerSide
          fetcher={fetcher()}
          queryKeyPrefix={PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE}
          meta={{
            onView: handleViewAttribute,
            onEdit: handleEditAttribute,
            onDelete: handleDeleteAttribute,
            onConfigure: handleConfigureAttribute,
          }}
        />
      </div>
    </PageContent>
  );
}