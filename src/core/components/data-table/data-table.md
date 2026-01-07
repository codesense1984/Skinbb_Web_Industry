# Data Table Component Documentation

## Overview

The `DataTable` component is a comprehensive, feature-rich table solution built on top of TanStack Table (React Table v8). It provides both client-side and server-side data handling capabilities with built-in pagination, sorting, filtering, and view mode switching.

## Features

- **Dual View Modes**: Switch between table (list) and grid views
- **Client & Server Side**: Handle data locally or fetch from APIs
- **Built-in Pagination**: Configurable page sizes and navigation
- **Sorting & Filtering**: Column-based sorting and filtering
- **Global Search**: Search across all filterable columns
- **Column Visibility**: Show/hide columns dynamically
- **Responsive Design**: Mobile-friendly table layout
- **Loading States**: Skeleton loading for better UX
- **TypeScript Support**: Full type safety with generics

## Components

### 1. DataTable

The main table component for list-only view.

### 2. DataTableToogle

The main table component with toggle between list and grid views.

### 3. DataTableBody

Renders the table body with headers and rows.

### 4. DataGridView

Renders data in a grid layout.

### 5. DataPagination

Handles pagination controls and page size selection.

### 6. DataTableAction

Provides search, column filters, and view toggle controls.

## Core Types & Interfaces

### DataViewMode

```typescript
export enum DataViewMode {
  "list" = "list",
  "grid" = "grid",
}
```

### ServerTableResult

```typescript
export type ServerTableResult<TData> = {
  rows: TData[];
  total: number; // total rows across all pages
};
```

### ServerTableFetcher

```typescript
export type ServerTableFetcher<TData> = (params: {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  signal: AbortSignal;
}) => Promise<ServerTableResult<TData>>;
```

### UseTableOptions

```typescript
interface UseTableOptions<TData> {
  // Client-side options
  rows?: TData[];
  columns: ColumnDef<TData, unknown>[];
  pageSize?: number;
  filterableKeys?: (keyof TData)[];
  defaultViewMode: DataViewMode;

  // Server-side options
  isServerSide?: boolean;
  fetcher?: ServerTableFetcher<TData>;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialGlobalFilter?: string;
  storageKey?: string;
  searchDebounceMs?: number;
  queryKeyPrefix?: string;
}
```

## Usage Examples

### Basic Client-Side Table

```tsx
import { DataTable } from "@/core/components/table/data-table";

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];

const data = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" },
];

function MyTable() {
  return (
    <DataTable
      columns={columns}
      rows={data}
      tableHeading="Users"
      showPagination={true}
      showAction={true}
    />
  );
}
```

### Server-Side Table with Custom Fetcher

```tsx
import {
  DataTable,
  createSimpleFetcher,
} from "@/core/components/table/data-table";

const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
];

// Create a fetcher for your API
const fetcher = createSimpleFetcher(apiGetPosts, {
  dataPath: "data.posts",
  totalPath: "data.total",
});

function PostsTable() {
  return (
    <DataTable
      columns={columns}
      isServerSide={true}
      fetcher={fetcher}
      queryKeyPrefix="posts-table"
      tableHeading="Posts"
      pageSize={10}
    />
  );
}
```

### Table with Grid/List Toggle

```tsx
import { DataTableToogle } from "@/core/components/table/data-table";

function ProductsTable() {
  const renderGridItem = (product) => (
    <div key={product.id} className="product-card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span>${product.price}</span>
    </div>
  );

  return (
    <DataTableToogle
      columns={columns}
      rows={products}
      gridProps={{
        renderGridItem,
        emptyMessage: "No products found",
      }}
      tableHeading="Products"
    />
  );
}
```

### Custom Table with Manual Configuration

