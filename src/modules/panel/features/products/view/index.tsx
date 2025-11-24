import { useParams, Link } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const ProductView = () => {
  const { id } = useParams<{ id: string }>();

  // Mock product data - replace with actual API call
  const product = {
    id: id || "1",
    name: "Sample Product",
    slug: "sample-product",
    description: "This is a sample product description.",
    status: "published",
    price: 29.99,
    salePrice: 24.99,
    quantity: 100,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-16",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">Product Details</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to={PANEL_ROUTES.PRODUCT.EDIT(product.id)}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Edit Product
            </Link>
            <Link
              to={PANEL_ROUTES.PRODUCT.LIST}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Product Information
            </h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Product Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.slug}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.description}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Pricing & Inventory
            </h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900">${product.price}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Sale Price
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${product.salePrice}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.quantity}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Status</h2>
            <div className="flex items-center">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  product.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {product.status}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Timestamps
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.createdAt}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.updatedAt}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Actions
            </h2>
            <div className="space-y-3">
              <Link
                to={PANEL_ROUTES.PRODUCT.EDIT(product.id)}
                className="block w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                Edit Product
              </Link>
              <button
                type="button"
                className="block w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-700 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
