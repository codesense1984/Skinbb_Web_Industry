import { Link } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const TestProductRoutes = () => {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Product Routes Test
      </h1>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Available Product Routes
        </h2>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-md mb-2 font-medium text-gray-700">
              Product List
            </h3>
            <p className="mb-2 text-sm text-gray-600">
              Route: {PANEL_ROUTES.PRODUCT.LIST}
            </p>
            <Link
              to={PANEL_ROUTES.PRODUCT.LIST}
              className="inline-block rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Product List
            </Link>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-md mb-2 font-medium text-gray-700">
              Create Product
            </h3>
            <p className="mb-2 text-sm text-gray-600">
              Route: {PANEL_ROUTES.PRODUCT.CREATE}
            </p>
            <Link
              to={PANEL_ROUTES.PRODUCT.CREATE}
              className="inline-block rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Go to Create Product
            </Link>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-md mb-2 font-medium text-gray-700">
              Edit Product
            </h3>
            <p className="mb-2 text-sm text-gray-600">
              Route: {PANEL_ROUTES.PRODUCT.EDIT("1")}
            </p>
            <Link
              to={PANEL_ROUTES.PRODUCT.EDIT("1")}
              className="inline-block rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Go to Edit Product (ID: 1)
            </Link>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-md mb-2 font-medium text-gray-700">
              View Product
            </h3>
            <p className="mb-2 text-sm text-gray-600">
              Route: {PANEL_ROUTES.PRODUCT.VIEW("1")}
            </p>
            <Link
              to={PANEL_ROUTES.PRODUCT.VIEW("1")}
              className="inline-block rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Go to View Product (ID: 1)
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-gray-50 p-4">
          <h3 className="text-md mb-2 font-medium text-gray-700">
            Route Constants
          </h3>
          <pre className="overflow-x-auto text-xs text-gray-600">
            {JSON.stringify(
              {
                PRODUCT_LIST: PANEL_ROUTES.PRODUCT.LIST,
                PRODUCT_CREATE: PANEL_ROUTES.PRODUCT.CREATE,
                PRODUCT_EDIT: PANEL_ROUTES.PRODUCT.EDIT(":id"),
                PRODUCT_VIEW: PANEL_ROUTES.PRODUCT.VIEW(":id"),
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestProductRoutes;
