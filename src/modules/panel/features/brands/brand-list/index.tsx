import React from "react";
import UnifiedBrandList from "../shared/UnifiedBrandList";
import type { BrandListConfig } from "../shared/UnifiedBrandList";

const BrandList = () => {
  const config: BrandListConfig = {
    mode: 'global',
    title: "Brands",
    description: "Discover top brands from around the world.",
    showFilters: true,
    showAddButton: true,
    addButtonText: "Add Brand",
    addButtonRoute: "/brands/create",
    disableFilterEditing: false,
  };

  return <UnifiedBrandList config={config} />;
};

export default BrandList;
