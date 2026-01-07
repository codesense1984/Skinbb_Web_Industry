import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/core/components/ui/structure";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { apiGetProductAttributeById } from "@/modules/panel/services/http/product-attribute.service";

export default function ViewProductAttribute() {
  const { id } = useParams<{ id: string }>();

  const { data: attribute, isLoading } = useQuery({
    queryKey: ["product-attribute", id],
    queryFn: () => apiGetProductAttributeById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Product Attribute Details",
          description: "View product attribute information",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </PageContent>
    );
  }

  if (!attribute?.data) {
    return (
      <PageContent
        header={{
          title: "Product Attribute Details",
          description: "View product attribute information",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Attribute not found
            </h3>
            <p className="text-gray-500">
              The product attribute you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </PageContent>
    );
  }

  const attr = attribute.data;

  return (
    <PageContent
      header={{
        title: "Product Attribute Details",
        description: "View product attribute information",
      }}
    >
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Attribute Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-lg font-medium">{attr.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Slug
                </label>
                <p className="rounded bg-gray-100 px-2 py-1 font-mono text-lg">
                  {attr.slug}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
