import React from "react";
import { PageContent } from "@/core/components/ui/structure";

// Import the main dashboard component
import EcommerceAnalyticsDashboard from "./ecommerce-dashboard";

const AnalyticsDashboardDemo: React.FC = () => {
  return (
    <PageContent
      header={{
        title: "E-commerce Analytics Dashboard Demo",
        description:
          "Comprehensive dashboard with 47 components organized by sections",
      }}
    >
      <div className="space-y-8">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-blue-900">
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold text-gray-900">Summary/KPI</h3>
              <p className="text-gray-600">9 components</p>
              <p className="text-xs text-blue-600">Number Tiles</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold text-gray-900">Sales & Product</h3>
              <p className="text-gray-600">6 components</p>
              <p className="text-xs text-green-600">List/Graph Tiles</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold text-gray-900">
                Customer & Community
              </h3>
              <p className="text-gray-600">6 components</p>
              <p className="text-xs text-purple-600">Feed/List Tiles</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold text-gray-900">
                Marketing & Engagement
              </h3>
              <p className="text-gray-600">6 components</p>
              <p className="text-xs text-orange-600">Status/List Tiles</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold text-gray-900">
                Analytics & Insights
              </h3>
              <p className="text-gray-600">5 components</p>
              <p className="text-xs text-indigo-600">Graph Tiles</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold text-gray-900">
                System & Operations
              </h3>
              <p className="text-gray-600">5 components</p>
              <p className="text-xs text-red-600">Alert/Status Tiles</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-gray-600">7 components</p>
              <p className="text-xs text-pink-600">Action Tiles</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold text-gray-900">Total Components</h3>
              <p className="text-gray-600">47 components</p>
              <p className="text-xs text-gray-600">7 tile types</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-yellow-900">
            Tile Type Legend
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <h4 className="font-semibold text-blue-900">Number Tile</h4>
              <p className="text-blue-700">KPIs, quick stats, metrics</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <h4 className="font-semibold text-green-900">Graph Tile</h4>
              <p className="text-green-700">Trends or comparisons</p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <h4 className="font-semibold text-yellow-900">Status Tile</h4>
              <p className="text-yellow-700">On/Off, counts, alerts</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <h4 className="font-semibold text-purple-900">List Tile</h4>
              <p className="text-purple-700">Display top N items</p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3">
              <h4 className="font-semibold text-orange-900">Feed Tile</h4>
              <p className="text-orange-700">Activity or updates</p>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <h4 className="font-semibold text-red-900">Alert Tile</h4>
              <p className="text-red-700">Issues, warnings</p>
            </div>
            <div className="rounded-lg bg-pink-100 p-3">
              <h4 className="font-semibold text-pink-900">Action Tile</h4>
              <p className="text-pink-700">Trigger functions</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Implementation Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>
                Summary/KPI Components (9) - Fully implemented with mock data
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>
                Sales & Product Insights (6) - Fully implemented with mock data
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span>
                Customer & Community (6) - Placeholder components created
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span>
                Marketing & Engagement (6) - Placeholder components created
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span>
                Analytics & Insights (5) - Placeholder components created
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span>
                System & Operations (5) - Placeholder components created
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>
                Quick Actions (7) - Fully implemented with interactive buttons
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
};

export default AnalyticsDashboardDemo;
