import { Link } from 'react-router';
import { PANEL_ROUTES } from '@/modules/panel/routes/constant';

const TestProductRoutes = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Routes Test</h1>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Product Routes</h2>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Product List</h3>
            <p className="text-sm text-gray-600 mb-2">Route: {PANEL_ROUTES.PRODUCT.LIST}</p>
            <Link
              to={PANEL_ROUTES.PRODUCT.LIST}
              className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Go to Product List
            </Link>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Create Product</h3>
            <p className="text-sm text-gray-600 mb-2">Route: {PANEL_ROUTES.PRODUCT.CREATE}</p>
            <Link
              to={PANEL_ROUTES.PRODUCT.CREATE}
              className="inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
            >
              Go to Create Product
            </Link>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Edit Product</h3>
            <p className="text-sm text-gray-600 mb-2">Route: {PANEL_ROUTES.PRODUCT.EDIT('1')}</p>
            <Link
              to={PANEL_ROUTES.PRODUCT.EDIT('1')}
              className="inline-block px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700"
            >
              Go to Edit Product (ID: 1)
            </Link>
          </div>

          <div className="border-b pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">View Product</h3>
            <p className="text-sm text-gray-600 mb-2">Route: {PANEL_ROUTES.PRODUCT.VIEW('1')}</p>
            <Link
              to={PANEL_ROUTES.PRODUCT.VIEW('1')}
              className="inline-block px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
            >
              Go to View Product (ID: 1)
            </Link>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-md font-medium text-gray-700 mb-2">Route Constants</h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{JSON.stringify({
  PRODUCT_LIST: PANEL_ROUTES.PRODUCT.LIST,
  PRODUCT_CREATE: PANEL_ROUTES.PRODUCT.CREATE,
  PRODUCT_EDIT: PANEL_ROUTES.PRODUCT.EDIT(':id'),
  PRODUCT_VIEW: PANEL_ROUTES.PRODUCT.VIEW(':id'),
}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestProductRoutes;

