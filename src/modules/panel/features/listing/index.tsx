import { DataTableToogle } from "@/core/components/data-table";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import type { Product } from "@/modules/panel/types/product.type";
import { formatNumber } from "@/core/utils";
import { useCallback, useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { columns, initialStatsData } from "./data";
import { apiGetProducts } from "@/modules/panel/services/http/product.service";
import type { ProductListParams } from "@/modules/panel/types/product.type";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(initialStatsData);

  const fetchProducts = useCallback(async (params?: ProductListParams) => {
    try {
      setLoading(true);
      const response = await apiGetProducts(params);
      
      if (response.success) {
        setProducts(response.data.products);
        
        // Update stats with real data
        const publishedProducts = response.data.products.filter(p => p.status === 'publish').length;
        const draftProducts = response.data.products.filter(p => p.status === 'draft').length;
        const totalVariants = response.data.products.reduce((sum, product) => sum + (product.variants?.length || 0), 0);
        
        setStats([
          {
            title: "Total Products",
            value: response.data.totalRecords,
            barColor: "bg-primary",
            icon: true,
          },
          {
            title: "Published Products",
            value: publishedProducts,
            barColor: "bg-blue-300",
            icon: false,
          },
          {
            title: "Draft Products",
            value: draftProducts,
            barColor: "bg-violet-300",
            icon: false,
          },
          {
            title: "Total Variants",
            value: totalVariants,
            barColor: "bg-red-300",
            icon: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts({ page: 1, limit: 10 });
  }, [fetchProducts]);

  const renderGridItem = useCallback(
    (row: Product) => (
      <ProductCard
        key={row._id}
        product={row}
        aria-label={`View ${row.productName} card`}
      />
    ),
    [],
  );

  return (
    <PageContent
      header={{
        title: "Product Listing",
        description: "Manage your product catalog, pricing, descriptions and media assets.",
        actions: (
          <Button color={"primary"}>
            Add Product
          </Button>
        ),
      }}
    >
      <section
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4"
        aria-label="Product Statistics"
      >
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={formatNumber(item.value)}
            barColor={item.barColor}
          />
        ))}
      </section>

      <DataTableToogle
        rows={products}
        columns={columns}
        gridProps={{
          renderGridItem,
        }}
        bodyProps={{
          isLoading: loading,
        }}
      />
    </PageContent>
  );
};

export default ProductList;