```tsx
import {
  useTable,
  DataTableBody,
  DataPagination,
  DataTableAction,
} from "@/core/components/table/data-table";

function CustomTable() {
  const tableState = useTable({
    columns,
    rows: data,
    defaultViewMode: DataViewMode.list,
    pageSize: 20,
    filterableKeys: ["name", "email", "role"],
  });

  return (
    <div className="space-y-4">
      <DataTableAction
        tableState={tableState}
        tableHeading="Custom Table"
        showViewToggle={false}
      >
        <Button onClick={handleExport}>Export</Button>
      </DataTableAction>

      <DataTableBody
        table={tableState.table}
        emptyMessage="No data available"
        isLoading={false}
      />

      <DataPagination
        table={tableState.table}
        showEntryCount={true}
        showPageSizeOptions={true}
      />
    </div>
  );
}
```

## Fetcher Utilities

### createSimpleFetcher

A simplified fetcher for standard REST APIs:

```tsx
const fetcher = createSimpleFetcher(apiGetUsers, {
  dataPath: "data.users",
  totalPath: "data.totalRecords",
  filterMapping: {
    status: "user_status",
    role: "user_role",
  },
});
```

### createGenericFetcher

A more flexible fetcher for custom API structures:

```tsx
const fetcher = createGenericFetcher(apiGetOrders, {
  dataPath: "orders",
  totalPath: "pagination.total",
  pageParam: "page",
  limitParam: "per_page",
  searchParam: "q",
  sortByParam: "sort",
  orderParam: "direction",
  filterMapping: {
    status: "order_status",
    createdAt: (value) => ({
      createdFrom: value.from,
      createdTo: value.to,
    }),
  },
});
```

## Configuration Options

### Page Sizes

Default page sizes: `[5, 10, 20, 50]`

### Search Debouncing

Default search debounce: `400ms`

### Storage Keys

- View mode persistence uses localStorage
- Custom storage keys for multiple tables
- Format: `viewMode::{storageKey}`

### Query Keys

- Server-side tables use React Query for caching
- Custom prefixes for independent table caching
- Automatic cache invalidation on filter/sort changes

## Styling & Customization

### CSS Classes

- Uses Tailwind CSS for styling
- Responsive grid layouts
- Hover effects and transitions
- Loading skeleton animations

### Custom Styling

```tsx
<DataTable
  className="custom-table"
  bodyProps={{
    className: "custom-body",
  }}
  actionProps={{
    className: "custom-actions",
  }}
  paginationProps={{
    className: "custom-pagination",
  }}
/>
```

## Performance Features

### Client-Side

- Efficient filtering and sorting
- Pagination with configurable page sizes
- Column visibility management

### Server-Side

- Debounced search to reduce API calls
- React Query integration for caching
- Automatic pagination reset on filter changes
- Optimized re-renders with useMemo

## Accessibility

- ARIA labels for sortable headers
- Keyboard navigation support
- Screen reader friendly
- Semantic HTML structure

## Browser Support

- Modern browsers with ES6+ support
- React 18+
- TypeScript 4.5+

## Dependencies

- `@tanstack/react-table` - Table functionality
- `@tanstack/react-query` - Server-side data fetching
- `@heroicons/react` - Icons
- Custom UI components (Button, Input, Select, etc.)

## Migration from v1

If upgrading from an older version:

1. Replace `useDataTable` with `useTable`
2. Update component imports to use new names
3. Review server-side configuration if applicable
4. Update any custom styling classes

## Troubleshooting

### Common Issues

1. **Table not rendering**: Check if columns are properly defined
2. **Server-side not working**: Ensure `isServerSide` and `fetcher` are set
3. **Sorting issues**: Verify column definitions have proper accessors
4. **Performance problems**: Use `filterableKeys` to limit search scope

### Debug Mode

Enable React DevTools to inspect table state and debug issues.

## Contributing

When contributing to this component:

1. Maintain TypeScript types
2. Add comprehensive tests
3. Update documentation
4. Follow existing code patterns
5. Test both client and server-side modes

## License

This component is part of the Skinbb Web Industry project.
