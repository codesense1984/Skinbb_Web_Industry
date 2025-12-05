import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { DataTable } from "@/core/components/data-table";
import { columns } from "../data";
import { fetcher } from "../fetcher";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/core/components/ui/badge";

export default function ProductCategoryList() {
  const navigate = useNavigate();
  const [parentCategoryFilters, setParentCategoryFilters] = useState<
    Array<{ id: string; name: string }>
  >([]);

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

  const handleDeleteCategory = (id: string) => {
    // TODO: Implement delete functionality
    console.log("Delete category:", id);
  };

  const handleShowChild = (id: string, name: string) => {
    // Add to parent category filters, but prevent duplicates
    setParentCategoryFilters((prev) => {
      const exists = prev.some((filter) => filter.id === id);
      if (exists) {
        return prev; // Don't add if already exists
      }
      return [...prev, { id, name }];
    });
  };

  const handleRemoveParentFilter = (id: string) => {
    setParentCategoryFilters((prev) =>
      prev.filter((filter) => filter.id !== id),
    );
  };

  const handleClearAllFilters = () => {
    setParentCategoryFilters([]);
  };

  // Track parent category filters for debugging
  useEffect(() => {
    const currentParentId =
      parentCategoryFilters.length > 0
        ? parentCategoryFilters[parentCategoryFilters.length - 1].id
        : undefined;
    // Debug: Log current parent ID for API call
    if (import.meta.env.DEV) {
      console.log("Parent category filters changed:", parentCategoryFilters);
      console.log("Current parent ID for API call:", currentParentId);
    }
  }, [parentCategoryFilters]);

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
      <div className="w-full space-y-4">
        {/* Parent Category Filters */}
        {parentCategoryFilters.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Parent Category:
            </span>
            {parentCategoryFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="outline"
                className="flex items-center space-x-1"
              >
                <span>{filter.name}</span>
                <button
                  onClick={() => handleRemoveParentFilter(filter.id)}
                  className="ml-1 hover:text-red-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              onClick={handleClearAllFilters}
              variant="outlined"
              size="sm"
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        )}

        <DataTable
          key={`product-categories-${parentCategoryFilters.length > 0 ? parentCategoryFilters[parentCategoryFilters.length - 1].id : "root"}`}
          columns={columns()}
          isServerSide
          fetcher={fetcher(
            parentCategoryFilters.length > 0
              ? parentCategoryFilters[parentCategoryFilters.length - 1].id
              : undefined,
          )}
          queryKeyPrefix={`${PANEL_ROUTES.MASTER.PRODUCT_CATEGORY}${parentCategoryFilters.length > 0 ? `-${parentCategoryFilters[parentCategoryFilters.length - 1].id}` : ""}`}
          meta={{
            onView: handleViewCategory,
            onEdit: handleEditCategory,
            onDelete: handleDeleteCategory,
            onShowChild: handleShowChild,
          }}
        />
      </div>
    </PageContent>
  );
}
