import { useNavigate, useParams } from "react-router";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { DataTable } from "@/core/components/data-table";
import { columns } from "../data";
import { fetcher } from "../fetcher";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function ProductAttributeValuesList() {
  const navigate = useNavigate();
  const { id, name } = useParams<{ id: string; name: string }>();

  console.log("ProductAttributeValuesList - id:", id, "name:", name);

  if (!id || !name) {
    return (
      <PageContent
        header={{
          title: "Attribute Values",
          description: "Manage attribute values",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Invalid attribute
            </h3>
            <p className="text-gray-500">
              The attribute ID or name is missing.
            </p>
            <p className="text-gray-500">
              ID: {id}, Name: {name}
            </p>
          </div>
        </div>
      </PageContent>
    );
  }

  // Handle form actions
  const handleAddValue = () => {
    navigate(PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_VALUE_CREATE(id, name));
  };

  const handleEditValue = (valueId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit value:", valueId);
  };

  const handleDeleteValue = (valueId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete value:", valueId);
  };

  return (
    <PageContent
      header={{
        title: `${name} Attribute`,
        description: "Manage attribute values and their configurations",
        actions: (
          <Button
            onClick={handleAddValue}
            variant="contained"
            color="secondary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add {name} value
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <DataTable
          columns={columns()}
          isServerSide
          fetcher={fetcher(id)}
          queryKeyPrefix={`${PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE}/${id}/values`}
          meta={{
            onEdit: handleEditValue,
            onDelete: handleDeleteValue,
          }}
        />
      </div>
    </PageContent>
  );
}
